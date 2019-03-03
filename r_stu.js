  $(function() {
    $("#content1").show();

    $("#tab a").click(function() {
       //reset
       $(".content").hide();
       $("#tab .active").removeClass("active active-fix");
       //act
       $(this).addClass("active active-fix");
       var id = $(this).closest("li").attr("id").replace("tab","");
       $("#content" + id).show();
    });

  });
