function onSuccess(googleUser) {
    var profile = googleUser.getBasicProfile();
    gapi.client.load('plus', 'v1', function () {
        var request = gapi.client.plus.people.get({
            'userId': 'me'
        });
        request.execute(function (resp) {
            localStorage.setItem("name", resp.displayName);
            localStorage.setItem("id", resp.id);
            $('#user').html(resp.displayName);
            var signOut = '<a href="javascript:void(0);" onclick="signOut();">Sign out</a></div>';
            $('#gplus').html(signOut);
        });
    });
}
function onFailure(error) {
    alert("Login failed");
    console.log(error);
}
function renderButton() {
    gapi.signin2.render('gplus', {
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
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        $('user').html("Log In");
        $('#gplus').slideDown('slow');
    });
}