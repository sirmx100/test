$(
  function() {
    var showIt = function() { $('#privacy-modal').modal('show'); };
    $('#privacy-link, #cookiePolicyLink').click(
      function(e) {
        e.preventDefault();
        if($('#privacy-body').text()) { // already loaded?
          showIt();
        } else {
          $('#privacy-body').load($(this).attr('href'), null, showIt);
        }
    });
    
    // Adding a separate link for mobile due to the "unrecognized expression"
    // in the mobile environment
    $('#privacy-link-mobile, #cookiePolicyLink').click(function(e){ 
      if ($('#privacy-body-mobile').text() ) { 
        $('#privacy-modal-mobile').modal('show');
      } else { 
        $('#privacy-body-mobile').load("/privacy.html");
        $('#privacy-modal-mobile').removeClass("hide");
        $('#privacy-modal-mobile').modal('show');
      }
    });
    
    $('#privacy-modal-mobile .modal-close').click(function(e){
      e.preventDefault(); 
      $('#privacy-modal-mobile').modal('hide');
    });
  }
);
