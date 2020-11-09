var heart = false;
$('.lv').click(function(){
  if(!heart){
    $(this).addClass('fa-heart').removeClass('fa-heart-o');
    heart = true;
  }
  else {
    $(this).removeClass('fa-heart').addClass('fa-heart-o');
    heart = false;
  }
}); 