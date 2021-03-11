/*
Written by Vincent Kwok (M21204)
This code is very messy - I'll refactor it when I have the time
 */

// ====== Elements ====== //
const title = $('pgTitle');
const usrAcctBtn = $('usrBtn');
const loginDialog = $('loginDialog').MDCDialog;
const loginSpinner = q('#loginDialog #loginLoader > div').MDCCircularProgress;
const fUIAuthDiv = $('firebaseui-auth-container');
const verifyEmailBtn = q('#verEmailMsg button');
const readCardsHolder = $('read-cards');

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
}

function showHideUserArea() {
    const usrAreaDiv = $('usrOps');
    if (cUser) {
        fUIAuthDiv.style.display = 'none';
        usrAreaDiv.style.display = 'block';
        $('loginLoader').style.display = 'none';
        updateUsrInfo(cUser);
        return true;
    }
    else {
        fUIAuthDiv.style.display = 'block';
        usrAreaDiv.style.display = 'none';
        $('loginLoader').style.display = 'block';
        loginSpinner.determinate = false;
        return false;
    }
}

function getArticleCard(data, img) {
    const containerDiv = document.createElement('div');

    // Set classes
    containerDiv.classList.add('mdc-card');

    // Fill innerHTML
    containerDiv.innerHTML = `
<div class="mdc-card__media mdc-card__media--16-9" style="background-image:url('${img}')">
</div>
<div class="mdc-card-wrapper__text-section">
    <div class="mdc-card__text-section-header">Test Title</div>
    <div class="mdc-card__text-section-subhead">${data.articleContent}</div>
</div>
<div class="mdc-card__actions">
    <div class="mdc-card__action-buttons">
        <button class="mdc-button mdc-card__action mdc-card__action--button" data-mdc-auto-init="MDCRipple">
            <div class="mdc-button__ripple"></div>
            <span class="mdc-button__label">Read</span>
        </button>
    </div>
    <div class="mdc-card__action-icons">
        <button class="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon mdc-ripple-surface" data-mdc-ripple-is-unbounded
                title="Share" data-mdc-auto-init="MDCRipple">
            share
        </button>
        <button class="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon mdc-ripple-surface" data-mdc-ripple-is-unbounded
                title="More options" data-mdc-auto-init="MDCRipple">
            more_vert
        </button>
    </div>
</div>
    `;

    return containerDiv;
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

function showAuthMsg(msg) {
    const holder = $('authMsg');
    const text = q('#authMsg > div.mdc-card-wrapper__text-section');
    const dButton = q('#authMsg button')
    dButton.onclick = () => holder.classList.add('hidden');
    text.textContent = msg;
    holder.classList.remove('hidden');
}

let fUI;
let fAuth = firebase.auth();
let cUser = null;

// ============================= //
// ====== Event Listeners ====== //

document.addEventListener('scroll', () => {
    setTimeout(() => { reCalcTitleAnim() }, 30);
}, {passive: true}); // Passive scroll listener

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

verifyEmailBtn.onclick = (event) => {
    verifyEmailBtn.disabled = true;
    cUser.sendEmailVerification().then(function() {
        // Email sent.
        showMsg(`Sent a verification email to ${cUser.email}`);
        showAuthMsg('Reopen this dialog after clicking on the verification link to check your email verification status');
    }).catch(function(error) {
        // An error happened.
        showMsg(`Failed to send the verification email. Error: ${error.message}`);
    });
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

const db = firebase.firestore();

db.collection("articles")
    .onSnapshot((snapshot) => {
        // Clear holder div
        readCardsHolder.textContent = '';
        snapshot.docs.forEach((doc) => {
            readCardsHolder.appendChild(getArticleCard({ articleContent: doc.data().content }, doc.data().link));
        });
        // Reinint masonry
        new Masonry(elem, {
            // options
            itemSelector: '.mdc-card',
            fitWidth: true,
            gutter: 8
        });
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