const $ = (e) => { return document.getElementById(e); }
const q = (e) => { return document.querySelector(e); }

const showHideScrim = () => {
    const scrim = q('.loading-scrim');
    scrim.classList.toggle('hidden');
    q('.loading-scrim > div.mdc-circular-progress').MDCCircularProgress.determinate = scrim.classList.contains('hidden');
}

const showMsg = (msg) => {
    const sb = $('msgSnackbar').MDCSnackbar;
    sb.labelText = msg;
    sb.open();
}

document.body.addEventListener('mousedown', function() {
    document.body.classList.add('using-mouse');
});

// Re-enable focus styling when Tab is pressed
document.body.addEventListener('keydown', function(event) {
    if (event.keyCode === 9) {
        document.body.classList.remove('using-mouse');
    }
});

// Login state change listener
let cUser = null;
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        cUser = user;
        if (typeof isLoginPg !== 'undefined') {
            const prevURL = new URLSearchParams(window.location.search).get('redirect');
            if (prevURL) window.location = atob(prevURL);
            else window.location = 'index.html';
        }
        else showMsg(`Signed in as ${user.displayName}`);
        window.history.replaceState({}, document.title, window.location.pathname); // Remove all query strings
    } else {
        // No user is signed in.
        cUser = null;

        // If the page is not the login page, redirect to the login page
        if (typeof isLoginPg === 'undefined') {
            window.location = 'login.html?redirect=' + btoa(window.location.href);
            showMsg('You are signed out');
        }
        else {
            // Check if the login selector is pending
            /*if ((new URLSearchParams(window.location.search)).get('mode') === 'select') {
                loginDialog.open();
                initFUI();
            }*/
            initFUI()
        }
    }
});