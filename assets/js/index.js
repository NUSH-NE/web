// ====== Elements ====== //
const title = $('pgTitle');
const usrAcctBtn = $('usrBtn');
const loginDialog = $('loginDialog').MDCDialog;

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
}

let fUI;

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
        const uiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                    // User successfully signed in.
                    // Return type determines whether we continue the redirect automatically
                    // or whether we leave that to developer to handle.
                    return true;
                },
                uiShown: function() {
                    // The widget is rendered.
                    // Hide the loader.
                    document.getElementById('loader').style.display = 'none';
                }
            },
            // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
            signInFlow: 'popup',
            signInSuccessUrl: '<url-to-redirect-to-on-success>',
            signInOptions: [
                // Leave the lines as is for the providers you want to offer your users.
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
            ],
            // Terms of service url.
            tosUrl: '<your-tos-url>',
            // Privacy policy url.
            privacyPolicyUrl: '<your-privacy-policy-url>'
        };
        fUI.start('#firebaseui-auth-container', uiConfig);
        loginDialog.open();
    }
}


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