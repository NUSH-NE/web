/*
Written by Vincent Kwok (M21204)
This code is very messy - I'll refactor it when I have the time
 */

// ====== Elements ====== //
const title = $('pgTitle');
const usrAcctBtn = $('usrBtn');
const loginDialog = $('loginDialog').MDCDialog;
const verifyEmailBtn = q('#verEmailMsg button');
const readCardsHolder = $('read-cards');
const elem = document.querySelector('.mason-cards');
const readerDialog = $('readerDialog').MDCDialog;
const readFixToggle = $('read-sidebar-fixed').MDCIconButtonToggle;
const readSidebar = q('div.reader-dialog aside.readerAside');
const addPostBtn = $('addPostBtn');
const fileUploadElem = $('fileUpload');
const storageRef = firebase.storage().ref();
const fProgressBar = $('file-upload-progress').MDCLinearProgress;
const postDialog = $('postImgDialog').MDCDialog;

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
        title.style.backgroundColor = `rgba(0, 0, 0, .7)`;
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
    if (cUser) {
        $('usrOps').style.display = 'block';
        updateUsrInfo(cUser);
        return true;
    }
}

function getArticleCard(data, img, btnListener) {
    const containerDiv = document.createElement('div');

    // Set classes
    containerDiv.classList.add('mdc-card');

    // Fill innerHTML
    containerDiv.innerHTML = `
<div class="mdc-card__media mdc-card__media--16-9" style="background-image:url('${img}')">
</div>
<div class="mdc-card-wrapper__text-section">
    <div class="mdc-card__text-section-header">${data.title}</div>
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

    const btn = containerDiv.querySelector('.mdc-button.mdc-card__action.mdc-card__action--button');
    btn.onclick = () => {
        btnListener(data, img);
    }

    return containerDiv;
}

function showAuthMsg(msg) {
    const holder = $('authMsg');
    const text = q('#authMsg > div.mdc-card-wrapper__text-section');
    const dButton = q('#authMsg button')
    dButton.onclick = () => holder.classList.add('hidden');
    text.textContent = msg;
    holder.classList.remove('hidden');
}

function showReaderDialog(data, img) {
    const contentHolder = $('reader-content-holder');
    const resLinkHolder = $('readerResLinks');
    contentHolder.textContent = ''; // Clear content
    resLinkHolder.textContent = '';

    const imgE = document.createElement('img');
    imgE.src = img;
    imgE.classList.add('readerHeadImg');
    contentHolder.appendChild(imgE);

    const content = document.createElement('div');
    contentHolder.appendChild(content);

    // Append article to container
    content.innerHTML = data.articleContent;

    // Change title
    $('reader-title-elem').textContent = data.title;

    // Add resource links
    !data.resLinks ? resLinkHolder.innerHTML += '<p>No resource links</p>' :
    data.resLinks.forEach((link) => {
        const listHolder = document.createElement('li');
        const liElem = document.createElement('a');
        liElem.textContent = link.length <= 50 ? link : link.slice(50) + '...';
        liElem.href = link;
        listHolder.appendChild(liElem);
        resLinkHolder.appendChild(listHolder);
    });
    readerDialog.open();
}

function debounceResize(func){
    let timer;
    return function(event){
        if (timer) clearTimeout(timer);
        timer = setTimeout(func, 100, event);
    };
}

let fUI;
let fAuth = firebase.auth();

// ============================= //
// ====== Event Listeners ====== //

let throttleScroll = false;
document.addEventListener('scroll', () => {
    if (!throttleScroll) {
        reCalcTitleAnim();
        throttleScroll = true;
        setTimeout(() => throttleScroll = false, 30);
    }
}, { passive: true }); // Passive scroll listener

window.addEventListener('resize', debounceResize(() => {
    reCalcTotalHeight(); // Ayo
    reCalcTotalHeight();
}));

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

verifyEmailBtn.onclick = () => {
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

const db = firebase.firestore();



db.collection("articles")
    .onSnapshot((snapshot) => {
        // Clear holder div
        readCardsHolder.textContent = '';
        if (snapshot.docs.length === 0) {
            readCardsHolder.innerHTML = '<p>No articles</p>'
        }
        snapshot.docs.forEach((doc) => {
            readCardsHolder.appendChild(getArticleCard({
                articleContent: doc.data().content,
                title: doc.data().title,
                resLinks: doc.data().resourceLink
            }, doc.data().link, showReaderDialog));
        });

        // Re-inint masonry
        new Masonry(elem, {
            // options
            itemSelector: '.mdc-card',
            fitWidth: true,
            gutter: 8
        });
        // Re-init MDC
        mdc.autoInit();
    });

// Toggle listener
readFixToggle.listen('MDCIconButtonToggle:change', (e) => {
    e.detail.isOn ? readSidebar.classList.add('fixed') : readSidebar.classList.remove('fixed');
});

// Add post button click listener
addPostBtn.onclick = () => {
    fileUploadElem.click();
}

fileUploadElem.onchange = () => {
    // Validation
    console.log(fileUploadElem.files[0])
    if (fileUploadElem.files.length === 0) {
        showMsg('No file selected');
        return;
    }
    else if (!fileUploadElem.files[0].type.match(/^image\/.*/)) {
        showMsg('Selected file is not an image');
        return;
    }
    else if (fileUploadElem.files[0].size > 2000000) {
        showMsg('Image size too big (max 2MB)');
        return;
    }

    const fr = new FileReader();

    fr.onload = (ev) => {
        q('.post-dialog img.img-preview').src = ev.target.result.toString();
    }

    fr.readAsDataURL(fileUploadElem.files[0]);

    postDialog.open();
}

// Listen for closing of dialog
postDialog.listen('MDCDialog:closed', (e) => {
    if (e.detail.action === 'upload') {
        // Upload file
        const uploadTask = storageRef.child('usrImgPosts').child(uuidv4()).put(fileUploadElem.files[0]);

        addPostBtn.disabled = true

        uploadTask.on('state_changed', (snap) => {
                fProgressBar.determinate = true;
                fProgressBar.progress = snap.bytesTransferred / snap.totalBytes;
            }, (e) => {
                console.error(e);
                addPostBtn.disabled = false;
            },
            () => {
                showMsg('Upload completed');
                fileUploadElem.value = ''; // Clear file picker
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    console.log({downloadURL});
                    // Add to Firestore
                    db.collection('usrImgPosts').add({
                        uid: cUser.uid,
                        imgURL: downloadURL,
                        caption: $('post-caption').MDCTextField.value
                    })
                        .then(() => {
                            showMsg('Added post');
                            addPostBtn.disabled = false;
                            $('post-caption').MDCTextField.value = '';
                        })
                        .catch((error) => {
                            showMsg('Aw, Snap! Error adding post!' + error);
                            addPostBtn.disabled = false;
                        });
                });
            });
    }
});

// ============================ //
// ====== Initialisation ====== //

// Init Flickity
const flkty = new Flickity('#postCarousel', {
    // options
    wrapAround: true,
    lazyLoad: 4,
    pageDots: false,
    friction: 0.5,
    selectedAttraction: 0.1,
    arrowShape: 'M 69.25 12.457031 C 67.207031 10.417969 63.917969 10.417969 61.875 12.457031 L 27.25 47.082031 C 25.625 48.707031 25.625 51.332031 27.25 52.957031 L 61.875 87.582031 C 63.917969 89.625 67.207031 89.625 69.25 87.582031 C 71.292969 85.542969 71.292969 82.25 69.25 80.207031 L 39.082031 50 L 69.292969 19.792969 C 71.292969 17.792969 71.292969 14.457031 69.25 12.457031 Z M 69.25 12.457031'
});

// Moving next and back somehow fixes the issue of requiring a resize before images load
flkty.next(); 
flkty.previous();
// Add ripple effect to next and prev buttons
flkty.nextButton.element.classList.add('mdc-ripple-surface', 'mdc-elevation--z20');
flkty.nextButton.element.setAttribute('data-mdc-auto-init', 'MDCRipple');
flkty.prevButton.element.classList.add('mdc-ripple-surface', 'mdc-elevation--z20');
flkty.prevButton.element.setAttribute('data-mdc-auto-init', 'MDCRipple');

// Start indeterminable article loading progress bar
$('load-articles').MDCLinearProgress.determinate = false;

// Recalculate title position for the first time
reCalcTotalHeight();
reCalcTitleAnim();

// ======================================================= //
// ====== Event Listeners (that must go after init) ====== //
// ======================================================= //

// Listen for changes in user posts
db.collection('usrImgPosts')
    .onSnapshot((snap) => {
        snap.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const cell = document.createElement('div');

                cell.setAttribute('data-article-id', change.doc.id);
                cell.innerHTML = `<img data-flickity-lazyload="${change.doc.data().imgURL}" class="mdc-elevation--z16" 
                onerror="this.src='assets/img/broken_image-dark.svg'" draggable="false"/>`;
                cell.classList.add('carousel-cell');

                const contentHolder = document.createElement('div');
                contentHolder.classList.add('content-cover');
                contentHolder.innerHTML = '<h3>Image Caption</h3>';

                const content = document.createElement('p');
                content.textContent = change.doc.data().caption;
                content.classList.add('mdc-typography--body1');

                contentHolder.appendChild(content);
                cell.appendChild(contentHolder);

                flkty.append(cell);
            }
            if (change.type === 'modified') {
                console.log('Modified: ', change.doc.data());
            }
            if (change.type === 'removed') {
                flkty.remove(q(`[data-article-id="${change.doc.id}"]`));
            }
        })
    });