// TODO look into declaring a few global variables for individual widgets, and accessing the variable to decrease overhead/code

$(document).ready(function () {

  tk_common.init();

});

var tk_common = {
  success_btn_active: true,
  multipliers: null,
  pledge_success_completed: false,
  set_multipliers: function (mult) {
    tk_common.multipliers = mult;
  },
  emailRE: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, // http://www.regular-expressions.info/email.html

  valid_email: function (email) {
    return tk_common.emailRE.test(email);
  },
  bulk_items: function () {
    // bootstrap tooltip
    $('.header_more').tooltip();

    // Map
    if($.cssMap)
      $('.maps_container').cssMap({'size': 500});

    //My pledges tab
    $('.pledge_table .edit').bind('click', function (e) {
      var parent = $(this).parent('.pledge_row');
      parent.find('.editable').hide.next('input.change').removeClass('hide');
    });

    //Pledge warning tooltips
    $('.multi-form-alert, .student-select-alert, [rel="tooltip"]').tooltip();
    $('button[rel="tooltip"]').click(function (e) {
      e.preventDefault();
    });
  },
  // handles the action of the nav buttons for bootstrap carousel,
  // nav is appended by school_carousel function below that generically
  // targets carousel class which is required by bootstrap carousel
  family_public_carousel: function() {
    $('#dashboard-bootstrap-carousel').on('slid.bs.carousel', function(e) {
      var nav = $('.carousel-nav[data-target="' + $(this).attr('id') + '"] ul');
      var index = $(this).find('.item.active').index();
      var item = nav.find('li').get(index);

      nav.find('li a.active').removeClass('active');
      $(item).find('a').addClass('active');
    });

  },
  /*
   * SCHOOL REWARDS CAROUSEL
   */
  school_carousel: function () {
    $('.carousel[id]').each(
            function () {
              var html = '<div class="carousel-nav" data-target="' + $(this).attr('id') + '"><ul>';

              for (var i = 0; i < $(this).find('.item').size(); i++) {
                html += '<li><a';
                if (i == 0) {
                  html += ' class="active"';
                }

                html += ' href="#">•</a></li>';
              }

              html += '</ul></li>';
              $(this).after(html);
              $('.carousel-control.left[href="#' + $(this).attr('id') + '"]').hide();
            }
    ).bind('slid',
            function (e) {
              var nav = $('.carousel-nav[data-target="' + $(this).attr('id') + '"] ul');
              var index = $(this).find('.item.active').index();
              var item = nav.find('li').get(index);

              nav.find('li a.active').removeClass('active');
              $(item).find('a').addClass('active');

              if (index == 0) {
                $('.carousel-control.left[href="#' + $(this).attr('id') + '"]').fadeOut();
              } else {
                $('.carousel-control.left[href="#' + $(this).attr('id') + '"]').fadeIn();
              }

              if (index == nav.find('li').size() - 1) {
                $('.carousel-control.right[href="#' + $(this).attr('id') + '"]').fadeOut();
              } else {
                $('.carousel-control.right[href="#' + $(this).attr('id') + '"]').fadeIn();
              }
            }
    );

    $('.carousel-nav a').click(function (e) {
      var index = $(this).parent().index();
      var carousel = $('#' + $(this).closest('.carousel-nav').attr('data-target'));

      carousel.carousel(index);
      e.preventDefault();
    }
    );
//        $('.carousel').carousel( { interval: 6000 } );
  },
  /*
   * DEPRICATED WITH THE CHANGE TO NEW PLEDGE PAGE
   * PLEDGE WIDGET
   *  TODO break this function into smaller functions
   */
  pledge_extend_toggle: function () {
    // corner case: re-enable button if page is refreshed.
    $('#pledge-next').prop('disabled', false);

    //slide out student select form
    $('#pledge-next').click(function (e) {
      e.preventDefault();

      $(this).prop('disabled', true); //disable btn to avoid muti click
      $('#student-select-toggle').prop('disabled', false); //enable return button
      //count how many checkboxes are selected
      var check = new Array();
      $('fieldset.student_select input[type=checkbox]:checked').each(function ()
      {
        check.push($(this));
      });

      //if none, add error message
      if (check.length < 1) { //if no student selected, do not proceed
        $('#student-checkboxes p.error').removeClass('hide');
        $('input[name="participant_user_id[]"]').closest('.control').addClass('error');
        $(this).prop('disabled', false);
      } else {
        $('#student-checkboxes p.error').addClass('hide');
        $('input[name="participant_user_id[]"]').closest('.control').removeClass('error');
        //else slide out and fade in
        $('#pledge_form fieldset.student_select').animate({
          opacity: 0.25,
          left: '-=290',
          height: 'toggle'
        }, 500, function () {
          $('#student-select-toggle').fadeIn();
        });
      }

    });

    //slide in student select form
    $('#student-select-toggle').click(function (e) {
      e.preventDefault();
      $(this).prop('disabled', true); //disable button to avoid multiple click
      $('#pledge-next').prop('disabled', false); //re-enable 'next' button
      $('#student-select-toggle').fadeOut(function () {
        $('#pledge_form fieldset.student_select').animate({
          opacity: 1,
          left: '+=290',
          height: 'toggle'
        }, 500, function () {
          //animate complete
        });
      });
    });

    // expand width of form, show overlay on input focus
    $('#pledge_form .sponsor_info').find(':input').focus(function () {
      $('#pledge_form .extended_panel, #pledge_form .sponsor_info').removeClass('hide');
      $('.pledge_widget').addClass('is_extended');
      $('#overlay').removeClass('hide');
    });

    // expand width of form, show overlay on chevron click
    $('#pledge-chevron').click(function (e) {
      e.preventDefault();
      $('.pledge_widget').addClass('is_extended');
      $('#overlay').removeClass('hide');
    });

    // contract the width and hide overlay
    $('.close_pledge').click(function () {
      $('.pledge_widget').removeClass('is_extended'); //close slider
      $('#overlay, .reward_step').addClass('hide'); //hide overlay, and sponsor_info; if reward step is showing, hide to show pledge entry dialogue
      $('#pledge-next').prop('disabled', false); //re-enable 'next' button

      //if($('.confirm_pledge').hasClass('hide')){
      //$('.extended_panel').addClass('hide'); //show form inputs
      //}else{
      tk_common.pledge_confirm_hide(); //show form inputs and hide confirmation dialogue
      //}

      if (tk_common.pledge_success_completed) {
        //reload page except when the page is supposed to open the pledge widget automatically
        if (window.location.pathname == '/student/dashboard/pledge') {
          window.location.pathname = '/student/dashboard/';
        } else {
          window.location.reload(true);
        }
      }

      $('#student-select-toggle').fadeOut(function () {
        $('#pledge_form fieldset.student_select').animate({
          opacity: 1,
          left: '+=290',
          height: 'toggle'
        }, 500, function () {
          //animate complete
        });
      });

      window.setTimeout(
              function () {
                $('.main_panel').hide();
                $('.pledge_widget_content').hide();
                $('#pledge-form-header h2').text('pledges');
                $('.pledge-progress-widget-content').show();
              },
              500);
    });
  },
  help_program_id_selector: function(){
      $('#help_desk_form').on('change', '.program_id_selector', function(event){
        if(event.currentTarget.value == -1){
          $('#help_desk_form .program_other_container_selector').slideDown();
        } else {
          $('#help_desk_form .program_other_container_selector').slideUp();
        }
      });
  },
  pledge_state_select: function () {
    $('#pledge_form').on('change', 'select[name=state]', function () {
      $country = $('#pledge_form select[name=country]');
      if ($(this).val() != 'false') {
        $country.val('US');
      } else {
        if ($country.val() == 'US') {
          $country.val('false');
        }
      }
    });
  },
  pledge_country_select: function () {
    $('#pledge_form').on('change', 'select[name=country]', function () {
      if ($(this).val() != 'US') {
        $('#pledge_form select[name=state]').val('NULL');
      } else {
        $('#pledge_form select[name=state]').val('');
      }
    });
  },
  pledge_phone: function () {
    $("input[name=phone]").keyup(function () {
      var curchr = this.value.length;
      var curval = $(this).val();
      if (curchr == 3) {
        $(this).val(curval + "-");
      } else if (curchr == 7) {
        $(this).val(curval + "-");
      }
    });
  },
  pledge_sponsor_type: function () {
    $('#pledge_form').on('change', 'select[name=sponsor_type]', function () {
      var selected = $(this).find('option:selected').text();
      switch (selected) {
        case 'Business': //bubble up 2 elements and show control-group, end bubbles and enable input, adjust placeholder
          $('#corporate_matching_info').addClass('hide');
          if ($('#mobile-pledge').length > 0) {
            // Mobile
            $('#pledge_form input[name=other_type]').parent('.form-group').hide().end().attr('disabled', 'disabled');
            $('#pledge_form input[name=business_name]').parent('.form-group').show().end().removeAttr('disabled', 'disabled').attr('placeholder', '');
            $('#pledge_form input[name=business_site]').parent('.form-group').show().end().removeAttr('disabled', 'disabled');
          } else {
            $('#pledge_form input[name=other_type]').parent().parent().addClass('hide').end().end().attr('disabled', 'disabled');
            $('#pledge_form input[name=business_name]').parent().parent().removeClass('hide').end().end().removeAttr('disabled', 'disabled').attr('placeholder', 'Business Name');
            $('#pledge_form input[name=business_site]').closest('.control-group').removeClass('hide').end().removeAttr('disabled', 'disabled');
            $('#pledge_form input[name=display_business]').closest('.checkbox').removeClass('hide').end().removeAttr('disabled', 'disabled');
          }
          break;
        case 'Other':
          $('#corporate_matching_info').addClass('hide');
          if ($('#mobile-pledge').length > 0) {
            // Mobile
            $('#pledge_form input[name=other_type]').parent('.form-group').show().end().removeAttr('disabled', 'disabled').attr('placeholder', '');
            $('#pledge_form input[name=business_site]').parent('.form-group').hide().end().attr('disabled', 'disabled');
            $('#pledge_form input[name=business_name]').parent('.form-group').hide().end().attr('disabled', 'disabled');
          } else {
            $('#pledge_form input[name=other_type]').parent().parent().removeClass('hide').end().end().removeAttr('disabled', 'disabled').attr('placeholder', 'Other Type');
            $('#pledge_form input[name=business_site]').closest('.control-group').addClass('hide').end().attr('disabled', 'disabled');
            $('#pledge_form input[name=business_name]').closest('.control-group').addClass('hide').end().attr('disabled', 'disabled');
            $('#pledge_form input[name=display_business]').closest('.checkbox').addClass('hide').end().attr('disabled', 'disabled');
          }
          break;
        case 'Corporate Matching Gift':
          $('#corporate_matching_info').removeClass('hide');
          if ($('#mobile-pledge').length > 0) {
            // Mobile
            $('#pledge_form input[name=other_type]').parent('.form-group').hide().end().attr('disabled', 'disabled');
            $('#pledge_form input[name=business_site]').parent('.form-group').hide().end().attr('disabled', 'disabled');
            $('#pledge_form input[name=business_name]').parent('.form-group').hide().end().attr('disabled', 'disabled');
          } else {
            $('#pledge_form input[name=other_type]').parent().parent().addClass('hide').end().end().attr('disabled', 'disabled');
            $('#pledge_form input[name=business_site]').closest('.control-group').addClass('hide').end().attr('disabled', 'disabled');
            $('#pledge_form input[name=display_business]').closest('.checkbox').addClass('hide').end().attr('disabled', 'disabled');
            $('#pledge_form input[name=business_name]').closest('.control-group').addClass('hide').end().attr('disabled', 'disabled');
          }
          break;
        default:
          $('#corporate_matching_info').addClass('hide');
          if ($('#mobile-pledge').length > 0) {
            // Mobile
            $('#pledge_form input[name=other_type]').parent('.form-group').hide().end().attr('disabled', 'disabled');
            $('#pledge_form input[name=business_site]').parent('.form-group').hide().end().attr('disabled', 'disabled');
            $('#pledge_form input[name=business_name]').parent('.form-group').hide().end().attr('disabled', 'disabled');
          } else {
            $('#pledge_form input[name=other_type]').parent().parent().addClass('hide').end().end().attr('disabled', 'disabled');
            $('#pledge_form input[name=business_site]').closest('.control-group').addClass('hide').end().attr('disabled', 'disabled');
            $('#pledge_form input[name=display_business]').closest('.checkbox').addClass('hide').end().attr('disabled', 'disabled');
            $('#pledge_form input[name=business_name]').closest('.control-group').addClass('hide').end().attr('disabled', 'disabled');
          }
      }
    });
  },
  get_pledge_type: function () {
    return $('select[name="pledge_type"]')
            .find("option:selected")
            .text()
            .toLowerCase();
  },
  set_pledge_type: function () {
    if (tk_common.get_pledge_type() == 'pledge per lap') {
      if ($('#pledge_too_high_error:hidden').length) {
        $('#per-lap-reminder').removeClass('hide');
      }
      $('#pledge-total-txt span').text('Estimated');
    } else {
      $('#per-lap-reminder').addClass('hide');
      $('#pledge-total-txt span').text('');
    }
    tk_common.show_amount_dropdown();
    tk_common.pledge_amount(); // set handlers
    tk_common.pledge_amount_update();
  },
  pledge_type: function () {
    // Handle page refresh
    if (tk_common.get_pledge_type()) {
      tk_common.set_pledge_type();
    }
    $('#pledge_form').on('change', 'select[name=pledge_type]', tk_common.set_pledge_type);
  },
  pledge_amount: function () {
    $('#amount-ppl, #amount-flat').change(function () {
      //If user selected "other" from a dropdown, change dropdown to text input
      if ($(this).val() == 'other') {
        tk_common.show_amount_input();
      }
      tk_common.pledge_amount_update();
    });
    $('#amount-other').keyup(tk_common.pledge_amount_update);
  },
  get_pledge_amount: function () {
    var amountDropdown = tk_common.get_pledge_type() == 'pledge per lap'
            ? '#amount-ppl' : '#amount-flat';
    var selectVal = $(amountDropdown).val();
    var str = selectVal == 'other' ? $('#amount-other').val() : selectVal;
    return Math.floor((str == '' ? 0 : parseFloat(str)) * 100) / 100; // return whole cents only
  },
  show_amount_input: function () {
    $('#amount-ppl, #amount-flat').addClass('hide').prop('disabled', 'disabled');
    $('#amount-other').removeProp('disabled').parent().removeClass('hide');
  },
  show_amount_dropdown: function () {
    $('#amount-other').prop('disabled', 'disabled').parent().addClass('hide');
    if (tk_common.get_pledge_type() == 'pledge per lap') {
      $('#amount-ppl').removeClass('hide').removeProp('disabled');
      $('#amount-ppl').parent('.form-group').show();
      $('#amount-flat').addClass('hide').prop('disabled', 'disabled');
      $('#amount-flat').parent('.form-group').hide();
    } else {
      $('#amount-flat').removeClass('hide').removeProp('disabled');
      $('#amount-flat').parent('.form-group').show();
      $('#amount-ppl').addClass('hide').prop('disabled', 'disabled');
      $('#amount-ppl').parent('.form-group').hide();
    }
    // Reset dropdowns
    $('#amount-ppl, #amount-flat').each(function () {
      $(this).val('');
    });
  },
  pledge_amount_update: function () {
    var amount = tk_common.get_pledge_amount();
    var pledge_type_id = $('#pledge-type').val();
    var low = tk_common.multipliers[pledge_type_id].low;
    var high = tk_common.multipliers[pledge_type_id].high;
    var amount_string;

    if (tk_common.get_pledge_type() == 'flat donation') {
      amount_string = tk_common.money_format((low * amount));
      $('#per-lap-reminder').addClass('hide');
    } else {
      amount_string = tk_common.money_format((low * amount)) +
              ' - ' + tk_common.money_format((high * amount));
      if ($('#pledge_too_high_error:hidden').length) {
        $('#per-lap-reminder').removeClass('hide').find('span').text(amount);
      }
    }

    $('#est-pledge-total').text(amount_string);
  },
  pledge_email_confirm: function () {
    $('#email-alert a.btn-primary, #email-alert .modal-confirm').click(function () { //bind function to modal close
      if ($(this).hasClass('modal-confirm')) {
        $(this).parents('.modal-m').fadeOut();
        $('#modal-overlay').fadeOut().css('z-index', '20');
      }
      tk_common.pledge_submit($('#pledge_form'));
    });
  },
  pledge_confirm_show: function () {
    var amount = tk_common.money_format(tk_common.get_pledge_amount());

    $('#pledge-form-header h2').text('Pledge confirmation');
    $('fieldset.sponsor_info, fieldset.type_sponsor, fieldset.pledge_info').addClass('hide');
    $('.confirm_pledge').removeClass('hide');
    $('fieldset.confirm_pledge span.amount').text(amount);

    if (tk_common.get_pledge_type() == 'flat donation') {
      $('.donation_summary').removeClass('hide');
      $('.ppl_summary').addClass('hide');
    } else { //PPL
      $('span.pledge_range').text($('#est-pledge-total').text());
      $('.donation_summary').addClass('hide');
      $('.ppl_summary').removeClass('hide');
    }
  },
  get_online_tx_status: function () {
    return $("[name='program_online_pymts']").val();
  },
  pledge_success_show: function () {
    $('.pledge_success_thanks').removeClass('hide');  //show pledge success dialogue
    $('#pledge-form-header h2').text('Pledge Success!');

    $('fieldset.sponsor_info, fieldset.type_sponsor, fieldset.pledge_info, fieldset.confirm_pledge').addClass('hide');
    $('fieldset.pledge_success, .extended_panel').removeClass('hide');
    $('.pledge_success').removeClass('hide');
    $('#pay_now_btn').removeClass('hide');
    $('.my-pledges-btn').removeClass('hide');

    if (tk_common.is_sponsor_form()) {
      if (tk_common.get_online_tx_status() == true) {
        $('.online_tx_on_summary_sponsor').removeClass('hide');
      } else {
        $('span.pledge_range').text($('#est-pledge-total').text());
        $('.online_tx_off_summary_sponsor').removeClass('hide');
      }
    } else {
      if (tk_common.get_online_tx_status() == true) {
        $('.online_tx_on_summary').removeClass('hide');
        $('.online_tx_off_summary').addClass('hide');
      } else {
        $('span.pledge_range').text($('#est-pledge-total').text());
        $('.online_tx_on_summary').addClass('hide');
        $('.online_tx_off_summary').removeClass('hide');
      }
    }


  },
  pledge_success_click: function () {
    $('#pledge_success_btn').click(function (e) {
      e.preventDefault();
      //clear form and redirect to my pledges
      tk_common.pledge_clear_form();
      window.location.pathname = '/student/my_pledges';
    });
  },
  // Is this the sponsor making this pledge? 48910647
  is_sponsor_form: function () {
    return $('fieldset.student_select').length > 0;
  },
  pledge_edit_pledge_info_click: function () {
    $('.edit-pledge-link').click(function (e) {
      tk_common.pledge_confirm_hide();
      $('#pledge-form-header h2').text('Edit pledge');
    });
  },
  pledge_confirm_hide: function () {
    $('#pledge-form-header h2').text('Enter pledge');
    $('.confirm_pledge').addClass('hide');
    $('fieldset.sponsor_info, fieldset.type_sponsor, fieldset.pledge_info, .extended_panel').removeClass('hide');
  },
  pledge_progression: function () {
    // extend confirm message
    $('.toggle_confirm').click(function () { // TODO refactor for new pledge selection
      //$('#student-select-toggle').fadeIn(); //fade out student select button
      tk_common.pledge_confirm_show();
      // TODO: take pledge input values and populate the confirmation screen
    });
  },
  /** This might not be used anymore **/
  pledge_submit_click: function () {
    var form = $('#pledge_form');
    $('#pledge-submit').click(function (e) {
      e.preventDefault();
      if (!tk_common.valid_email($('#pledge_form input[name=email]').val())) { //if no email, and sponsor_info visible
      } else {
        form.find('[name=email]').parent('.form-group')
                .removeClass('has-error');
        form.find('[name=email]')
                .parent('.form-group .help-block').remove();
        if (!tk_common.valid_pledge_amount()) {
          $('#per-lap-reminder').addClass('hide');
          $('#pledge_too_high_error').removeClass('hide');
        } else {
          if (tk_common.success_btn_active)
            tk_common.pledge_submit(form);
        }
      }
    });
  },
  pledge_error_handler: function (form, key, val) {
    form //target form
            .find('[name=' + key + ']') //find element input within form
            .closest('.control-group') //container control-group of input element
            .addClass('error') //bootstrap error rendering
            .find('.multi-form-alert') //find next button by class
            .attr('data-original-title', val) //set the tooltip title to the alert value
            .removeClass('hide btn-primary') //display if hidden, remove blue background if exist
            .addClass('btn-danger') //append red background for danger status
            .children('') //access icon inner element
            .removeClass('icon-question-sign') //remove ? icon
            .addClass('icon-warning-sign'); // add alert icon
  },
  pledge_error_handler_mobile: function (form, key, val) {
    form.find('[name=' + key + ']').parent('.form-group').addClass('has-error');
    form.find('[name=' + key + ']').parent('.form-group').append(
            '<p class="help-block">' + val + '</p>');
  },
  /**
   * DEPRICATED?
   **/
  pledge_submit: function (form) {
    tk_common.success_btn_active = false;
    $.ajax({
      url: "/pledges/validate",
      data: form.serialize(),
      type: 'POST',
      dataType: 'json',
      complete: function () {
        tk_common.success_btn_active = true;
      },
      success: function (result) {
        if (result && result.success) {
          // send the range on success to google analytics
          // `PLEDGE SUCCESS` ga event
          if (parseInt(result.estimated_amt) <= 150) {
            ga('send', 'event', 'pledge success', 'submit', tk_common.get_cookie_value_from_key('ref_type', false), result.estimated_amt);
          }
          $('#per-lap-reminder').removeClass('hide');
          $('#pledge_too_high_error').addClass('hide');
          $('#per-lap-reminder').removeClass('hide');
          $('#pledge_too_high_error').addClass('hide');
          // CHECK FOR MOBILE
          if ($('#mobile-pledge').length > 0) {
            // Clear errors and form, close form
            $('.form-group').each(function (elm) {
              $(this).removeClass('has-error');
              $(this).find('.help-block').remove();
            });
            // Clear form
            $('#pledge_form')[0].reset();
            tk_common.mobile_modal('#pledge-complete-alert');
            $('#sponsor_paynow_form #pledges').val(result.entered_pledges);
            $('#sponsor_paynow_form #first_name').val(result.first_name);
            $('#sponsor_paynow_form #last_name').val(result.last_name);
            $('#sponsor_paynow_form #email').val(result.email);
            $('#sponsor_paynow_form #phone').val(result.phone);
            tk_common.pledge_sponsor_payment_mobile();
          } else {
            $('#pledge-confirm').data('pledge-ids', result.entered_pledges);
            $('#pledge_form #pledges').val(result.entered_pledges);
            // HIDE THE ERRORS
            $('#pledge_form .multi-form-alert').addClass('hide');
            $('#pledge_form .control-group').removeClass('error');
            // Clear form
            $('#pledge_form')[0].reset();
            //set refresh flag for close button
            tk_common.pledge_success_completed = true;
            // SHOW THE THANK YOU PAGE
            tk_common.pledge_success_show();
            tk_common.pledge_sponsor_payment();
          }
        } else if (result && !result.success) {
          $.each(result.errors, function (key, val) {
            if (val == 'period') {
              if ($('#mobile-pledge').length > 0) {
                tk_common.mobile_modal('#period-alert');
              } else {
                $('#period-alert').modal();
              }
            } else if (val != '') {
              if ($('#mobile-pledge').length > 0) {
                tk_common.pledge_error_handler_mobile(form, key, val);
              } else {
                tk_common.pledge_error_handler(form, key, val);
              }
            } else {
              if ($('#mobile-pledge').length > 0) {
                form.find('[name=' + key + ']').parent('.form-group')
                        .removeClass('has-error');
                form.find('[name=' + key + ']')
                        .parent('.form-group .help-block').remove();
              } else {
                $('#period-error-display').hide();
                form //target form
                        .find('[name=' + key + ']') //find element input within form
                        .closest('.control-group') //container control-group of input element
                        .removeClass('error') //bootstrap error removal
                        .find('.multi-form-alert') //find next button by class
                        .attr('data-original-title', val) //set the tooltip title to the alert value
                        .addClass('hide'); //hide
              }
            }
          });
        } else { //invalid response
          // TODO: handle invalid or no response
        }
      } //END AJAX SUCCESS
    });
  },
  pledge_complete: function () {
    $('#pledge-confirm').click(function (e) {
      e.preventDefault();
      $(this).unbind('click'); //clear bindings to avoid multiple submission
      $('.error_step, .reward_step').addClass('hide');
      $.ajax({
        url: "/pledges/complete",
        data: {
          ids: $(this).data('pledge-ids'),
          is_sponsor: tk_common.is_sponsor_form()
        },
        dataType: 'json',
        type: 'POST',
        success: function (result) {
          // TODO return Prize/Reward info with result
          // TODO update prize info, and success info on confirmation success
          if (result.success) {
            //$('.reward_step').removeClass('hide'); //show reward dialogue
            tk_common.pledge_success_show();
            tk_common.pledge_success_completed = true;

            // Reset form. 49204467
            //tk_common.pledge_clear_form();

            if (tk_common.is_sponsor_form()) {
              tk_common.pledge_sponsor_payment();
            }
          }
        },
        error: function () {
          $('.error_step').removeClass('hide');
          $('.confirm_pledge').addClass('hide');
          $('#pledge-form-header h2').text('Oops...');
        },
        complete: function () {
          //$('#overlay').click(); // slide form out
          //change click to if sponsor roll back
          // if particip[ant student/teacher go to my pledges and roll back
        }
      });

    });
  },
  pledge_clear_form: function () {
    tk_common.clear_form($('#pledge_form'));

    tk_common.show_amount_dropdown(); // Restore the PPL dropdown. 49844861

    $('#pledge_form .multi-form-alert').addClass('hide');
    $('#pledge_form .control-group').removeClass('error');
  },
  /*
   * PASSIVE FUNCTIONS : called by other functions
   */
  serializeObject: function ()
  {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  },
  clear_form: function (ele) {
    ele.find(':input').each(function () {
      switch (this.type) {
        case 'password':
        case 'select-multiple':
        case 'select-one':
        case 'text':
        case 'textarea':
          $(this).val('');
          break;
        case 'checkbox':
        case 'radio':
          this.checked = false;
      }
    });
  },
  /*
   * NO IDEA WHAT THIS IS
   *  TODO ask seltzer or just start digging and figure it out
   */
  wth: function () {
    // placeholder polyfill
    function add() {
      if ($(this).val() == '') {
        $(this).val($(this).attr('placeholder')).addClass('placeholder');
      }
    }
    function remove() {
      if ($(this).val() == $(this).attr('placeholder')) {
        $(this).val('').removeClass('placeholder');
      }
    }
    // Create a dummy element for feature detection
    if (!('placeholder' in $('<input>')[0])) {
      // Select the elements that have a placeholder attribute
      $('input[placeholder], textarea[placeholder]').blur(add).focus(remove).each(add);
      // Remove the placeholder text before the form is submitted
      $('form').submit(function() {
        $(this).find('input[placeholder], textarea[placeholder]').each(remove);
      });
    }
  },
  summarize_pledges: function() {
    var placeholder = $('#pledges_summary');
    var pledge_type = $('#pledge-type').val();
    var amount = tk_common.get_pledge_amount();
    var estimated;
    //Calculate approximate range, or flat total
    if (tk_common.multipliers[pledge_type].low
            < tk_common.multipliers[pledge_type].high) { //Flat has both multis as 1
      estimated = '$' + (amount * tk_common.multipliers[pledge_type].low)
              + ' - $' + (amount * tk_common.multipliers[pledge_type].high);
    } else {
      estimated = '$' + amount;
    }
    placeholder.text('');
    $.each($('#student-checkboxes input:checked'), function(k, v) {
      var student_name = $(this).parent('label').text();
      // ?? amount += $( '#pledge_type' ).find( 'option:selected' ).text();
      var pledge = $('<li></li>').text(student_name + ' for ' + estimated);
      placeholder.append(pledge);
    });
  },
  money_format: function(number) {
    var n = number == Math.floor(number) ? number.toString() : number.toFixed(2); // if whole dollars, exclude cents.
    return '$' + n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  init_secondary_nav: function() {
    $('#tabs.nav-tabs a').each(function() {
      if ($(this).parent('li').hasClass('init-toggle')) {
        $(this).click();
      }
    });
  },
  init_edit_pledge: function() {
    $('.send_parent_pledge_notification_email').on('click', function (e) {
      e.preventDefault();
      var should_send_email = confirm('Are you sure you want to send the sponsor a payment request email?');
      if (should_send_email) {
        var data = {"pledge_id":$('input[name="s_pledge_id"]').val()};
        $.ajax({
          url: 'email_sponsor_payment_request',
          data: data,
          type:'post',
          success: function(result_json) {
            var result = JSON.parse(result_json);
            if(result.success) {
              alert('Email successfully sent');
            }
          }
        });
      }
    });
    var edit_pledge_buttons = '#my_pledges_table .pledge_row, #my_pledges_table #mobile-pledge-edit';
    if($('#my_pledges_table #mobile-pledge-edit').length) {
      edit_pledge_buttons = '#my_pledges_table #mobile-pledge-edit';
    }
    $(edit_pledge_buttons).click(function() {
      update_edit_form_content($(this));
      $("#edit-pledge-form-wrapper").modal('show');
      tk_common.scroll_top();
      clear_form_errors();
      edit_pledge_amount_update();
    });
    $('body').on('change', '#s_pledge-type', function() {
      if(this.value === '3') {
        $('.visible-per-lap-only-edit').hide();
      } else {
        $('.visible-per-lap-only-edit').show();
      }
    });
    function update_edit_form_content(obj) {
      update_edit_form_from_data(obj);
      set_readonly_fields(obj);
    }
    function update_edit_form_from_data(data_element) {
      $('select[name=s_sponsor_type]').val($(data_element).data('pledge-sponsor_type'));
      $('input[name=s_first_name]').val($(data_element).data('pledge-first_name'));
      $('input[name=s_last_name]').val($(data_element).data('pledge-last_name'));
      $('input[name=s_email]').val($(data_element).data('pledge-email'));
      $('input[name=s_phone]').val($(data_element).data('pledge-phone'));
      $('select[name=s_state]').val($(data_element).data('pledge-state'));
      $('select[name=s_country]').val($(data_element).data('pledge-country'));
      $('select[name=s_type]').val($(data_element).data('pledge-type'));
      $('input[name=s_flat]').val($(data_element).data('pledge-flat'));
      $('input[name=s_amount]').val($(data_element).data('pledge-amount'));
      $('input[name=s_pledge_id]').val($(data_element).data('pledge-id'));
      $('input[name=s_pledge_status]').val($(data_element).data('pledge-status'));
      $('input[name=s_sponsor_id]').val($(data_element).data('pledge-sponsor_id'));
      $('input[name=s_sponsor_user_id]').val($(data_element).data('pledge-sponsor_user_id'));
      $('input[name=s_confirm_change_required]').val($(data_element).data('pledge-confirm_change_required'));
      $('input[name=s_online_pending_payment_status_id]').val($(data_element).data('online_pending_payment_status_id'));
      $('input[name=s_initial_amount]').val();
      $('input[name=s_initial_type]').val($(data_element).data('pledge-type'));
      $('.unit-modifier').text($(data_element).data('unit-modifier'));
      $('.unit-name').text($(data_element).data('unit-name'));
      $('.unit-name-plural').text($(data_element).data('unit-name_plural'));
      $('.unit-lower-limit').html($(data_element).data('unit-lower_limit'));
      $('.unit-upper-limit').html($(data_element).data('unit-upper_limit'));
      $('.pledge-ppl-amount').html($(data_element).data('pledge-amount'));
      if(data_element.data('pledgeType') === 3) {
        $('.visible-per-lap-only-edit').hide();
      } else {
        $('.visible-per-lap-only-edit').show();
      }
      // Set Dynamic Unit Type in Pledge Type Select
      var pledge_type_select = $('#s_pledge-type');

      if(pledge_type_select.val() === "1") {
        pledge_type_select.find('option[value="1"]').remove();
        pledge_type_select.append('<option value="1">Pledge ' + capitalize_words($(data_element).data('unit-modifier')) + ' ' + capitalize_words($(data_element).data('unit-name')) + '</option>');
        pledge_type_select.val("1");
      }
      $('#s_pledge_type_readonly').val($("select[name=s_type] option:selected").text());
    }

    function capitalize_words(inc_text) {
      var sentence = inc_text.split(" ");
      var output = "";
      for (var i = 0; i < sentence.length; i++) {
        var lowerWord = sentence[i].toLowerCase();
        lowerWord = lowerWord.trim();
        var capitalized_word = lowerWord.slice(0, 1).toUpperCase() + lowerWord.slice(1);
        output += capitalized_word;
        if (i !== sentence.length - 1) {
          output += " ";
        }
      }
      output[output.length - 1] = '';
      return output;
    }

    function set_readonly_fields(id) {
      var laps = '';
      if (typeof id !== 'undefined' && id !== null) {
        var row = $(id);
        laps = row.data('pledge-laps');
      }
      var pledgeStatus = $('input[name=s_pledge_status]').val().toLowerCase();
      var valid_payment_status_ids = ['1','2','3'];
      var has_paid_or_pending_payment = valid_payment_status_ids.indexOf($('input[name=s_online_pending_payment_status_id]').val()) >= 0;
      var i_am_not_sponsor = $('input[name=s_sponsor_user_id]').val() != $('input[name=s_currUserId]').val();
      if(pledgeStatus === 'paid online' || pledgeStatus === 'payment scheduled' || has_paid_or_pending_payment) {
        $('.send_parent_pledge_notification_email').hide();
      } else {
        $('.send_parent_pledge_notification_email').show();
      }
      if (pledgeStatus == 'paid online' || (pledgeStatus == 'confirmed' && laps !== '') || (pledgeStatus =='pending' && has_paid_or_pending_payment && i_am_not_sponsor) ) {
        $('select[name=s_type]').hide();
        $('#s_pledge_type_readonly_container').show();
        $('input[name=s_amount]').attr('readonly', 'readonly');
        $('#modal_delete_pledge_link').hide();
      } else {
        set_type();
        $('select[name=s_type]').show();
        $('#s_pledge_type_readonly_container').hide();
        if ( (has_paid_or_pending_payment && i_am_not_sponsor)) {
          $('select[name=s_type]').attr('readonly', 'readonly');
          $('select[name=s_type]').prop('disabled', 'disabled');
          $('input[name=s_amount]').attr('readonly', 'readonly');
        } else {
          $('select[name=s_type]').removeAttr('readonly');
          $('select[name=s_type]').prop('disabled', false);
          $('input[name=s_amount]').removeAttr('readonly');
        }
        $('#modal_delete_pledge_link').show();
      }
    }

    function set_type() {
      if ($('#type_limit').val() == 1) {
        $('select[name=s_type]').find("option[value='1']").remove();
      } else if ($("select[name=s_type] option[value='1']").length === 0) {
        $("select[name=s_type]").prepend("<option value='1'>Pledge Per Lap</option>");
      }
    }

    /* disabled fields cannot be submitted, <select> does not have a readonly attr */
    function unset_disabled_select() {
      $('select[name=s_type]').removeAttr('disabled');
    }
    $('#edit_pledge_modal_form').submit(function(e) {
      e.preventDefault();
      var form = $('#edit_pledge_modal_form');
      unset_disabled_select();
      $.ajax({
        url: "/pledges/validate_edit",
        data: form.serialize(),
        type: 'POST',
        dataType: 'json',
        success: function(result) {
          if (result && result.success) {
            update_pledge($('input[name=s_pledge_id]').val(), $("#edit_pledge_modal_form").serialize());
          } else if (result && !result.success) {
            $("#edit_pledge_modal").modal('show');
            set_readonly_fields();
            $('body').scrollTop(0);
            $("#edit-pledge-form-wrapper #error-notify").show();
            $.each(result.errors, function(key, val) {
              if ($('#mobile-pledge').length > 0) {
                if (val != '') {
                  tk_common.pledge_error_handler_mobile(form, key, val);
                } else {
                  form.find('[name=' + key + ']').parent('.form-group')
                          .removeClass('has-error');
                  form.find('[name=' + key + ']')
                          .parent('.form-group .help-block').remove();
                }
              } else {
                //don't bother with empty error values
                if (val != '') {
                  tk_common.pledge_error_handler(form, key, val);
                } else {
                  form //target form
                          .find('[name=' + key + ']') //find element input within form
                          .closest('.control-group') //container control-group of input element
                          .removeClass('error') //bootstrap error removal
                          .find('.multi-form-alert') //find next button by class
                          .attr('data-original-title', val) //set the tooltip title to the alert value
                          .addClass('hide') //hide
                }
              }
            });
          } else { //invalid response
            // TODO: handle invalid or no response
          }
        } //END AJAX SUCCESS
      });
    });
    function update_pledge(pledge_id, data) {
      $.ajax({
        url: "/dashboard/update_pledge/" + pledge_id,
        data: data,
        type: 'POST',
        dataType: 'json',
        success: function(result) {
          if (result && result.success) {
            window.location.reload(true);
          } else { //invalid response
            // TODO: handle invalid or no response
          }
        } //END AJAX SUCCESS
      });
    }
    function clear_form_errors() {
      var form = $('#edit_pledge_modal_form');
      form.find('.form-group').each(function() {
        $(this).removeClass('has-error');
        $(this).find('.help-block').remove();
      });
      $("#edit-pledge-form-wrapper #error-notify").hide();
    }
    $('select[name=s_type]').change(function() {
      edit_pledge_amount_update();
      if ($('select[name="s_type"]').val() !== $('input[name="s_initial_type"]').val()) {
        $('input[name="s_amount_or_type_changed"]').val('1');
      } else {
        $('input[name="s_amount_or_type_changed"]').val('0');
      }
    });
    $('input[name="s_amount"]').keyup(function() {
      edit_pledge_amount_update();
      if ($('input[name="s_amount"]').val() !== $('input[name="s_initial_amount"]').val()) {
        $('input[name="s_amount_or_type_changed"]').val('1');
      } else {
        $('input[name="s_amount_or_type_changed"]').val('0');
      }
    });
    function edit_pledge_amount_update() {
      var pledge_type = $('select[name="s_type"]').find("option:selected").text();
      var pledge_type_id = $('select[name="s_type"]').val();
      var amount = ($('input[name="s_amount"]').length > 0) ?
              $('input[name="s_amount"]').val() :
              $('select[name="s_amount"]').val();
      var amount_string;
      var low = tk_common.multipliers[pledge_type_id].low;
      var high = tk_common.multipliers[pledge_type_id].high;
      if (pledge_type.toLowerCase() == 'flat donation') {
        amount_string = '$' + (low * amount).toFixed(2);
        $('#modal-per-lap-reminder').addClass('hide');
      } else {
        amount_string = '$' + (low * amount).toFixed(2) + ' - ' + '$' + (high * amount).toFixed(2);
        $('#modal-per-lap-reminder').removeClass('hide').find('#descript-amount').text(amount);
      }
      $('#modal-est-pledge-total').text(amount_string);
    }
    $("#edit_pledge_modal_form button.multi-form-alert").click(function (e) {
      e.preventDefault();
    });
    $("#modal_update_pledge_button").click(function (e) {
      if ($('input[name="s_amount_or_type_changed"]').val() == '1' &&
              $('input[name="s_confirm_change_required"]').val() == '1') {
        if ($('#mobile-pledge').length > 0) {
          $("#edit_pledge_modal").hide();
          $("#confirm_edit_pledge_modal").fadeIn();
          $("#modal-overlay").fadeIn().css('z-index', '21');
          $('#modal_confirm_edit_delete_pledge_button').attr('data-action', 'edit');
        } else {
          $("#edit_pledge_modal").modal('hide');
          $("#confirm_edit_pledge_modal").modal({"backdrop": "static"});
          $('#modal_confirm_edit_delete_pledge_button').attr('data-action', 'edit');
        }
      } else {
        $('#edit_pledge_modal_form').submit();
      }
    });
    $("#modal_delete_pledge_link").click(function (e) {
      $('#edit-pledge-form-wrapper').modal('hide');
      $("#confirm_edit_pledge_modal").modal('show');
      $('#modal_confirm_edit_delete_pledge_button').attr('data-action', 'delete');
    });
    $('#modal_confirm_edit_delete_pledge_button').click(function (e) { // Button which confirm edit/delete pledge
      if ($('#mobile-pledge').length > 0) {
        $("#modal-overlay").fadeOut().css('z-index', '20');
      } else {
        $('#confirm_edit_pledge_modal').modal('hide');
      }
      if ($('#modal_confirm_edit_delete_pledge_button').data('action') === 'delete') {
        delete_pledge();
      } else {
        if ($('#modal_confirm_edit_delete_pledge_button').data('action') === 'edit') {
          $('#edit_pledge_modal_form').submit();
        }
      }
    });
    $('#modal_confirm_cancel_button').click(function (e) { // Button which confirm edit/delete pledge
      $('#confirm_edit_pledge_modal').modal('hide');
    });
    function delete_pledge() { //$("#modal_delete_pledge_link").click(function(e){
      pledge_id = $('input[name=s_pledge_id]').val();
      $.ajax({
        url: "/participant_dashboard/student_delete_pledge/" + pledge_id,
        type: 'POST',
        dataType: 'json',
        success: function (result) {
          if (result && result.status) {
            window.location.reload(true);
          } else { //invalid response
            // TODO: handle invalid or no response
          }
        } //END AJAX SUCCESS
      });
    }
  },
  bind_mobile: function() {
    if ($('#mobile-pledge').length > 0 || true) {
      $('#pledge_form').submit(function (e) {
        e.preventDefault();
      });

      $('#close-pledge-form, #pledge-form-overlay').click(function (e) {
        if ($('#pledge_form').length > 0) {
          $('#pledge_form')[0].reset();
        }
        $('#edit_pledge_modal_form')[0].reset();
        $('#edit-pledge-form-wrapper').modal('hide');
      });

      $('#modal-overlay').click(function () {
        $('#modal-overlay').fadeOut().css('z-index', '20');
        $('.modal-m').fadeOut();
      });

      $(document).on("click", ".pledge-confirm", function () {
        $(this).parents('.modal-m').fadeOut();
        $('#modal-overlay').fadeOut().css('z-index', '20');
      });
    }

    // On load and bind hide fields
    $('#pledge_form input[name=other_type]').parent('.form-group').hide().end().attr('disabled', 'disabled');
    $('#pledge_form input[name=business_name]').parent('.form-group').hide().end().attr('disabled', 'disabled');
    $('#pledge_form input[name=business_site]').parent('.form-group').hide().end().attr('disabled', 'disabled');
  },
  mobile_modal: function(id) {
    $('#modal-overlay').fadeIn();
    $(id).fadeIn();
    tk_common.scroll_top();
  },
  setup_modal_scroll: function() {
    $('.modal').on('show', function() {
      tk_common.scroll_top();
    });
  },
  scroll_top: function() {
    $('html, body').animate({
      scrollTop: 0
    }, 400);
  },
  //centers the header to the container vertically
  format_lines_to_center_vertical_and_limit_text: function(header, container, limitTextLength) {
    // @TODO: checks
    // 1. is text
    // 2. is 'header' contained by 'container'
    // 3. jquery objects

    if (header instanceof $ !== true || container instanceof $ !== true) {
      throw new Error("format_lines_to_center_vertical_and_limit_text needs to be passed jquery objects");
    }

    //check if it is firefox
    var isWebkit = window.navigator.userAgent.indexOf('AppleWebKit') > -1;

    //heights
    var headerH = header.height();
    var containerH = container.height();
    //centers
    var headerCenter = headerH / 2;
    var containerCenter = containerH / 2;
    //change needed to achieve vertical alignment
    var delta = containerCenter - headerCenter;
    //calculating the rows
    var lineHeight = header.css('line-height');
    var rows = parseInt(headerH) / parseInt(lineHeight);

    //centering the string
    header.css('top', delta.toString() + 'px');

    // if there are more than 3 rows then it will overflow the header background.
    if (header.text().length >= limitTextLength) {
      header.text(header[0].innerHTML.slice(0, limitTextLength - 5) + "...");
    }

    //show the header based on browser
    if (isWebkit) {
      $('#header_top h1.header_title').css({
        position: 'absolute',
        display: '-webkit-box',
        '-webkit-line-clamp': '3',
        '-webkit-box-orient': 'vertical',
        'text-overflow': 'ellipsis',
        '-o-text-overflow': 'ellipsis',
        '-ms-text-overflow': 'ellipsis'
      });
    } else {
      $('#header_top h1.header_title').css({
        'position': 'absolute',
        'display': 'block'
      });
      if (rows > 2) {
        header.text(header[0].innerHTML.slice(0, 75 - 5) + "...");
      }
    }
  },
  // get the value for a stored cookie for a given name
  // debug mode just prints all cookies key and values.
  get_cookie_value_from_key: function (k, isDebugMode) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i].split('=');
      if(c.length > 1){
        var key = c[0].replace(' ', '');
        var val = c[1].replace(' ', '');
        if (isDebugMode) {
          console.log('key: ' + key + '\n' + 'value: ' + val + '\n');
        }
        if (key == k) {
          return val;
        }
      }
    }
    return 'cookie_val_missing';
  },
  //Adds an onclick event to the Sponsor Pay Now Button on desktop to submit 
  //the hidden form which contains only the pledge id
  pledge_sponsor_payment: function() {
    $('#pay_now_btn').click(function(e) {
      $('#pledge_form').attr('action', '/sponsor/payment').attr('method', 'POST').submit();
    });
  },
  // Adds an onlick event to the sponsor pay now button on mobile to submit
  // the hidden for which contains only the pledge id
  pledge_sponsor_payment_mobile: function() {
    $('#pay_now_btn').click(function(e) {
      $('#sponsor_paynow_form').attr('action', '/sponsor/payment').attr('method', 'POST').submit();
    });
  },
  attach_google_analytics_click_handlers: function() {
    var selector = '.ga_track[data-share]';
    $('body').on('click', selector, function(e) {
      tk_common.determine_element_category_and_report($(this));
    });
  },
  determine_element_category_and_report: function(selector) {
    var node = $(selector);
    var category = node.attr('data-category') ? node.attr('data-category') : 'share button';
    var action = node.attr('data-action') ? node.attr('data-action') : 'click';
    var label = node.attr('data-share');
    ga('send', 'event', category, action, label, null);
  },
  setup_progress_bar: function(hasProgressMax, progressBar, pledgeGoalPercent, isMobile) {
    if (hasProgressMax) {
      var max = progressBar.attr('max');
      var time = (1000 / max) * 3;
      var value = progressBar.val();
      var keepCounting = true;

      var loading = function() {
        $('.progress-value').html(value + '%');
        if (value == pledgeGoalPercent /*Pledge goal percent*/) {
          clearInterval(animate);
          keepCounting = false;
        }
        if (keepCounting) {
          value += 1;
          progressBar.val(value);
        }
      };

      var animate = setInterval(function() {
        loading();
      }, time);
    } else {
      $('.progress-value').html(pledgeGoalPercent.toString() + '%');
    }

    if (isMobile) {
      var percent = pledgeGoalPercent || 0;
      var percent_whole = Math.floor(percent * 100);
      var offset = 0;
      var progress = Math.floor(percent * $('.pledge-goal-progress').width());
      if (percent_whole == 100) {
        offset = 45;
      } else if (percent_whole >= 98) {
        offset = 35;
      } else if (percent_whole >= 96) {
        offset = 25;
      } else {
        offset = 0;
      }
      var percent_position = Math.floor(progress - offset);
      percent_position += 'px';
      $('.pledge-goal-progress-percent').attr('style', '');
      $('.pledge-goal-progress-percent').css('margin-left', percent_position);
    }
  },
  prepare_tabs_for_jquery_ui: function(containing_node_css_selector) {
    $(containing_node_css_selector).tabs();
  },
  valid_pledge_amount: function(form) {
    var pledge_type = $('#pledge-type').val();
    var amount = tk_common.get_pledge_amount();
    if (tk_common.multipliers[pledge_type].low < tk_common.multipliers[pledge_type].high) {
      estimated = amount * tk_common.multipliers[pledge_type].high;
    } else {
      estimated = amount;
    }
    return estimated < 10000;
  },
  setup_mask_page_menu_open: function () {
    $(".menu").click(function () {
      if (document.getElementsByClassName("hide_page_for_menu")[0].style.display == "block") {
        document.getElementsByClassName("hide_page_for_menu")[0].style.display = "none";
      } else {
        document.getElementsByClassName("hide_page_for_menu")[0].style.display = "block";
      }
    });
  },
  hide_pledge_comment: function () {
    $('.hide-comment-btn').click(function (e) {
      e.preventDefault();
      confirmed = confirm('Are you sure you would like to permanantly hide this comment?');
      if (confirmed) {

        var bapi_pid = $(this).attr('data-bapi-pid');
        var tk_pid   = $(this).attr('data-tk-pid');

        $.ajax({
          type: "POST",
          url: "/dashboard_ajax/hide_comment/",
          dataType: 'json',
          data: {
            'tk_pid': tk_pid,
            'bapi_pid': bapi_pid
          }
        })
                .done(function (response) {
                  if (response.hasOwnProperty('success')) {
                    if (response.success.status_code == 200) {
                      $('#comment-' + bapi_pid).prev().addClass('pledge-borders');
                      $('#comment-' + bapi_pid).remove();
                    } else {
                      alert('There was a problem hiding this comment. Please try again.')
                    }
                  }
                });
      }
    });
  },
  participant_stats: function() {
    $('.highcharts_js').each(
      function() {
        Highcharts.chart(
          this.dataset.target,
          {
            chart: {
              type: 'bar',
              marginLeft: 120
            },
            title: {
              text: ''
            },
            xAxis: {
              categories: JSON.parse(this.dataset.categories),
              title: {
                text: null
              }
            },
            tooltip: {
              enabled: false
            },
            colors: ['#5cb85c'],
            yAxis: {
              min: 0,
              title: {
                text: this.dataset.text,
                align: 'high'
              },
              labels: {
                overflow: 'justify'
              }
            },
            plotOptions: {
              bar: {
                dataLabels: {
                  enabled: true,
                  crop: false,
                  overflow: "none"
                }
              }
            },
            legend: {
              enabled: false
            },
            credits: {
              enabled: false
            },
            series: JSON.parse(this.dataset.series)
          }
        );
      }
    );
  },
  collapse_target_functionality: function() {
    $('.collapse_target').on('click',function(e){
      e.preventDefault();
      $($(this).data('collapsetarget')).slideToggle();
    });
  },
  sum_itemstosum_functionality: function() {
    var sum = function(element) {
      var sumSelector = $(element).data('itemstosum');
      var total = $(sumSelector).toArray().reduce(
        function(carry, item) {
          var value = parseInt(item.value);
          value = value ? value : 0;
          return carry += value;
        },
        0
      );
      $(element).html(total);
    };
    var calculate = function() {
      $('[data-itemstosum]').each(
        function() {
          sum(this);
        }
      );
    };
    $('[data-itemstosum]').each(
      function() {
        $($(this).data('itemstosum')).each(
          function() {
            this.addEventListener('input', calculate);
          }
        );
      }
    );
    calculate();
  },
  disable_target_functionality:function(){
    $('.disable_target').on('click',function(e){
      e.preventDefault();
      $($(this).data('disabletarget')).prop('disabled', function(i, v) { return !v; });
    });
  },
  disable_register_enter_keypress:function(){
    $('#parent_register_getcode input[name=query]').on('keypress', function(e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        return false;
      }
    });
  },
  set_help_request_template:function(){
    $('#help_desk_issue_type').change(function() {
      var select_field = $(this);
      var message_field = $('#help_desk_message'); 
      var message_template = "Describe the issue you are experiencing:\n\n\nDescribe the steps you took:\n\n\nAre you on Mobile, Tablet, or Desktop? Web browser (Safari, IE, Firefox.):\n\n\n";  
      if (select_field.val() == "online_only_override") {
        $('#help_desk_form .form-group').not('.no-collapse').slideUp();
        $('#help_desk_wrapper p.enable-cash-check-text').slideDown();
        $('#help_desk_wrapper p.default-text').slideUp();
        $('#help_desk_form button[type="submit"]').html('Enable Cash/Check Payments');
      } else {
        $('#help_desk_form button[type="submit"]').html('Submit');
        $('#help_desk_wrapper p.default-text').slideDown();
        $('#help_desk_wrapper p.enable-cash-check-text').slideUp();
        $('#help_desk_form .form-group').slideDown();
        if(select_field.val() == "bug"){
          message_field.val(message_template);
        } else {
          message_field.val('');
        }
        message_field.slideDown();
      }

    });

    if($('#help_desk_issue_type').val()) {
      $('#help_desk_message').show();
    }


  },
  /**
   * keep the top menu dropdown at max height and maintain max height on window resize
   **/
  bootstrap_fixed_nav_heights: function(){
    //set size to current window
    tk_common.resize_bootstrap_fixed_nav();
    //set to resize when window resizes
    $( window ).resize(function() {
      tk_common.resize_bootstrap_fixed_nav();
    });
  },
  resize_bootstrap_fixed_nav: function(){
    var nav_height = $(".navbar-fixed-top").height();
    if($('#fixed_nav_height').height() != nav_height){
      $("#fixed_nav_height").css({height: nav_height + "px"});
    }
    $(".navbar-fixed-top .navbar-collapse").css({ maxHeight: $(window).height() - $(".navbar-fixed-top .navbar-header").height() + "px" });
  },
  teacher_tasks_widget: function () {

    $('.tasks-widget input.list-child').change(function() {

      var target_task = $(this);
      var task_id = target_task.parents('li').attr('data-task-id');
      var action = '';
      var err_msg = '';

      if(target_task.is(':checked')) {

        action = 'complete';
        err_msg  = 'There was an error while attempting to mark this task as complete. Please try again.';

      } else {

        target_task.parents('li').removeClass("task-done");
        action = 'open';
        err_msg  = 'There was an error while attempting to update this task. Please try again.';

      }

        $.ajax({
          type: 'POST',
          url: '/student/dashboard/tasks/'+task_id+'/'+action,
          dataType: 'json',
          success: function(response){

            if(response.success === true) {
              if(action == 'complete') {
                target_task.parents('li').removeClass().addClass("task-done completed");
              } else {
                target_task.parents('li').removeClass("task-done");
                target_task.parents('li').removeClass().addClass("incomplete");
              }
            } else {
              alert(err_msg);
            }

          }
        });

    });


    $('.task-filter-btn').on('click', function(e){

      e.preventDefault();

      var filter = $(this);
      var type = filter.attr('data-filter-type');

      filter_tasks(type);

      $('.task-filter-nav li').removeClass('active');
      filter.parent('li').addClass("active");

    });


    function filter_tasks(status) {

      $('.task-list li').removeClass('hide');

      if(status == 'all') {
        $('.task-list li').slideUp(300);
        $('.task-list li').slideDown();
      } else {
        $('.task-list li').slideDown();
        $('.task-list li').not('.'+status).slideUp(300);
      }
    }

  },
  prevent_sponsor_student_registration: function(){

    runRelationshipStatusActions($('#relationshipCheckBox').get(0), false);

    $('#ButtonAcceptTerms').on('click', function(e) {
      isParent = runRelationshipStatusActions($('#relationshipCheckBox').get(0), true);
      if (isParent === false) {
        e.preventDefault();
      }
    });

    $('#relationshipCheckBox').change(function() {
      runRelationshipStatusActions(this, true);
    });

    function runRelationshipStatusActions (check_field, show_errors) {
      if (typeof check_field != 'undefined') {
        if(check_field.checked) {
          $('#reg_relationship').val('parent');
          if (show_errors) {
            $("#sponsor-reg-alert").slideUp();
            $("#ButtonAcceptTerms").removeAttr('disabled');
          }
          return true;
        } else {
          $('#reg_relationship').val('sponsor');
          if (show_errors) {
            $("#sponsor-reg-alert").hide().removeClass('hide').slideDown();
            $("#ButtonAcceptTerms").attr('disabled', 'disabled');
          }
          return false;
        }
      }
    }
  },
  handle_system_alerts: function(){
    $("#system-alerts-modal").modal('show');
  },
  enable_bootstrap_tooltips: function(){
    $('[data-toggle="tooltip"]').tooltip();
  },
  enable_non_parent_pledge_instructions: function() {
    $('.pledge-a-student').on('click', function(){
      $('.contact-parent').show();
    });
  },
  enable_alpha_only_text_input: function() {
    $(".alpha-only").on("keydown", function(event){
      // Ignore controls such as tab, backspace, end, etc.
      var arr = [8,9,16,17,20,35,36,37,38,39,40,45,46];

      // Allow letters
      for(var i = 65; i <= 90; i++){
        arr.push(i);
      }

      if(jQuery.inArray(event.which, arr) === -1){
        event.preventDefault();
      }
    });

    //Monitor for copy/paste
    $(".alpha-only").on("input", function(){
        var regexp = /[^a-zA-Z]/g;
        if($(this).val().match(regexp)){
          $(this).val( $(this).val().replace(regexp,'') );
        }
    });
  },
  init : function(){
    //Items used throughout the dashboard
    tk_common.bulk_items();
    tk_common.hide_pledge_comment();
    tk_common.participant_stats();
    //PLEDGE WIDGET
    tk_common.pledge_extend_toggle();
    tk_common.pledge_progression();
    tk_common.pledge_state_select();
    tk_common.pledge_country_select();
    tk_common.pledge_sponsor_type();
    tk_common.pledge_type();
    tk_common.pledge_amount();
    tk_common.pledge_email_confirm();
    tk_common.pledge_submit_click();
    tk_common.pledge_edit_pledge_info_click();
    tk_common.pledge_success_click();
    tk_common.init_secondary_nav();
    tk_common.init_edit_pledge();
    tk_common.bind_mobile();
    tk_common.bootstrap_fixed_nav_heights();
    tk_common.help_program_id_selector();
    tk_common.format_lines_to_center_vertical_and_limit_text($('#header_top > div > h1'), $('#header_top'), 94);

    //SCHOOL REWARDS CAROUSEL
    tk_common.school_carousel();
    tk_common.family_public_carousel();

    //NO IDEA what this is, Thanks Seltzer
    tk_common.wth();
    tk_common.setup_modal_scroll();
    tk_common.attach_google_analytics_click_handlers();
    tk_common.setup_mask_page_menu_open();
    tk_common.collapse_target_functionality();
    tk_common.sum_itemstosum_functionality();
    tk_common.disable_target_functionality();
    tk_common.disable_register_enter_keypress();
    tk_common.set_help_request_template();
    tk_common.teacher_tasks_widget();
    tk_common.prevent_sponsor_student_registration();
    tk_common.handle_system_alerts();
    tk_common.enable_bootstrap_tooltips();
    tk_common.enable_non_parent_pledge_instructions();
    tk_common.enable_alpha_only_text_input();
  }
};
