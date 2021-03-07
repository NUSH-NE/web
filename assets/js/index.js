// ====== Elements ====== //
const title = $('pgTitle');
const usrAcctBtn = $('usrBtn');
const loginDialog = $('loginDialog').MDCDialog;
const loginSpinner = q('#loginDialog #loginLoader > div').MDCCircularProgress;
const fUIAuthDiv = $('firebaseui-auth-container');

// ====== Helper Functions ====== //

let maxHeight = 250;

function reCalcTitleAnim() {
    const END_TOP_OFFSET = 8;
    const tBoundingBox = title.getBoundingClientRect();
    const animPercent = (tBoundingBox.top - END_TOP_OFFSET) / maxHeight;

    // Stick the header to the top of the screen when it reaches the top
    if (scrollY >= maxHeight - END_TOP_OFFSET) {
        title.style.position = 'fixed';
        title.style.left = '10px';
        title.style.top = '10px';
        title.style.right = '10px';
        title.style.zIndex = '6';
        title.style.backgroundColor = `rgba(0, 0, 0, 0.5)`;
        title.style.borderRadius = '7px';
        title.style.minWidth = 'unset';
        title.style.fontSize = '1.75rem';
        title.style.lineHeight = title.style.fontSize;
        return; // Don't change anything else
    }
    else title.style.position = 'inherit';

    // Animated properties
    title.style.minWidth = `calc(${100 * (1 - animPercent)}% - 20px)`;
    title.style.borderRadius = `${(20 * animPercent) + 7}px`;
    title.style.fontSize = `${Math.min(3.75 - 2 * (1 - animPercent), 3.80)}rem`;
    title.style.lineHeight = title.style.fontSize; // These two must be the same for correct height calculation
    title.style.backgroundColor = `rgba(0, 0, 0, ${0.5 * (1 - animPercent)})`;
}

function reCalcTotalHeight() {
    // Find the initial height from top of header to top of page
    maxHeight = title.getBoundingClientRect().top + scrollY + 15;
    reCalcTitleAnim()
}

function updateUsrInfo(usr) {
    q('#usrOps > h2').textContent = `Hello, ${usr.displayName}`;
    q('#usrOps > img.profile-img').src = usr.photoURL
    $('usrName').textContent = `Name: ${usr.displayName} `;
    $('usrEmail').textContent = `Email: ${usr.email} `;
    $('verEmailMsg').style.display = usr.emailVerified ? 'none' : 'block';
    console.log(usr);
}

function showHideUserArea() {
    const fUIContainer = $('firebaseui-auth-container');
    const usrAreaDiv = $('usrOps');
    if (cUser) {
        fUIContainer.style.display = 'none';
        usrAreaDiv.style.display = 'block';
        $('loginLoader').style.display = 'none';
        updateUsrInfo(cUser);
        return true;
    }
    else {
        fUIContainer.style.display = 'block';
        usrAreaDiv.style.display = 'none';
        $('loginLoader').style.display = 'block';
        loginSpinner.determinate = false;
        return false;
    }
}

function initFUI() {
    fUIAuthDiv.textContent = '';
    const uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                showHideUserArea();
                return false;
            },
            uiShown: function() {
                // The widget is rendered. (no)
                setTimeout(() => {
                    // Hide the loader.
                    document.getElementById('loginLoader').style.display = 'none';
                    loginSpinner.determinate = true;
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
    fUI.start(fUIAuthDiv, uiConfig);
}

let fUI;
let fAuth = firebase.auth();
let cUser = null;

// ============================= //
// ====== Event Listeners ====== //

document.addEventListener('scroll', reCalcTitleAnim, {passive: true}); // Passive scroll listener

window.onresize = reCalcTotalHeight;

// Hide FAB once bottom element is fully visible (reached bottom)
new IntersectionObserver(
    () => {
        usrAcctBtn.classList.toggle('hidden-fab')
    },
    {
        threshold: 0
    },
).observe($('b'));

usrAcctBtn.onclick = () => {
    if (loginDialog.isOpen) loginDialog.close();
    else {
        // Check if the user is already signed in
        if (!showHideUserArea()) initFUI();
        loginDialog.open();
    }
}

$('signOutBtn').onclick = () => {
    fAuth.signOut().then(() => {
        initFUI();
    }, (err) => {
        showMsg('Error signing out. Please try again later.');
        console.error(err);
    })
}


// Login state change listener
fAuth.onAuthStateChanged(function(user) {
    if (user) {
        cUser = user;
        showMsg(`Signed in as ${user.displayName}`);
        window.history.replaceState({}, document.title, window.location.pathname); // Remove all query strings
    } else {
        // No user is signed in.
        showMsg('You are signed out');
        // Check if the login selector is pending
        if((new URLSearchParams(window.location.search)).get('mode') === 'select') {
            loginDialog.open();
            initFUI();
        }
        cUser = null;

    }
    showHideUserArea();
});

// ============================ //
// ====== Initialisation ====== //

const elem = document.querySelector('.mason-cards');
new Masonry(elem, {
    // options
    itemSelector: '.mdc-card',
    fitWidth: true,
    gutter: 8
});

// Recalculate title position for the first time
reCalcTotalHeight();
reCalcTitleAnim();

// Init firebase Auth UI
fUI = new firebaseui.auth.AuthUI(firebase.auth());