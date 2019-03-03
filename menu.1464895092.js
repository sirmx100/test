$(document).ready(function(){
  menu.init();
});

var menu = {};

menu.init = function(){
  menu.attachCursorInteractionEvents($('.menu_popover'));
};

menu.attachCursorInteractionEvents = function(selector){

  selector.hover(
    //hover in
    function(){
      var id = $(this).attr('rel');
      $('#'+id).removeClass('hide');
    },
    //hover out
    function(){
      var id = $(this).attr('rel');
      $('#'+id).addClass('hide');
    });

};






