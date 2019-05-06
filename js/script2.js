//Navigation part
var $active_elements = $('section');
var $window = $(window);
console.log('test');
function active() {
console.log('active');
  var window_bottom = ($window.scrollTop() + $window.height());
 
  $.each($active_elements, function() {
    var $element = $(this);
    var element_bottom = ($element.offset().top + $element.outerHeight());
 
    //check to see if this current container is within viewport
    if ((element_bottom >= $window.scrollTop()) &&
        ($element.offset().top <= window_bottom)) {
      $element.addClass('active');
    } else {
      $element.removeClass('active');
    }
  });
}

$window.on('scroll resize', active);
$window.trigger('scroll');

$('.nav--icon').on('click', function(){
  $(this).toggleClass('nav-open');
  $('.overlay').toggleClass('open');
  $('.info-pos').toggleClass('visibility')
});

$('.button').on('click', function(){
    $(this).toggleClass('button-open');
    $('.search-bar2').toggleClass('open');
  });

