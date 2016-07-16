function onSuccess(googleUser) {
    var profile = googleUser.getBasicProfile();
    gapi.client.load('plus', 'v1', function () {
        var request = gapi.client.plus.people.get({
            'userId': 'me'
        });
        request.execute(function (resp) {
            localStorage.setItem("name", resp.displayName);
            localStorage.setItem("id", resp.id);
			$('#gSignIn').slideUp('slow');
            $('.gSignIn').html('');
            $('.userContent').html(resp.displayName);
            var signOut = '<a href="#" onclick="signOut();">&nbsp;&nbsp;Sign out</a>';
            $('#logOut').html(signOut);
			$('header section').css("flex-direction", "row");
			$('.userContent').css("margin-bottom", "0");
        });
    });
}
function onFailure(error) {
    alert("Login failed");
    console.log(error);
}
function renderButton() {
    gapi.signin2.render('gSignIn', {
        'scope': 'profile email',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'light',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}
function signOut() {
	console.log("in sign out");
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
		$('#logOut').html('');
		$('header section').css("flex-direction", "column");
        $('.userContent').html('Guest');
        $('#gSignIn').slideDown('slow');
		localStorage.setItem("name", false);
        localStorage.setItem("id", false);
    });
}