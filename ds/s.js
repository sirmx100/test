$(document).ready(function() {
  $('#my_pledges #payment_options').show();

  var hideOverlay = function() {
        $('.pledge_widget').removeClass('is_extended');
        $('#overlay').addClass( 'hide' );
      };
  var openPledge = function() {
      // Expand the pledge panel. Works for both student or sponsor forms.
      $( '.confirm_pledge, .reward_step, .error_step' ).addClass( 'hide' );
      $( '#pledge_form, .sponsor_info, .extended_panel' ).removeClass( 'hide' );
      $('.pledge_widget').addClass('is_extended');

      $('#pledge-form-header h2').text('Enter pledge');

      if(!$('#overlay').length) {
        $('<div id="overlay"></div>').prependTo('body');
        $('#overlay').click(hideOverlay);
      } else {
        $('#overlay').removeClass( 'hide' );
      }
  };
  var enterPledge = function() {
      // Begin entering a new pledge. This is slightly different for
      // student and sponsor (the latter has first choose student step).
      window.clearTimeout(tk_common.show_my_pledges_timer); // cancel loading My Pledges tab
      openPledge();
      if(tk_common.is_sponsor_form()) {
          $('#student-select-toggle').click();
      } else {
          $('.sponsor_info').removeClass('hide');
      }
  };

  // bootstrap tooltip
  $('.header_more').tooltip();

  //Show hide phone script and toggle button from show/hide
  var togglePhoneScript = function() {
    $('#phone-script').slideToggle();
    $('.view-phone-script').toggle();
  };
  $('.view-phone-script').click(togglePhoneScript);

  //PLEDGE WIDGET
  // expand width of form, show overlay
  $('#pledge_form .f_name').focus(openPledge);
  $('.retry-pledge-link').click(openPledge);
  $('.another-pledge-link').click(enterPledge);
  $('.edit-pledge-link').click(
      function() {
          $('.confirm_pledge, .reward_step, .error_step').addClass( 'hide' );
          $('.sponsor_info, .extended_panel').removeClass( 'hide' );
          $('.pledge_widget').addClass('is_extended');
      } );
  // contract the width and hide overlay
  $('.close_pledge').click(hideOverlay);
  // extend confirm message
  $('.toggle_confirm').click(function() {
    $('fieldset.sponsor_info, .extended_panel, .confirm_pledge').toggleClass('hide');
  });
  // show reward hide form
  $('.show_reward').click(function() {
    $('.confirm_pledge').addClass('hide');
    $('.reward_step').removeClass( 'hide' );
  });

  $('.pledge_table .edit').bind('click',function(e){
    var parent = $(this).parent('.pledge_row');
    parent.find('.editable').hide.next('input.change').removeClass('.hide');

  });
  function add() {
      if($(this).val() == ''){
          $(this).val($(this).attr('placeholder')).addClass('placeholder');
      }
  }

  function remove() {
      if($(this).val() == $(this).attr('placeholder')){
          $(this).val('').removeClass('placeholder');
      }
  }

  // Create a dummy element for feature detection
  if (!('placeholder' in $('<input>')[0])) {

      // Select the elements that have a placeholder attribute
      $('input[placeholder], textarea[placeholder]').blur(add).focus(remove).each(add);

      // Remove the placeholder text before the form is submitted
      $('form').submit(function(){
          $(this).find('input[placeholder], textarea[placeholder]').each(remove);
      });
  }

  if ($('.menu-list').length > 0) {
    
    $('.expand-button').click(function(){
      
      var attribute = $(this).attr('data-target');
      $(attribute).toggle();
    });
  }

  $('.btn-profile, .btn-family-page').click(function(){
    window.location.href = $(this).attr('href');
  });

  //toggle additional text on welcome teachers tab
  $('.read-more').toggle(function(){
    $('.welcome-teachers-text-list').show();
    $(this).text(' show less -');
    $(this).css('color', 'blue');
  }, function(){
    $('.welcome-teachers-text-list').hide();
    $(this).text(' show more +');
    $(this).css('color', 'red');
  });


  /* Share on Facebook, Student Star Focused */
  function shareOnFacebook(title, desc, url, image) {
    var user_id = $('input[name="participant_user_id"]').val();
    FB.ui(
      {
        method: 'share',
        href: url
      },
      function(response) {
        if (response && !response.error_message) {
          $.get('/users/user_successful_facebook_share/'+user_id,{data:'success'},function(data){
            return data;
          });
        }
      }
    );

  }

  $('.facebook_share_btn').click(function(e){
      the_button = $(this);
      var title = the_button.attr('data-title'),
          desc  = the_button.attr('data-desc'),
          url   = the_button.attr('data-url'),
          image = the_button.attr('data-image');
      shareOnFacebook(title, desc, url, image);
  });

  $('.lap-selector').on('click', function(){
    previous_laps = $(this).val();
  }).change(function(e) {
    url = '/student/update_laps';
    userid = $(this).data('user-id');
    changed_laps = $(this).val();
    $('.lap-change-alert, .change-not-allowed, .change-error').removeClass('hide').addClass('hide');

    unit_plural = $(this).data('unit');
    if(changed_laps <= 10) {
      $('.change-not-allowed').removeClass('hide');
      $(this).val(previous_laps);
    } else {
      $.ajax({
        "dataType": 'json',
        "type": "POST",
        "url": url,
        "data": {
          user_id: userid,
          laps: changed_laps
        },
        "success": function(message) {
          if (message.success) {
            $('.lap-selector-unit').html(unit_plural);
            $('.lap-change-alert').removeClass('hide');
          } else {
            $('.change-error').removeClass('hide');
          }
        }
      });
    }
  });

  $( ".toggle-more-businesses" ).click(function(e) {
    e.preventDefault();
    var toggleMoreBTN = $(this);
    toggleMoreBTN.toggleClass("show-less");
    $( ".more-businesses" ).toggle( "fast", function() {
      if(toggleMoreBTN.hasClass("show-less")) {
        moreLessText = "Show Less";
      } else {
        moreLessText = "Show More";
      }
      $('a', toggleMoreBTN).html(moreLessText);
    });
  });

});
