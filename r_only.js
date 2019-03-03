  $(document).ready(function(){
    register_only_js.init();
  });

  var register_only_js = {

    email_change_gather_input : function() {
      $('input[name="parent_email"]').on("change paste", function(e){
        var new_email = $('input[name="parent_email"]').val();
        register_only_js.email_change_check(new_email);
      });

      $('input[name="parent_email"]').on("keyup", function(e){
        var re = /@/;
        var new_email = $('input[name="parent_email"]').val();
        if (re.test(new_email)) {
          register_only_js.email_change_check(new_email);
        } else {
          register_only_js.show_email_check_error(false);
        }
      });
 
      $('#reset_button').on('click', function(e) {
        var new_email = $('input[name=parent_email]')[0].value;
        register_only_js.forgot_password(new_email);
      });
    },
    email_change_check : function(new_email){
      $.ajax({
        type: 'POST',
        url: '/participant/profile/user_exists',
        data: {new_email: new_email},
        dataType: 'json',
        success: function( result ) {
          if( result != false) {
            register_only_js.show_email_check_error(true);
          } else {
            register_only_js.show_email_check_error(false);
          }
        }
      });
   },

    show_email_check_error : function(show) {
      if (show) {
        $('#registration_form div.login-required').removeClass("hide");
        $('#login_required_hide_parent').addClass("hide");
        $('#login_required_hide_part_info').addClass("hide");
        $('input[name="login_required"]').val('1');
        login_email = $('#registraion_form input[name="parent_email"]').val();
      } else {
        $('#registration_form div.login-required').addClass("hide");
        $('#login_required_hide_parent').removeClass("hide");
        $('#login_required_hide_part_info').removeClass("hide");
        $('input[name="login_required"]').val('0');
      }
    },

    forgot_password : function(email){
      this.post('/forgot-password', {email: email});
    },
    
    post : function(path, params, method) {
      method = method || "post"; // Set method to post by default if not specified.
      var form = document.createElement("form");
      form.setAttribute("method", method);
      form.setAttribute("action", path);
      for(var key in params) {
        if(params.hasOwnProperty(key)) {
          var hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", params[key]);
          form.appendChild(hiddenField);
        }
      }
      document.body.appendChild(form);
      form.submit();
    },
    attach_input_masks : function() {
      var samsungRegex = /SAMSUNG|SGH-[I|N|T]|GT-[I|P|N]|SM-[N|P|T|Z]|SHV-E|SCH-[I|J|R|S]|SPH-L/i;
      var isNotSamsungPhone = ! navigator.userAgent.match(samsungRegex);
      if( isNotSamsungPhone ) {
        $("input[name='parent_phone']").mask("(999) 999-9999",{placeholder:" ", autoclear: false});
      }
      $('#registration_form').submit(function(e){
         $("input[name='parent_phone']").val($("input[name='parent_phone']").val().replace(/\D/g,''));
      });
    },

    //Lift off!
    init : function(){
      register_only_js.email_change_gather_input();
      register_only_js.attach_input_masks();
    }
  };

