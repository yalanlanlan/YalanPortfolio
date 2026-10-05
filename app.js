const CONFIG = {
  sheetId: "1ruHwmGddPjtYLAeccyI1-_7KmIXfXoGUCN8aheEkUMg",
  sheets: { projects: "Projects", media: "Media", links: "Links", paintings: "Paintings" },
  timeout: 9000,
};
const OLD_FAVICON = "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAn8D//wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAP+fwP//n8D//5/A//8AAAD/AAAA/wAAAP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAn8D//5/A//+fwP//n8D//wAAAP8AAAD/AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJ/A//+fwP//n8D//5/A//8AAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAAAAAAAAAAACfwP//n8D//5/A//+fwP//n8D//wAAAP8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/wAAAOMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP//AAD+BwAA/gMAAP4DAAD4AwAA/gMAAP4DAADeAwAA398AAN/fAAD//wAA//8AAPj/AAD//wAA//8AAA==";

const PROTECTED_PROJECTS = { "the-water-dancer": "4013460f" };
const unlockedProjects = new Set();
const app = document.querySelector("#app");
const cache = new Map();
const state = { projects: [], media: [], links: [], paintings: [], source: "loading" };
let activeArchiveSection = "";
let lastTrackedPage = "";
let lastTrackedProject = "";

const fieldAliases = {
  slug: ["slug", "project_slug", "id"], title: ["title", "project", "name"],
  section: ["section", "type", "portfolio"], category: ["category", "categories", "filter"],
  featured: ["featured"],
  show: ["show", "visible", "display", "published", "publish", "顯示", "是否顯示"],
  order: ["order", "sort", "sequence"], year: ["year", "date"],
  medium: ["medium", "media", "material", "materials"], dimensions: ["dimensions", "dimension", "size"],
  cover_image: ["cover_image", "cover", "thumbnail", "image"],
  description: ["description", "body", "long_description"],
  short_description: ["short_description", "summary", "intro"],
  client: ["client"], role: ["role"], credits: ["credits", "credit"],
  project_slug: ["project_slug", "slug", "project"], url: ["url", "image_url", "artwork_url", "painting_url", "media_url", "image", "image_link", "href", "link", "link_url"],
  media_type: ["media_type", "type"], caption: ["caption", "alt", "description"],
  layout: ["layout", "display_layout", "display_size", "width"],
  aspect_ratio: ["aspect_ratio", "aspect ratio", "ratio"],
  media_width: ["media_width", "image_width", "pixel_width"],
  media_height: ["media_height", "image_height", "pixel_height"],
  link_label: ["link_label", "label", "text", "title", "name"],
};

function key(value = "") { return String(value).trim().toLowerCase().replace(/[\s-]+/g, "_"); }
function projectKey(value = "") { return key(value).replace(/_20\d{2}$/, ""); }
function sameProject(a = "", b = "") { return projectKey(a) === projectKey(b); }
function val(row, name) {
  const normalized = Object.fromEntries(Object.entries(row).map(([k, v]) => [key(k), v]));
  for (const alias of fieldAliases[name] || [name]) if (normalized[key(alias)] !== undefined) return String(normalized[key(alias)] ?? "").trim();
  return "";
}
function esc(value = "") { return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]); }
function route(path) { return `#${path}`; }
function analyticsPath() { return `${location.pathname}${location.search}${location.hash || "#/"}`; }
function pushAnalytics(event, values = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...values });
}
function trackCurrentView(project = null) {
  const pagePath = analyticsPath();
  if (lastTrackedPage !== pagePath) {
    lastTrackedPage = pagePath;
    pushAnalytics("page_view", { page_title: document.title, page_location: location.href, page_path: pagePath });
  }
  if (!project) { lastTrackedProject = ""; return; }
  const slug = val(project, "slug");
  const projectKey = `${sectionOf(project)}:${slug}:${pagePath}`;
  if (lastTrackedProject === projectKey) return;
  lastTrackedProject = projectKey;
  pushAnalytics("project_view", { project_slug: slug, project_title: val(project, "title"), project_section: sectionOf(project) });
}
function safeUrl(value = "") {
  if (!value) return "";
  try { const u = new URL(value, location.href); return ["http:", "https:", "data:", "blob:"].includes(u.protocol) ? u.href : ""; } catch { return ""; }
}
function artworkUrl(value = "") {
  const url = safeUrl(value); if (!url) return "";
  const driveId = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([-\w]+)/)?.[1];
  return driveId ? `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000` : url;
}
function mediaIsVideo(row) { return /video|vimeo|youtube|youtu\.be/.test(`${val(row,"media_type")} ${val(row,"url")}`.toLowerCase()); }
function embedUrl(value = "") {
  const url=safeUrl(value); if(!url)return "";
  try{
    const parsed=new URL(url);let id="";
    if(/(^|\.)youtu\.be$/.test(parsed.hostname))id=parsed.pathname.split("/").filter(Boolean)[0]||"";
    if(/(^|\.)youtube\.com$/.test(parsed.hostname)||/(^|\.)youtube-nocookie\.com$/.test(parsed.hostname)){
      id=parsed.searchParams.get("v")||parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1]||"";
    }
    if(id)return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
    const vimeoId=parsed.hostname.includes("vimeo.com")?parsed.pathname.match(/(?:video\/)?(\d+)/)?.[1]:"";
    if(vimeoId)return `https://player.vimeo.com/video/${vimeoId}`;
  }catch{}
  return url;
}
function isVisible(row) {
  const raw = val(row, "show").toLowerCase();
  return ["true", "yes", "y", "1", "✓", "✔", "show", "visible", "published", "顯示", "是"].includes(raw);
}
function isFeatured(row) {
  return val(row, "featured").toLowerCase() === "true";
}
function isContentVisible(row) {
  const raw=val(row,"show").toLowerCase();
  return raw==="" || !["false","no","n","0","✗","hidden","hide","否"].includes(raw);
}
function cell(cell) { return cell?.f ?? (cell?.v == null ? "" : String(cell.v)); }
function normalize(payload) {
  const rows = payload?.table?.rows || [];
  const labels = (payload?.table?.cols || []).map(c => String(c.label || c.id || "").trim());
  const labelsContainFields = labels.some(label => ["slug", "project_slug", "title", "show", "published"].includes(key(label)));
  const headers = labelsContainFields ? labels : (rows[0]?.c || []).map(cell);
  const body = labelsContainFields ? rows : rows.slice(1);
  return body.map(row => Object.fromEntries(headers.map((h, i) => [h, cell(row.c?.[i])]))).filter(row => Object.values(row).some(Boolean));
}
function jsonp(sheet) {
  if (cache.has(sheet)) return cache.get(sheet);
  const request = new Promise((resolve, reject) => {
    const callback = `yw_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => done(new Error("timeout")), CONFIG.timeout);
    function done(error, result) { clearTimeout(timer); delete window[callback]; script.remove(); error ? reject(error) : resolve(result); }
    window[callback] = response => done(null, normalize(response));
    script.onerror = () => done(new Error("network"));
    script.src = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/gviz/tq?tqx=out:json;responseHandler:${callback}&headers=1&sheet=${encodeURIComponent(sheet)}&t=${Date.now()}`;
    document.head.appendChild(script);
  });
  cache.set(sheet, request);
  return request;
}
async function jsonpFirst(sheets) {
  for (const sheet of sheets) {
    try { const rows = await jsonp(sheet); if (rows.length) return rows; } catch {}
  }
  return [];
}
async function loadData() {
  const backup = window.YALAN_BACKUP || { projects: [], media: [], links: [], paintings: [] };
  let saved={};
  try{saved=JSON.parse(localStorage.getItem("yw-portfolio-cache-v1")||"{}")||{}}catch{}
  const initial=(backup.projects?.length?backup:saved);
  state.projects = initial.projects || [];
  state.media = initial.media || [];
  state.links = initial.links || [];
  state.paintings = initial.paintings || [];
  state.source = backup.projects?.length ? "backup" : (saved.projects?.length ? "cache" : "backup");
  renderRoute();
  try {
    const [projects, media, links, paintings] = await Promise.all([jsonp(CONFIG.sheets.projects), jsonp(CONFIG.sheets.media), jsonp(CONFIG.sheets.links).catch(()=>[]), jsonpFirst([CONFIG.sheets.paintings,"Painting","Paintings Gallery","Paintings 畫廊"])]);
    if (!projects.some(row => val(row, "slug") || val(row, "title"))) throw new Error("invalid sheet");
    state.projects = projects;
    state.media = media;
    state.links = links;
    state.paintings = paintings;
    state.source = "sheet";
    try{localStorage.setItem("yw-portfolio-cache-v1",JSON.stringify({projects,media,links,paintings,savedAt:new Date().toISOString()}))}catch{}
    renderRoute();
  } catch (error) {
    console.info("Portfolio is using its built-in backup.", error.message);
  }
}

function visibleProjects() {
  return state.projects.filter(p => isFeatured(p) && val(p, "slug") && val(p, "title"))
    .sort((a,b) => (Number(val(a,"order")) || 9999) - (Number(val(b,"order")) || 9999));
}
function splitCategories(row) { return val(row, "category").split(/[,/|]/).map(s => s.trim()).filter(Boolean); }
function categoryLabel(row) { return splitCategories(row).join("・") || sectionOf(row); }
function filterCategories(projects) {
  if(projects.some(project=>sectionOf(project)==="Art")) return ["All","Installation","Video","Painting/Drawing"];
  const redundant = new Set(["motion graphics", "visual design"]);
  return ["All", ...new Set(projects.flatMap(splitCategories).filter(category => !redundant.has(category.toLowerCase())))];
}
function matchesFilter(project, filter) {
  if(filter==="All") return true;
  const categories=val(project,"category").toLowerCase();
  if(filter==="Painting/Drawing") return /painting|drawing/.test(categories);
  return sectionOf(project)==="Art" ? categories.includes(filter.toLowerCase()) : splitCategories(project).includes(filter);
}
function passwordHash(value) { let hash=2166136261; for(const char of value){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)} return (hash>>>0).toString(16); }
function isLocked(slug) { let saved=false; try{saved=sessionStorage.getItem(`yw-unlocked-${slug}`)==="true"}catch{} return Boolean(PROTECTED_PROJECTS[slug]) && !saved && !unlockedProjects.has(slug); }
function sectionOf(row) {
  const s = val(row, "section").toLowerCase();
  return /art|藝術/.test(s) ? "Art" : "Design";
}
function header(minimal = false) {
  return `<header class="site-header"><a class="intro-mark ${minimal?"intro-minimal":""}" href="${route("/")}" aria-label="Yalan Wen home"><span class="home-logo" aria-hidden="true"><img src="https://res.cloudinary.com/ez4bug1c/image/upload/v1791139982/logo2.gif" alt=""><img src="https://res.cloudinary.com/ez4bug1c/image/upload/v1791139976/logo2hover.gif" alt=""></span></a>${minimal?`<a class="home-about" href="${route("/about")}">About</a>`:""}<button class="menu-button" type="button" aria-expanded="false">Menu</button><button class="menu-backdrop" type="button" aria-label="Close menu"></button><nav class="main-nav ${minimal?"home-menu":""}" aria-label="Main navigation"><a class="menu-star" href="${route("/")}" aria-label="Home">✦</a><a class="nav-design" href="${route("/design")}"><small>01</small><strong>Design</strong><span>設計　デザイン　&#x2197;&#xFE0E;</span></a><a class="nav-art" href="${route("/art")}"><small>02</small><strong>Art</strong><span>藝術　アート　&#x2197;&#xFE0E;</span></a><a class="nav-about" href="${route("/about")}"><small>03</small><strong>About</strong><span></span></a></nav></header>`;
}
function footer() { return `<footer class="site-footer"><span>© ${new Date().getFullYear()} Yalan Wen</span><nav><a href="https://www.instagram.com/yalanlanlan/" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.linkedin.com/in/yalan-wen-822058a9/" target="_blank" rel="noreferrer">LinkedIn</a><a href="mailto:ywen5@sva.edu">Email</a></nav></footer>`; }
function status() { return state.source === "backup" ? `<p class="data-note">Showing the saved archive. Live updates are temporarily unavailable.</p>` : ""; }
function setupCommon() {
  window.onscroll = null;
  document.onkeydown = null;
  document.onclick = null;
  document.querySelector("main")?.classList.add("route-enter");
  const button = document.querySelector(".menu-button");
  const backdrop = document.querySelector(".menu-backdrop");
  if(button&&innerWidth<=650){const main=document.querySelector("main");button.classList.toggle("menu-open-light",main?.classList.contains("landing")||main?.classList.contains("is-art"));document.body.appendChild(button)}
  const closeMenu=()=>{document.body.classList.remove("menu-open");if(button){button.setAttribute("aria-expanded","false");button.textContent="Menu"}};
  if (button) button.onclick = () => { const open = document.body.classList.toggle("menu-open"); button.setAttribute("aria-expanded", String(open)); button.textContent=open?"Close":"Menu"; };
  if(backdrop)backdrop.onclick=closeMenu;
  document.querySelectorAll("a[href^='#']").forEach(a => a.addEventListener("click", closeMenu));
  [[".nav-design","/design","Design"],[".nav-art","/art","Art"]].forEach(([selector,path,section])=>{
    const link=document.querySelector(`.main-nav ${selector}`);if(!link)return;
    link.addEventListener("click",event=>{
      const currentPath=((location.hash.slice(1)||"/").split("?")[0].replace(/\/+$/,"")||"/");
      if(innerWidth<=650||currentPath!==path)return;
      event.preventDefault();closeMenu();activeArchiveSection="";
      try{sessionStorage.setItem("yw-sidebar-collapsed","false");sessionStorage.setItem(`yw-${section.toLowerCase()}-view`,"gallery")}catch{}
      history.replaceState(null,"",route(path));renderRoute();
    });
  });
}

function paintingRows(){return state.paintings.filter(row=>isContentVisible(row)&&artworkUrl(val(row,"url"))).sort((a,b)=>(Number(val(a,"order"))||9999)-(Number(val(b,"order"))||9999))}
function paintingGallery(){
  const paintings=paintingRows(); if(!paintings.length)return "";
  return `<article class="paintings-gallery" id="paintings"><div class="painting-grid">${paintings.map((painting,index)=>{const url=artworkUrl(val(painting,"url"));const caption=val(painting,"title")||val(painting,"caption")||`Painting ${index+1}`;return `<button class="painting-card" type="button" data-painting-index="${index}" aria-label="View ${esc(caption)}"><img src="${esc(url)}" alt="${esc(caption)}" loading="lazy"></button>`}).join("")}</div><div class="painting-lightbox" role="dialog" aria-modal="true" aria-label="Painting preview" hidden><button class="painting-close" type="button" aria-label="Close painting"><span>×</span></button><button class="painting-arrow painting-prev" type="button" aria-label="Previous painting"><span>←</span></button><figure><div class="painting-stage"><img alt=""></div><figcaption aria-live="polite"><h2></h2><dl><div><dt>Year</dt><dd data-painting-meta="year"></dd></div><div><dt>Medium</dt><dd data-painting-meta="medium"></dd></div><div><dt>Dimensions</dt><dd data-painting-meta="dimensions"></dd></div></dl></figcaption></figure><button class="painting-arrow painting-next" type="button" aria-label="Next painting"><span>→</span></button></div></article>`;
}
function setupPaintingGallery(){
  const lightbox=document.querySelector(".painting-lightbox");if(!lightbox)return;
  document.body.appendChild(lightbox);
  const paintings=paintingRows();let current=0;let swipeStart=0;let swipePointer=null;let swipeDistance=0;let suppressBackdropClick=false;
  const close=()=>{lightbox.hidden=true;document.body.classList.remove("lightbox-open")};
  const show=index=>{current=(index+paintings.length)%paintings.length;const painting=paintings[current],title=val(painting,"title")||val(painting,"caption")||`Painting ${current+1}`,url=artworkUrl(val(painting,"url"));const image=lightbox.querySelector("img");image.style.transform="";image.src=url;image.alt=title;lightbox.querySelector("h2").textContent=title;["year","medium","dimensions"].forEach(field=>{const node=lightbox.querySelector(`[data-painting-meta="${field}"]`),value=val(painting,field);node.textContent=value;node.parentElement.hidden=!value});lightbox.hidden=false;document.body.classList.add("lightbox-open")};
  document.querySelectorAll(".painting-card").forEach(card=>card.onclick=()=>show(Number(card.dataset.paintingIndex)));
  lightbox.querySelector(".painting-prev").onclick=()=>show(current-1);lightbox.querySelector(".painting-next").onclick=()=>show(current+1);lightbox.querySelector(".painting-close").onclick=close;lightbox.onclick=event=>{if(suppressBackdropClick){suppressBackdropClick=false;return}if(!event.target.closest("img, figcaption, button"))close()};
  lightbox.addEventListener("pointerdown",event=>{if(event.target.closest("button,figcaption"))return;swipeStart=event.clientX;swipePointer=event.pointerId;swipeDistance=0;lightbox.setPointerCapture?.(event.pointerId);lightbox.classList.add("is-dragging")});
  lightbox.addEventListener("pointermove",event=>{if(event.pointerId!==swipePointer)return;swipeDistance=event.clientX-swipeStart;const image=lightbox.querySelector(".painting-stage img");image.style.transform=`translateX(${Math.max(-110,Math.min(110,swipeDistance*.55))}px) rotate(${swipeDistance*.008}deg)`;if(Math.abs(swipeDistance)>8)event.preventDefault()});
  const finishSwipe=event=>{if(event.pointerId!==swipePointer)return;const distance=swipeDistance;swipePointer=null;swipeStart=0;swipeDistance=0;lightbox.classList.remove("is-dragging");const image=lightbox.querySelector(".painting-stage img");image.style.transform="";if(Math.abs(distance)>45){suppressBackdropClick=true;show(current+(distance<0?1:-1))}else if(Math.abs(distance)>8)suppressBackdropClick=true};
  lightbox.addEventListener("pointerup",finishSwipe);lightbox.addEventListener("pointercancel",finishSwipe);
  document.onkeydown=event=>{if(lightbox.hidden)return;if(event.key==="Escape")close();if(event.key==="ArrowLeft")show(current-1);if(event.key==="ArrowRight")show(current+1)};
}

function renderHome() {
  document.title = "Yalan Wen";
  app.innerHTML = `<main class="landing">${header(true)}<div id="floating-art" aria-hidden="true"></div><section class="home-intro"><p>Yalan Wen is a Taiwanese visual artist and multidisciplinary designer based in New York City. Her work moves across visual design, motion, computational media, and painting.</p></section><nav class="entry-links" aria-label="Portfolio sections"><a href="${route("/design")}"><small>01</small><strong>Design</strong><span>設計　デザイン　&#x2197;&#xFE0E;</span></a><a href="${route("/art")}"><small>02</small><strong>Art</strong><span>藝術　アート　&#x2197;&#xFE0E;</span></a></nav>${footer()}</main>`;
  startMotion(); setupCommon();
}
function renderAbout(){
  document.title="About — Yalan Wen";
  app.innerHTML=`<main class="about-page">${header()}<section class="about-layout"><div class="about-grid"><article><h1>Bio.</h1><p>Yalan Wen is a Taiwanese artist and designer based in New York City. Working across computational imagery, media installations, motion, and painting, her practice draws from close observations of nature to explore subtle emotions and philosophical questions beneath the surface.</p><p>With a foundation in graphic design, she further developed her visual language through the MFA Computer Arts program at the School of Visual Arts. She has presented her practice at EVA London, Queens College at the City University of New York, and the School of Visual Arts.</p><p>Her work has been exhibited internationally at CADAF Art Fair, the SIGGRAPH Asia Art Gallery, Kaohsiung Museum of Fine Arts, CultureHub’s Re-Fest, Crossing Art Gallery, Valid World Hall Gallery, and West Harlem Art Fund on Governors Island. She is a former Artist Fellow-in-Residence at the National Arts Club.</p></article><figure><img src="https://res.cloudinary.com/ez4bug1c/image/upload/f_auto,q_auto/artist-profile-yalan" alt="Portrait of Yalan Wen" loading="lazy"></figure></div><div class="about-contact"><div><b>CV</b><p>Available upon request</p></div><nav><a href="mailto:ywen5@sva.edu">Email</a><a href="https://www.instagram.com/yalanlanlan/" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.linkedin.com/in/yalan-wen-822058a9/" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://vimeo.com/user57460687" target="_blank" rel="noreferrer">Vimeo</a></nav></div></section>${footer()}</main>`;
  setupCommon();
}
function projectPager(project,projects) {
  if(!projects||projects.length<2)return "";
  const index=projects.indexOf(project),previous=index>0?projects[index-1]:null,next=index<projects.length-1?projects[index+1]:null;
  const base=sectionOf(project)==="Art"?"/art":"/design";
  const card=(item,label,arrow)=>{if(!item)return "";const image=safeUrl(val(item,"cover_image"));return `<a class="project-step project-step-${label.toLowerCase()}" data-project-step="${esc(val(item,"slug"))}" href="${route(`${base}?project=${encodeURIComponent(val(item,"slug"))}`)}">${image?`<img src="${esc(image)}" alt="" loading="lazy" decoding="async">`:""}<span><b>${arrow}</b> ${label}</span><strong>${esc(val(item,"title"))}</strong></a>`};
  return `<nav class="project-pager" aria-label="Adjacent projects">${card(previous,"Previous","←")}${card(next,"Next","→")}</nav>`;
}
function archiveProject(project,navigationProjects=[]) {
  const slug=val(project,"slug");
  const isArt=sectionOf(project)==="Art";
  if(isLocked(slug)) return lockedProject(project);
  const image=safeUrl(val(project,"cover_image"));
  const media=state.media.filter(m=>isContentVisible(m)&&sameProject(val(m,"project_slug"),slug)&&val(m,"url")).sort((a,b)=>(Number(val(a,"order"))||9999)-(Number(val(b,"order"))||9999));
  const videoMedia=media.filter(mediaIsVideo),imageMedia=media.filter(m=>!mediaIsVideo(m));
  const links=state.links.filter(link=>isContentVisible(link)&&sameProject(val(link,"project_slug"),slug)&&val(link,"url")).sort((a,b)=>(Number(val(a,"order"))||9999)-(Number(val(b,"order"))||9999));
  const facts=(isArt?[["Category",val(project,"category")],["Dimensions",val(project,"dimensions")],["Medium",val(project,"medium")]]:[["Deliverables",val(project,"category")],["Client",val(project,"client")],["Role",val(project,"role")]]).filter(x=>x[1]);
  const gallery=slug.toLowerCase()==="paintings"?paintingGallery():"";
  return `<article class="split-project" id="project-${esc(slug)}" data-project-section="${esc(slug)}"><header><h1>${esc(val(project,"title"))}</h1><div class="project-overview">${image?`<figure class="split-cover"><img src="${esc(image)}" alt="${esc(val(project,"title"))}" loading="lazy" decoding="async"></figure>`:""}<dl>${facts.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div></header>${videoMedia.length?`<section class="split-media split-media-video">${videoMedia.map(m=>mediaHtml(m,media.indexOf(m),project)).join("")}</section>`:""}<section class="split-copy${isArt?" art-summary is-collapsed":""}"><p>${esc(val(project,"description")||val(project,"short_description"))}</p>${isArt?`<button class="summary-toggle" type="button" aria-expanded="false">Read more +</button>`:""}${links.length?`<nav class="project-links">${links.map(link=>`<a href="${esc(safeUrl(val(link,"url")))}" target="_blank" rel="noreferrer">${esc(val(link,"link_label")||"Visit link")} &#x2197;&#xFE0E;</a>`).join("")}</nav>`:""}</section>${imageMedia.length?`<section class="split-media">${imageMedia.map(m=>mediaHtml(m,media.indexOf(m),project)).join("")}</section>`:""}${gallery}${val(project,"credits")?`<section class="split-credits"><b>Credits</b><p>${esc(val(project,"credits"))}</p></section>`:""}${projectPager(project,navigationProjects)}</article>`;
}
function lockedProject(project) {
  const slug=val(project,"slug");
  return `<article class="split-project protected-project" id="project-${esc(slug)}" data-project-section="${esc(slug)}"><header><p>Protected project</p><h1>${esc(val(project,"title"))}</h1></header><form class="password-form" data-project-password="${esc(slug)}"><label for="password-${esc(slug)}">Enter password to view this project</label><div><input id="password-${esc(slug)}" name="password" type="password" autocomplete="current-password" required><button type="submit">View project</button></div><p class="password-error" role="alert" aria-live="polite"></p></form></article>`;
}
function setupProjectLocks() {
  document.querySelectorAll("[data-project-password]").forEach(form=>form.addEventListener("submit",event=>{
    event.preventDefault();
    const slug=form.dataset.projectPassword;
    const input=form.elements.password;
    if(passwordHash(input.value)===PROTECTED_PROJECTS[slug]){unlockedProjects.add(slug);try{sessionStorage.setItem(`yw-unlocked-${slug}`,"true")}catch{}renderRoute()}
    else{form.querySelector(".password-error").textContent="Incorrect password. Please try again.";input.select()}
  }));
}
function setupArtSummaries() {
  document.querySelectorAll(".art-summary .summary-toggle").forEach(button=>button.onclick=()=>{const summary=button.closest(".art-summary"),expanded=summary.classList.toggle("is-expanded");summary.classList.toggle("is-collapsed",!expanded);button.setAttribute("aria-expanded",String(expanded));button.textContent=expanded?"Show less −":"Read more +"});
}
function renderArchive(section, requestedSlug="", preservePreferences=false) {
  const all = visibleProjects().filter(p => sectionOf(p) === section);
  const categories = filterCategories(all);
  let selected = all.find(p=>sameProject(val(p,"slug"),requestedSlug)) || all[0];
  let activeSlug = requestedSlug&&all.some(p=>sameProject(val(p,"slug"),requestedSlug)) ? val(selected,"slug") : "";
  let sidebarCollapsed=false,preferredView="";if(preservePreferences)try{sidebarCollapsed=innerWidth>650&&sessionStorage.getItem("yw-sidebar-collapsed")==="true";preferredView=sessionStorage.getItem(`yw-${section.toLowerCase()}-view`)||""}catch{}
  if(sidebarCollapsed&&section==="Design"&&!activeSlug&&selected)activeSlug=val(selected,"slug");
  let settleTimer = 0;
  document.title = activeSlug&&selected ? `${val(selected,"title")} — Yalan Wen` : `${section} — Yalan Wen`;
  const colors=["#111","#e86042","#9727b4","#e9a800","#4b48ce"];
  const hasPaintingsProject=all.some(project=>val(project,"slug").toLowerCase()==="paintings");
  const hasPaintingsRow=state.projects.some(project=>val(project,"slug").toLowerCase()==="paintings");
  const initialDetail = section === "Design" ? (selected ? archiveProject(selected,all) : "") : all.map(project=>archiveProject(project)).join("")+((hasPaintingsProject||hasPaintingsRow)?"":paintingGallery());
  app.innerHTML = `<main class="split-page ${section==="Art"?"is-art":"is-design"} ${activeSlug?"selection-active":""} ${activeSlug&&section==="Design"?"project-open":""} ${sidebarCollapsed?"index-collapsed":""}">${header()}<section class="split-layout"><aside class="split-index"><header><h2>${section === "Design" ? "Selected Design Work" : "Selected Artworks"}</h2><button class="collapse-index" type="button" aria-label="${sidebarCollapsed?"Expand":"Collapse"} project sidebar" aria-expanded="${!sidebarCollapsed}"><svg viewBox="0 0 6.87 8.84" aria-hidden="true"><path d="M6.59 8.84a.28.28 0 0 1-.28-.28V.28a.28.28 0 1 1 .56 0v8.28c0 .15-.13.28-.28.28Z"/><path d="M6.59 4.7H1.04a.28.28 0 1 1 0-.56h5.55a.28.28 0 1 1 0 .56Z"/><path d="M1.15 4.42c.3.3.45.91.46 1.32A4.42 4.42 0 0 0 0 4.42c.66-.26 1.17-.78 1.62-1.32-.04.45-.15.99-.46 1.32Z"/></svg></button></header><div class="index-tools"><label class="filter-select" style="--filter-color:${colors[0]}"><span>Filter</span><select aria-label="Filter projects">${categories.map((c,i)=>`<option value="${esc(c)}" data-color="${colors[i%colors.length]}">${esc(c)}</option>`).join("")}</select></label><div class="view-toggle" aria-label="Change project view"><button class="expand-index" type="button" aria-label="Expand project gallery" title="Expand gallery"><span>↔</span></button><div class="view-switch" role="group" aria-label="Project view"><span class="view-switch-thumb" aria-hidden="true"></span><button class="list-toggle" type="button" aria-label="List view" aria-pressed="false"><i></i></button><button class="gallery-toggle" type="button" aria-label="Gallery view" aria-pressed="true"><i></i></button></div></div></div><p class="count"></p><div class="project-list gallery-view"></div><div class="hover-preview" aria-hidden="true"><img alt=""></div>${status()}</aside><section class="split-detail">${initialDetail||`<div class="split-empty"><p>No featured projects yet.</p></div>`}</section></section><button class="back-to-top" type="button" aria-label="Back to top"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6.5 10.5 12 5l5.5 5.5"/></svg></button>${footer()}</main>`;
  if(section==="Art"&&!activeSlug)document.querySelector(".split-page").classList.add("art-expanded");
  const railControls=document.createElement("div"),collapseControl=document.querySelector(".collapse-index");railControls.className="index-rail-controls";const closeGlyph=`<svg class="sidebar-glyph sidebar-glyph-close" viewBox="0 0 7.41 7.41" aria-hidden="true"><path class="sidebar-arrow" d="M5.16,3.41c.19-.31.36-.56.5-.83.06-.13.28-.3.05-.44-.15-.09-.29,.04-.39,.16-.42,.47-.88,.9-1.44,1.21-.17,.09-.23,.26-.06,.36.63,.35,1.13,.85,1.62,1.35.09,.09.22,.11.31,.04.13-.09.02-.21-.03-.3-.18-.32-.37-.64-.57-.99,0,0-.12-.19-.12-.26,0-.08.13-.3.13-.3Z"/><rect x=".33" y=".33" width="6.76" height="6.76"/><line x1="2.76" y1=".33" x2="2.76" y2="7.09"/></svg>`;const openGlyph=`<svg class="sidebar-glyph sidebar-glyph-open" viewBox="0 0 7.41 7.41" aria-hidden="true"><path class="sidebar-arrow" d="M4.35,4c-.19,.31-.36,.56-.5,.83-.06,.13-.28,.3-.05,.44.15,.09.29-.04.39-.16.42-.47.88-.9,1.44-1.21.17-.09.23-.26.06-.36-.63-.35-1.13-.85-1.62-1.35-.09-.09-.22-.11-.31-.04-.13,.09-.02,.21.03,.3.18,.32,.37,.64,.57,.99,0,0,.12,.19,.12,.26,0,.08-.13,.3-.13,.3Z"/><rect x=".33" y=".33" width="6.76" height="6.76"/><line x1="2.76" y1=".33" x2="2.76" y2="7.09"/></svg>`;collapseControl.innerHTML=closeGlyph+openGlyph;railControls.append(collapseControl);document.querySelector(".split-index").append(railControls);
  collapseControl.innerHTML=`<svg class="sidebar-glyph sidebar-glyph-single" viewBox="0 0 7.26 7.26" aria-hidden="true"><rect x=".25" y=".25" width="6.76" height="6.76" rx=".67" ry=".67"/><line x1="2.69" y1=".25" x2="2.69" y2="7.01"/></svg>`;
  const scrollArtTarget=(target,delay=0)=>{if(!target)return;const move=()=>{const detail=document.querySelector(".split-detail");if(!detail||!target.isConnected)return;const locate=()=>target.getBoundingClientRect().top-detail.getBoundingClientRect().top+detail.scrollTop;detail.scrollTo({top:locate(),behavior:"smooth"});setTimeout(()=>{if(!target.isConnected)return;const correction=locate();if(Math.abs(detail.scrollTop-correction)>3)detail.scrollTo({top:correction,behavior:"smooth"})},520)};delay?setTimeout(move,delay):requestAnimationFrame(move)};
  const scrollMobileTarget=target=>{const heading=target?.querySelector("h1");if(!heading)return;const locate=()=>Math.max(0,scrollY+heading.getBoundingClientRect().top-116);scrollTo({top:locate(),behavior:"smooth"});setTimeout(()=>{if(!heading.isConnected)return;const correction=locate();if(Math.abs(scrollY-correction)>3)scrollTo({top:correction,behavior:"smooth"})},520)};
  const jumpToProject = project => {
    const slug=val(project,"slug");
    const page=document.querySelector(".split-page");
    const base=section==="Art"?"/art":"/design";
    if(activeSlug===slug){
      if(innerWidth<=650){scrollMobileTarget(document.querySelector(`#project-${CSS.escape(slug)}`));return}
      activeSlug="";
      document.title=`${section} — Yalan Wen`;
      page.classList.remove("selection-active","index-settling");
      document.querySelectorAll(".project-row").forEach(row=>row.setAttribute("aria-current","false"));
      document.querySelector(".hover-preview")?.classList.remove("visible");
      history.replaceState(null,"",route(base));
      trackCurrentView();
      return;
    }
    selected=project;
    activeSlug=slug;
    document.title=`${val(project,"title")} — Yalan Wen`;
    const firstArtCollapse=section==="Art"&&page.classList.contains("art-expanded");
    if(firstArtCollapse){clearTimeout(settleTimer);page.classList.add("index-settling");document.querySelector(".hover-preview")?.classList.remove("visible");settleTimer=setTimeout(()=>page.classList.remove("index-settling"),820)}
    page.classList.add("selection-active");
    page.classList.remove("art-expanded");
    document.querySelectorAll(".project-row").forEach(row=>row.setAttribute("aria-current",String(row.dataset.slug===slug)));
    const detail=document.querySelector(".split-detail");
    if(section==="Design"){
      const isFirstCollapse=!page.classList.contains("project-open")&&innerWidth>650;
      clearTimeout(settleTimer);
      page.classList.add("project-open");
      page.classList.toggle("index-settling",isFirstCollapse);
      document.querySelector(".hover-preview")?.classList.remove("visible");
      if(innerWidth<=650)setView("gallery");
      else if(isFirstCollapse)setView("list");
      detail.innerHTML=archiveProject(project,all); setupProjectLocks(); setupProjectPager();
      if(isFirstCollapse)settleTimer=setTimeout(()=>page.classList.remove("index-settling"),680);
      if(innerWidth<=650) detail.scrollIntoView({behavior:"smooth",block:"start"});
      else detail.scrollTo({top:0,behavior:"smooth"});
    }else{
      if(innerWidth>650&&firstArtCollapse)setView("list");
      let target=document.querySelector(`#project-${CSS.escape(slug)}`);if(!target){detail.innerHTML=archiveProject(project,all);setupProjectLocks();setupArtSummaries();setupProjectPager();target=document.querySelector(`#project-${CSS.escape(slug)}`)}if(target){if(innerWidth<=650)scrollMobileTarget(target);else scrollArtTarget(target)}
    }
    history.replaceState(null,"",route(`${base}?project=${encodeURIComponent(slug)}`));
    trackCurrentView(project);
  };
  const setupProjectPager=()=>document.querySelectorAll(".project-step[data-project-step]").forEach(link=>{link.onclick=event=>{const project=all.find(item=>sameProject(val(item,"slug"),link.dataset.projectStep));if(!project)return;event.preventDefault();jumpToProject(project)}});
  const draw = (filter="All") => {
    const list=document.querySelector(".project-list");
    const oldRects=new Map([...list.querySelectorAll(".project-row")].map(row=>[row.dataset.slug||row.dataset.special,row.getBoundingClientRect()]));
    const rows = all.filter(project=>matchesFilter(project,filter));
    const showPaintings=section==="Art"&&!hasPaintingsProject&&!hasPaintingsRow&&paintingRows().length&&(filter==="All"||filter==="Painting/Drawing");
    document.querySelector(".count").textContent = `${rows.length+(showPaintings?1:0)} projects`;
    const projectMarkup=rows.map((p,i) => {
      const image=safeUrl(val(p,"cover_image"));
      return `<button class="project-row" data-slug="${esc(val(p,"slug"))}" data-image="${esc(image)}" aria-current="${val(p,"slug")===activeSlug}"><span class="row-thumb">${image?`<img src="${esc(image)}" alt="" loading="lazy">`:""}</span><strong>${esc(val(p,"title"))}</strong></button>`;
    }).join("");
    const paintingMarkup=showPaintings?`<button class="project-row" data-special="paintings" aria-current="false"><span class="row-thumb"><img src="${esc(artworkUrl(val(paintingRows()[0],"url")))}" alt="" loading="lazy"></span><strong>Paintings</strong></button>`:"";
    list.innerHTML = projectMarkup+paintingMarkup||`<div class="empty"><p>No featured projects yet.</p></div>`;
    document.querySelectorAll(".project-row").forEach(button=>{
      button.onclick=()=>{if(button.dataset.special==="paintings"){document.querySelector(".split-page").classList.remove("art-expanded");requestAnimationFrame(()=>document.querySelector("#paintings")?.scrollIntoView({behavior:"smooth",block:"start"}))}else jumpToProject(all.find(p=>val(p,"slug")===button.dataset.slug))};
      {
        button.onmouseenter=()=>{const page=document.querySelector(".split-page");const preview=document.querySelector(".hover-preview");if(!page.classList.contains("index-settling")&&!page.classList.contains("sidebar-moving")&&button.dataset.image){preview.querySelector("img").src=button.dataset.image;preview.classList.add("visible")}};
        button.onpointermove=event=>{const preview=document.querySelector(".hover-preview");preview.style.setProperty("--pointer-x",`${event.clientX}px`);preview.style.setProperty("--pointer-y",`${event.clientY}px`)};
        button.onmouseleave=()=>document.querySelector(".hover-preview").classList.remove("visible");
      }
    });
    if(oldRects.size&&!matchMedia("(prefers-reduced-motion: reduce)").matches)requestAnimationFrame(()=>{
      list.querySelectorAll(".project-row").forEach(row=>{
        const key=row.dataset.slug||row.dataset.special,oldRect=oldRects.get(key),newRect=row.getBoundingClientRect();
        const from=oldRect?{transform:`translate(${oldRect.left-newRect.left}px,${oldRect.top-newRect.top}px)`,opacity:1}:{transform:"translateY(12px)",opacity:0};
        row.animate([from,{transform:"translate(0,0)",opacity:1}],{duration:720,easing:"cubic-bezier(.22,.72,.2,1)",fill:"both"});
      });
    });
    if(rows.length&&!rows.includes(selected)) selected=rows[0];
  };
  const select=document.querySelector(".filter-select select");
  select.onchange=()=>{const option=select.selectedOptions[0];select.parentElement.style.setProperty("--filter-color",option.dataset.color);draw(select.value)};
  let viewSwitchTimer;
  const setView=(view,animate=false)=>{
    const list=document.querySelector(".project-list");
    list.classList.toggle("gallery-view",view==="gallery");
    list.classList.toggle("list-view",view==="list");
    const viewSwitch=document.querySelector(".view-switch");
    if(animate&&viewSwitch){
      viewSwitch.classList.remove("is-switching");
      void viewSwitch.offsetWidth;
      viewSwitch.classList.add("is-switching");
      clearTimeout(viewSwitchTimer);
      viewSwitchTimer=setTimeout(()=>viewSwitch.classList.remove("is-switching"),720);
    }
    viewSwitch?.classList.toggle("is-list",view==="list");
    document.querySelector(".gallery-toggle").setAttribute("aria-pressed",String(view==="gallery"));
    document.querySelector(".list-toggle").setAttribute("aria-pressed",String(view==="list"));
    try{sessionStorage.setItem(`yw-${section.toLowerCase()}-view`,view)}catch{}
  };
  document.querySelector(".gallery-toggle").onclick=()=>setView("gallery",true);
  document.querySelector(".list-toggle").onclick=()=>setView("list",true);
  document.querySelector(".collapse-index").onclick=event=>{const page=document.querySelector(".split-page"),detail=document.querySelector(".split-detail"),savedTop=detail.scrollTop,willCollapse=!page.classList.contains("index-collapsed"),wasExpanded=page.classList.contains("art-expanded")||!page.classList.contains("project-open");page.classList.add("sidebar-moving");if(willCollapse&&wasExpanded)page.classList.add("collapsing-expanded");clearTimeout(settleTimer);if(willCollapse&&section==="Art")page.classList.remove("art-expanded");if(willCollapse&&!activeSlug&&selected){activeSlug=val(selected,"slug");document.title=`${val(selected,"title")} — Yalan Wen`;page.classList.add("selection-active");if(section==="Design"){page.classList.add("project-open");detail.innerHTML=archiveProject(selected,all);setupProjectLocks()}document.querySelectorAll(".project-row").forEach(row=>row.setAttribute("aria-current",String(row.dataset.slug===activeSlug)));history.replaceState(null,"",route(`/${section.toLowerCase()}?project=${encodeURIComponent(activeSlug)}`));trackCurrentView(selected)}const collapsed=page.classList.toggle("index-collapsed");requestAnimationFrame(()=>detail.scrollTop=savedTop);settleTimer=setTimeout(()=>{detail.scrollTop=savedTop;page.classList.remove("sidebar-moving","collapsing-expanded")},780);try{sessionStorage.setItem("yw-sidebar-collapsed",String(collapsed))}catch{}event.currentTarget.setAttribute("aria-expanded",String(!collapsed));event.currentTarget.setAttribute("aria-label",collapsed?"Expand project sidebar":"Collapse project sidebar");document.querySelector(".hover-preview")?.classList.remove("visible")};
  document.querySelector(".expand-index").onclick=()=>{const page=document.querySelector(".split-page"),detail=document.querySelector(".split-detail"),isExpanded=section==="Art"?page.classList.contains("art-expanded"):!page.classList.contains("project-open");page.classList.remove("index-settling");if(isExpanded){if(!activeSlug&&selected){activeSlug=val(selected,"slug");page.classList.add("selection-active");document.querySelectorAll(".project-row").forEach(row=>row.setAttribute("aria-current",String(row.dataset.slug===activeSlug)))}if(section==="Art"){page.classList.remove("art-expanded");const target=document.querySelector(`#project-${CSS.escape(activeSlug)}`);if(target)detail.scrollTo({top:target.offsetTop,behavior:"smooth"})}else{page.classList.add("project-open");detail.innerHTML=archiveProject(selected,all);setupProjectLocks();setupProjectPager()}}else if(section==="Art")page.classList.add("art-expanded");else page.classList.remove("project-open");setView("gallery")};
  if(innerWidth<=650)setView("gallery");else if(["gallery","list"].includes(preferredView))setView(preferredView);else if(requestedSlug)setView("list");
  draw(); setupCommon(); setupProjectLocks(); setupPaintingGallery(); setupArtSummaries(); setupProjectPager();
  const backToTop=document.querySelector(".back-to-top");
  if(backToTop){document.body.appendChild(backToTop);backToTop.onclick=()=>scrollTo({top:0,behavior:"smooth"});const updateTopButton=()=>backToTop.classList.toggle("visible",scrollY>600);window.onscroll=updateTopButton;updateTopButton()}
  if(requestedSlug)requestAnimationFrame(()=>{const target=document.querySelector(`#project-${CSS.escape(activeSlug||requestedSlug)}`);if(innerWidth<=650)scrollMobileTarget(target);else if(section==="Art")scrollArtTarget(target,120)});
}
function renderProject(slug) {
  const project = visibleProjects().find(p => sameProject(val(p,"slug"),slug));
  if (!project) return renderNotFound();
  if(isLocked(slug)){document.title=`${val(project,"title")} — Yalan Wen`;app.innerHTML=`<main>${header()}${lockedProject(project)}${footer()}</main>`;setupCommon();setupProjectLocks();return}
  const media = state.media.filter(m => isContentVisible(m) && sameProject(val(m,"project_slug"),slug) && val(m,"url")).sort((a,b)=>(Number(val(a,"order"))||9999)-(Number(val(b,"order"))||9999));
  const videoMedia=media.filter(mediaIsVideo),imageMedia=media.filter(m=>!mediaIsVideo(m));
  const image = safeUrl(val(project,"cover_image"));
  const section = sectionOf(project);
  document.title = `${val(project,"title")} — Yalan Wen`;
  const facts = (section==="Art"?[["Category",val(project,"category")],["Dimensions",val(project,"dimensions")],["Medium",val(project,"medium")]]:[["Deliverables",val(project,"category")],["Client",val(project,"client")],["Role",val(project,"role")]]).filter(x=>x[1]);
  app.innerHTML = `<main>${header()}<article class="work"><header class="work-head"><h1>${esc(val(project,"title"))}</h1><dl>${facts.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></header>${image?`<figure class="hero-image"><img src="${esc(image)}" alt="${esc(val(project,"title"))}"></figure>`:""}${videoMedia.length?`<section class="media-stack media-stack-video">${videoMedia.map(m=>mediaHtml(m,media.indexOf(m),project)).join("")}</section>`:""}<section class="work-copy"><h2>About</h2><p>${esc(val(project,"description")||val(project,"short_description"))}</p></section>${imageMedia.length?`<section class="media-stack">${imageMedia.map(m=>mediaHtml(m,media.indexOf(m),project)).join("")}</section>`:""}${val(project,"credits")?`<section class="work-copy"><h2>Credits</h2><p>${esc(val(project,"credits"))}</p></section>`:""}<a class="back" href="${route(section==="Art"?"/art":"/design")}">← Back to ${section}</a></article>${footer()}</main>`;
  setupCommon();
}
function mediaHtml(m,i,p) {
  const url=safeUrl(val(m,"url")); if(!url) return "";
  const type=val(m,"media_type").toLowerCase(); const caption=val(m,"caption");
  const layout=val(m,"layout").toLowerCase(); const layoutClass=["half","1/2","two-column","two column","2-up","2up"].includes(layout)?"media-half":"media-full";
  const width=Number(val(m,"media_width")),height=Number(val(m,"media_height"));let ratio=val(m,"aspect_ratio").replace(":","/");
  if(!/^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/.test(ratio))ratio=width>0&&height>0?`${width}/${height}`:"16/9";
  let visual = mediaIsVideo(m) ? `<iframe src="${esc(embedUrl(url))}" title="${esc(val(p,"title"))} video ${i+1}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : `<img src="${esc(url)}" alt="${esc(caption||`${val(p,"title")}, image ${i+1}`)}" loading="lazy" decoding="async"${width>0&&height>0?` width="${width}" height="${height}"`:""}>`;
  return `<figure class="${layoutClass}"><div class="media-frame" style="--media-ratio:${esc(ratio)}">${visual}</div>${caption?`<figcaption>${esc(caption)}</figcaption>`:""}</figure>`;
}
function renderNotFound(){ app.innerHTML=`<main>${header()}<section class="empty"><h1>Project not found</h1><p>It may be hidden in Google Sheets.</p><a href="${route("/design")}">View archive</a></section>${footer()}</main>`; setupCommon(); }
function renderRoute(){
  document.querySelectorAll("body > .menu-button").forEach(node=>node.remove());
  document.querySelectorAll("body > .painting-lightbox").forEach(node=>node.remove());
  document.querySelectorAll("body > .back-to-top").forEach(node=>node.remove());
  document.body.classList.remove("lightbox-open");
  document.body.classList.remove("menu-open");
  const raw=(location.hash.slice(1)||"/");
  const [rawPath,query=""]=raw.split("?");
  const path=rawPath === "/" ? "/" : rawPath.replace(/\/+$/,"");
  const project=new URLSearchParams(query).get("project")||"";
  const nextArchiveSection=path==="/design"?"Design":path==="/art"?"Art":"";
  const preserveArchiveState=nextArchiveSection!==""&&activeArchiveSection===nextArchiveSection;
  const resetArchiveScroll=nextArchiveSection!==""&&!preserveArchiveState&&!project;
  if(nextArchiveSection&&!preserveArchiveState)try{sessionStorage.setItem("yw-sidebar-collapsed","false");sessionStorage.setItem(`yw-${nextArchiveSection.toLowerCase()}-view`,"gallery")}catch{}
  activeArchiveSection=nextArchiveSection;
  scrollTo(0,0);
  let trackedProject=null;
  if(path==="/")renderHome();
  else if(path==="/design"){renderArchive("Design",project,preserveArchiveState);trackedProject=project?visibleProjects().find(item=>sameProject(val(item,"slug"),project)):null}
  else if(path==="/art"){renderArchive("Art",project,preserveArchiveState);trackedProject=project?visibleProjects().find(item=>sameProject(val(item,"slug"),project)):null}
  else if(path==="/about")renderAbout();
  else if(path.startsWith("/work/")){const slug=decodeURIComponent(path.slice(6));renderProject(slug);trackedProject=visibleProjects().find(item=>sameProject(val(item,"slug"),slug))||null}
  else renderNotFound();
  if(resetArchiveScroll){const reset=()=>scrollTo(0,0);requestAnimationFrame(()=>{reset();requestAnimationFrame(reset)});setTimeout(reset,160)}
  trackCurrentView(trackedProject);
}
function startMotion(){
  const stage=document.querySelector("#floating-art"); if(!stage)return;
  const images=visibleProjects().map(p=>safeUrl(val(p,"cover_image"))).filter(Boolean).slice(0,8);
  stage.innerHTML=images.map(src=>`<span class="floating-piece"><img src="${esc(src)}" alt="" loading="lazy"></span>`).join("");
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  requestAnimationFrame(()=>{
    const nodes=[...stage.querySelectorAll(".floating-piece")];
    const bounds=()=>stage.getBoundingClientRect();
    const area=bounds();
    const bodies=nodes.map((node,i)=>{const size=node.offsetWidth;return{node,size,r:size*.48,x:(.08+(i*0.137)%0.78)*area.width,y:(.12+(i*0.219)%0.72)*area.height,vx:(i%2?1:-1)*(.22+i*.025),vy:(i%3?-.18:.2),clearUntil:0}});
    const pointer={x:-9999,y:-9999,px:-9999,py:-9999,active:false};
    stage.addEventListener("pointermove",event=>{const rect=bounds();pointer.px=pointer.x;pointer.py=pointer.y;pointer.x=event.clientX-rect.left;pointer.y=event.clientY-rect.top;pointer.active=true});
    stage.addEventListener("pointerleave",()=>pointer.active=false);
    let raf;
    const tick=()=>{
      const rect=bounds();
      for(const body of bodies){
        if(pointer.active){const cx=body.x+body.size/2,cy=body.y+body.size/2,dx=cx-pointer.x,dy=cy-pointer.y,dist=Math.hypot(dx,dy)||1;if(dist<body.r+115){const speed=Math.min(3.4,Math.hypot(pointer.x-pointer.px,pointer.y-pointer.py)*.08+.35),force=(body.r+115-dist)/(body.r+115);body.vx+=dx/dist*force*speed;body.vy+=dy/dist*force*speed}}
        body.vx*=.992;body.vy*=.992;body.x+=body.vx;body.y+=body.vy;
        if(body.x<0){body.x=0;body.vx=Math.abs(body.vx)}if(body.x+body.size>rect.width){body.x=rect.width-body.size;body.vx=-Math.abs(body.vx)}if(body.y<0){body.y=0;body.vy=Math.abs(body.vy)}if(body.y+body.size>rect.height){body.y=rect.height-body.size;body.vy=-Math.abs(body.vy)}
      }
      const now=performance.now();
      for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){const a=bodies[i],b=bodies[j],ax=a.x+a.size/2,ay=a.y+a.size/2,bx=b.x+b.size/2,by=b.y+b.size/2,dx=bx-ax,dy=by-ay,dist=Math.hypot(dx,dy)||1,min=a.r+b.r;if(dist<min){a.clearUntil=now+320;b.clearUntil=now+320;const nx=dx/dist,ny=dy/dist,overlap=(min-dist)/2;a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(relative<0){a.vx+=relative*nx;a.vy+=relative*ny;b.vx-=relative*nx;b.vy-=relative*ny}}}
      bodies.forEach((body,i)=>{body.node.classList.toggle("collision-clear",now<body.clearUntil);body.node.style.transform=`translate3d(${body.x}px,${body.y}px,0) rotate(${[-5,4,3,-4,6,2,-3,5][i]}deg)`});
      raf=requestAnimationFrame(tick);
    };
    tick();addEventListener("hashchange",()=>cancelAnimationFrame(raf),{once:true});
  });
}

function setupCursor(){
  if(!matchMedia("(hover:hover) and (pointer:fine)").matches||matchMedia("(prefers-reduced-motion:reduce)").matches)return;
  const cursor=document.createElement("span");cursor.className="custom-cursor";cursor.setAttribute("aria-hidden","true");document.body.appendChild(cursor);document.documentElement.classList.add("custom-cursor-enabled");
  addEventListener("pointermove",event=>{cursor.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;cursor.classList.add("visible")},{passive:true});
  addEventListener("pointerover",event=>cursor.classList.toggle("active",Boolean(event.target.closest("a,button,input,select"))));
  addEventListener("pointerout",event=>{if(!event.relatedTarget)cursor.classList.remove("visible")});
}

window.addEventListener("hashchange", renderRoute);
renderRoute();
loadData();
setupCursor();
