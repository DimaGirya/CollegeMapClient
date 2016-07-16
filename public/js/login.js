function onSuccess(googleUser) {
    var profile = googleUser.getBasicProfile();
    gapi.client.load('plus', 'v1', function () {
        var request = gapi.client.plus.people.get({
            'userId': 'me'
        });
        //Display the user details
        request.execute(function (resp) {
            localStorage.setItem("name", resp.displayName);
            localStorage.setItem("id", resp.id);
            $('#user').html(resp.displayName);
            var signOut = '<a href="javascript:void(0);" onclick="signOut();">Sign out</a></div>'
            //var profileHTML = '<div class="profile"><div class="head">Welcome '+resp.name.givenName+'! <a href="javascript:void(0);" onclick="signOut();">Sign out</a></div>';
            //profileHTML += '<img src="'+resp.image.url+'"/><div class="proDetails"><p>'+resp.displayName+'</p><p>'+resp.emails[0].value+'</p><p>'+resp.gender+'</p><p>'+resp.id+'</p><p><a href="'+resp.url+'">View Google+ Profile</a></p></div></div>';
            $('#gplus').html(signOut);
            //$('#gSignIn').slideUp('slow');

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