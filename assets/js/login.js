function initFUI() {
    const fUIAuthDiv = document.getElementById('firebaseui-auth-container');
    const fUI = new firebaseui.auth.AuthUI(firebase.auth());

    fUIAuthDiv.textContent = '';
    const uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                return false;
            },
            uiShown: function() {
                // The widget is rendered. (no)
                setTimeout(() => {
                    // Hide the loader.
                    document.getElementById('loginLoader').style.display = 'none';
                    document.querySelector('#loginLoader > div.mdc-circular-progress').MDCCircularProgress.determinate = true;
                    mdc.autoInit();
                }, 50);
                // FirebaseUI is dumb and calls this function b4 the UI has fully loaded
            }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        // signInSuccessUrl: 'index.html',
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '#',
        // Privacy policy url.
        privacyPolicyUrl: '#'
    };
    document.querySelector('#loginLoader > div.mdc-circular-progress').MDCCircularProgress.determinate = false;
    fUI.start(fUIAuthDiv, uiConfig);
}