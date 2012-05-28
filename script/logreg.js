var login = function(user, pass) {
                $.post("/api/login", { username: user, password: pass }, function(r) {
                                if(r.error == 0) {
                                        $.cookie("lufny_uid", r.uid, {expires: 36500});
                                        window.location="index.html";
                                } else {
                                        noty({
                                                text: 'An error has occurred.',
                                                layout: 'bottomRight',
                                                type:   'error'
                                        });
                                }
		});
}


$(document).ready(function(){
        $("#login_it").click(function() {
                if ($("#login_user").val() != "" && $("#login_pass").val() != "") {
                        login($("#login_user").val(), $("#login_pass").val());
                }
        });

        $("#reg_it").click(function() {
                var username = $("#username").val(),
                        password = $("#password").val(),
                        name = $("#name").val(),
                        surname = $("#surname").val(),
                        mail = $("#mail").val(),
                        bday = $("#DateOfBirth_Day").val()+"/"+$("#DateOfBirth_Month").val()+"/"+$("#DateOfBirth_Year").val(),
                        sex = $("#sex").val(),
                        lang = $("#lang").val(),
                        challenge = document.getElementsByName("recaptcha_challenge_field")[0].value,
                        response = document.getElementsByName("recaptcha_response_field")[0].value;

			$.post("/api/register", {username: username, password: password, rname: name, rsurname: surname, mail: mail, recaptcha_challenge_field: challenge, recaptcha_response_field: response, bday: bday, sex: sex, language: lang}, function(r) {
                        if (r.error == 0) {
                                noty({
                                        text: 'Everything went ok.',
                                        layout: 'bottomRight',
                                        type:   'alert'
                                });
				setTimeout(function() { login(username, password); }, 700);
                        } else {
                                noty({
                                        text: 'An error occured',
                                        layout: 'bottomRight',
                                        type:   'error'
                                });
                        }
                });
        });
});
