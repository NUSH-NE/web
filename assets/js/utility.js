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
        window.history.replaceState({}, document.title, window.location.pathname +
            window.location.search.replace(/redirect=.*&/m, '')); // Remove all query strings
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

// Theme handlers
const getTheme = () => {
    // Returns: true if theme is dark, false otherwise
    return localStorage.pageTheme === 'dark';
}

const refreshTheme = () => {
    if (getTheme()) document.body.classList.remove('light');
    else document.body.classList.add('light');
}

// Params:
// newTheme - True: Dark theme, False: Light theme
const setTheme = (newTheme) => {
    localStorage.pageTheme = newTheme ? 'dark' : 'light';
    refreshTheme();
}

// Set current theme to stored theme
refreshTheme();

// Hmm what's this?
window.onload = () => {
    console.log('%c' + atob('CiBfICAgXyBfICAgXyBfX19fXyBfICAgXyAgIF8gICBfICBfX19fXyAKfCBcIHwgfCB8IHwgLyAgX19ffCB8IHwgfCB8IFwgfCB8fCAgX19ffAp8ICBcfCB8IHwgfCBcIGAtLS58IHxffCB8IHwgIFx8IHx8IHxfXyAgCnwgLiBgIHwgfCB8IHxgLS0uIFwgIF8gIHwgfCAuIGAgfHwgIF9ffCAKfCB8XCAgfCB8X3wgL1xfXy8gLyB8IHwgfCB8IHxcICB8fCB8X19fIApcX3wgXF8vXF9fXy9cX19fXy9cX3wgfF8vIFxffCBcXy9cX19fXy8g'),
        'color:#ff0000;font-family:Courier;font-weight:900;');
    console.log('%cProgrammed by Vincent Kwok and Wang Zerui (NUSH M21204)', 'color:#00a778;font-size:2em;font-family:"Trebuchet MS"');
    console.log('%c                           ',
        'height:320px;line-height:160px;' +
        'background:url("https://cdn.discordapp.com/attachments/822758666246815755/831543415500963911/sketch-1614682583636.png");' +
        'background-size:contain;background-position:center;');
    console.log('%cPasting anything here could lead to loss of private data and/or other serious issues. ' +
        'If you\'re unsure, close this window by clicking on the [x] button at the top right corner.',
        'color:#f44336;font-size: 1.5em');
};