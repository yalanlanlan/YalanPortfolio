
 /* jQuery Pre loader
  -----------------------------------------------*/
$(window).load(function(){
    $('.preloader').fadeOut(1000); // set duration in brackets    
});


 /* Google Map
-----------------------------------------------*/
// var map = '';
// var center;

// function initialize() {
//     var mapOptions = {
//       zoom: 16,
//       center: new google.maps.LatLng(13.758468, 100.567481),
//       scrollwheel: false
//     };
  
//     map = new google.maps.Map(document.getElementById('map-canvas'),  mapOptions);

//     google.maps.event.addDomListener(map, 'idle', function() {
//         calculateCenter();
//     });
  
//     google.maps.event.addDomListener(window, 'resize', function() {
//         map.setCenter(center);
//     });
// }

// function calculateCenter() {
//   center = map.getCenter();
// }

// function loadGoogleMap(){
//     var script = document.createElement('script');
//     script.type = 'text/javascript';
//     script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&' + 'callback=initialize';
//     document.body.appendChild(script);
// }

// $(function(){
//   loadGoogleMap();
// });


/* Istope Portfolio
-----------------------------------------------*/
jQuery(document).ready(function($){

  if ( $('.iso-box-wrapper').length > 0 ) { 

      var $container  = $('.iso-box-wrapper'), 
        $imgs     = $('.iso-box img');

      $container.imagesLoaded(function () {

        $container.isotope({
        layoutMode: 'fitRows',
        itemSelector: '.iso-box'
        });

        $imgs.load(function(){
          $container.isotope('reLayout');
        })

      });

      //filter items on button click

      $('.filter-wrapper li a').click(function(){

          var $this = $(this), filterValue = $this.attr('data-filter');

      $container.isotope({ 
        filter: filterValue,
        animationOptions: { 
            duration: 750, 
            easing: 'linear', 
            queue: false, 
        }                
      });             

      // don't proceed if already selected 

      if ( $this.hasClass('selected') ) { 
        return false; 
      }

      var filter_wrapper = $this.closest('.filter-wrapper');
      filter_wrapper.find('.selected').removeClass('selected');
      $this.addClass('selected');

        return false;
      }); 

  }

});


 /* Navigation Bar
  -----------------------------------------------*/
$(document).ready(function() { 
    "use strict";

    // Navbar Sticky

    (function() {
        var docElem = document.documentElement,
            didScroll = false,
            stickynav = 50;
            document.querySelector( '.nav-container' );
        function init() {
            window.addEventListener( 'scroll', function() {
                if( !didScroll ) {
                    didScroll = true;
                    setTimeout( scrollPage, 50 );
                }
            }, false );
        }
        
        function scrollPage() {
            var sy = scrollY();
            if ( sy >= stickynav ) {
                $( '.nav-container' ).addClass('sticky');
            }
            else {
                $( '.nav-container' ).removeClass('sticky');
            }
            didScroll = false;
        }
        
        function scrollY() {
            return window.pageYOffset || docElem.scrollTop;
        }        
        init();        
    })();

});


$(document).ready(function(){
            
    "use strict";

    $('.menu-container').each(function(index) {
        $(this).find('.circle').attr('menu-link', index);
        $(this).find('.list-menu').clone().appendTo('body').attr('menu-link', index);
    });

    $('.menu-container .circle').click(function() {
        var linkedVideo = $('section').closest('body').find('.list-menu[menu-link="' + $(this).attr('menu-link') + '"]');
        linkedVideo.toggleClass('reveal-modal');
       
    });

    $('section').closest('body').find('.close-iframe').click(function() {
        $(this).closest('.list-menu').toggleClass('reveal-modal');
    });


  /* wow
  -------------------------------*/
  new WOW({ mobile: false }).init();

  });

// jQuery(document).ready(function($){
// $("div[id^='openModal']").each(function() {
//   var currentModal = $(this);

//   //click next
//   currentModal.find(".btn-next").click(function() {
//     currentModal.modal('hide');
//     currentModal
//       .closest("div[id^='openModal']")
//       .nextAll("div[id^='openModal']")
//       .first()
//       .modal("show");
//   });

//   //click prev
//   currentModal.find(".btn-prev").click(function() {
//     currentModal.modal("hide");
//     currentModal
//       .closest("div[id^='openModal']")
//       .prevAll("div[id^='openModal']")
//       .first()
//       .modal("show");
//   });
// });
// });
//     var modal;
//     var btn;
//     var span;
//     for(var $i=0; $i<23; $i++){
//      modal = document.getElementById('openModal'+$i);
//      btn = document.getElementById('btn'+$i);
//      span = document.getElementsByClassName('close')[$i];

//     btn.addEventListener("click", function() {
//         modal.style.display = 'block';
//     })
//     span.addEventListener("click", function() {
//         modal.style.display = 'none';
//     })
// }
//     window.onclick = function(event) {
//         if (event.target == modal) {
//             modal.style.display = 'none';
//         }
//     }



// var modal
// modal=document.getElementById('openModal1');

//     function nextModal() {
      
//       // if(slideIndex == wrapper.length - 1) {
//       //   slideIndex = 0;
//       //   translateValue = 0;
//       //   wrapper[0].style.transform = "translateX("+translateValue+"px)";
//       // }
    
//       // for(var i = 0; modal = document.getElementById('openModal'+i); i++){
        
//       //     modal.style.display = "none";
        
//       // }
      
      
     
//       location.href = "index.html#openModal2"
//       console.log("work");
      
//     }


// var el;
// var prefix = 'elementId';
// for(var i = 0; el = document.getElementById(prefix + i); i++) {
//   if(condition) {
//     el.style.display = '';
//   }
// }

//==============
$(function() {
  
  var $btn = $('#btnTop');
  var $home = $('#topSection');
  var startpoint = $home.scrollTop() + $home.height();
  
  $(window).on('scroll', function() {
    if($(window).scrollTop() > startpoint) {
      $btn.show();
    } else {
      $btn.hide();
    }
  });
});


//================
$(document).ready(function() {
  // navigation click actions	
  $('.scroll-link').on('click', function(event) {
    event.preventDefault();
    var sectionID = $(this).attr("data-id");
    scrollToID('#' + sectionID, 750);
  });
  // scroll to top action
  $('.scroll-top').on('click', function(event) {
    event.preventDefault();
    $('html, body').animate({
      scrollTop: 0
    }, 'slow');
  });
  // mobile nav toggle
  $('#nav-toggle').on('click', function(event) {
    event.preventDefault();
    $('#main-nav').toggleClass("open");
  });
});
// scroll function
function scrollToID(id, speed) {
  var offSet = 0;
  var targetOffset = $(id).offset().top - offSet;
  var mainNav = $('#main-nav');
  $('html,body').animate({
    scrollTop: targetOffset
  }, speed);
  if (mainNav.hasClass("open")) {
    mainNav.css("height", "1px").removeClass("in").addClass("collapse");
    mainNav.removeClass("open");
  }
}

if (typeof console === "undefined") {
  console = {
    log: function() {}
  };
}