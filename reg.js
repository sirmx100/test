  $(document).ready(function(){
    registerJS.init();
  });
  
  /**
   * 
   * @TODO : verify that this function is actually needed.
   */
  var registerJS = {

    set_pledge_goal_on_refresh : function() {
      if ( $('#pledge-goal').length > 0 ) {
        registerJS.pledge_goal_update();
      }
    },

    watch_pledge_goal_for_change : function(){
      $('#pledge-goal').keyup(registerJS.pledge_goal_update);
    },

    pledge_goal_update : function(){
      var str = $('#pledge-goal').val();
      var amount = Math.floor((str == '' ? 0 : parseFloat(str))*100)/100; // whole cents only
      var pledge_type_id = 1; //ppl
      var low  = tk_common.multipliers[pledge_type_id].low;
      var high = tk_common.multipliers[pledge_type_id].high;
      var amount_string = '$0';

      if (amount > 0) {
        amount_string = tk_common.money_format( ( low  * amount ) ) +
        ' - ' + tk_common.money_format( ( high * amount ) );
      }

      $('#est-pledge-total').text( amount_string );
    },

    remove_errors_on_change: function(){
      $('input, select').on('change keyup', function(e){
        if( $(e.currentTarget).val() && $(e.currentTarget).val() !== 'default' ) {
          $(this).closest('.error').removeClass('error');
          $($(this).siblings('p')).hide();
          $(this).parent().siblings('.reg-error').hide();
        }
        if( $('.error').length === 0 ) {
          $('.alert-error').hide();
        }
      });
    },

    //Lift off!
    init : function(){
      registerJS.set_pledge_goal_on_refresh();
      registerJS.watch_pledge_goal_for_change();
      registerJS.remove_errors_on_change();
    }
  };

