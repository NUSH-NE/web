const spinner = $('editorLoading');
spinner.MDCCircularProgress.determinate = false;
const storageRef = firebase.storage().ref();
const fPickerElem = $('fileUpload');
const db = firebase.firestore();
let cUser = null;
const fUIAuthDiv = $('firebaseui-auth-container');
const loginSpinner = q('#loginDialog #loginLoader > div').MDCCircularProgress;
let fUI;
const loginDialog = $('loginDialog').MDCDialog;
fUI = new firebaseui.auth.AuthUI(firebase.auth());
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

function updateUsrInfo(usr) {
    q('#usrOps > h2').textContent = `Hello, ${usr.displayName}`;
    q('#usrOps > img.profile-img').src = usr.photoURL
    $('usrName').textContent = `Name: ${usr.displayName} `;
    $('usrEmail').textContent = `Email: ${usr.email} `;
    $('verEmailMsg').style.display = usr.emailVerified ? 'none' : 'block';
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        showMsg("sin in")
    } else {
        showMsg("STOPPP HACCERMAN STOPPPPP")

        if (loginDialog.isOpen) loginDialog.close();
        else {
            // Check if the user is already signed in
            if (!showHideUserArea()) initFUI();
            loginDialog.open();
        }
    }
});

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


// Onclick listeners
$('submitBtn').onclick = () => {

    // Get TinyMCE Content
    tinyMCE.activeEditor.getContent();
    const uploadTask = storageRef.child(fPickerElem.files[0].name).put(fPickerElem.files[0]);

    uploadTask.on('state_changed', (snap) => {
        $('file-upload-progress').MDCLinearProgress.progress = snap.bytesTransferred / snap.totalBytes;
    }, (e) => {
        console.error(e);
    },
    () => {
        showMsg('Upload completed');
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            console.log('File available at', downloadURL);

            let val = $("resourceLink").value

            db.collection('articles').add({
                content: tinyMCE.activeEditor.getContent(),
                link: downloadURL,
                resourceLink: val.split("\n").map(function(e){return e.trim();})
            }).then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
            }).catch((error) => {
                console.error("Error adding document: ", error);
            });
        });
    });
}
$('uploadBtn').onclick = () => {
    $('fileUpload').click();
}

fPickerElem.onchange = (e) => {
    const fr = new FileReader();
    fr.onload = (e) => {
        $('testimg').src = e.target.result;
    }
    fr.readAsDataURL($('fileUpload').files[0]);
    $('uploadFName').textContent = `Selected file(s): ${e.target.files[0].name}`;
}

tinymce.init({
    selector: 'textarea#contentEditor',
    height: 400,
    min_height: 110,
    max_height: 1000,
    menubar: false,
    plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table paste code help wordcount'
    ],
    toolbar: 'undo redo | formatselect | ' +
        'bold italic backcolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help',
    help_tabs:  ['shortcuts', 'keyboardnav'],
    skin: 'oxide-dark',
    content_style: 'body { font-family:Roboto,Helvetica,Arial,sans-serif; font-size:14px }',
    content_css: 'dark'
}).then(() => {
    console.log('Loaded');
    spinner.style.display = 'none';
    spinner.MDCCircularProgress.determinate = true;

    document.querySelectorAll('.tox .tox-tbtn').forEach((elem) => {
        elem.classList.add('mdc-ripple-surface');
        elem.setAttribute('data-mdc-auto-init', 'MDCRipple');
    });
    mdc.autoInit(); // Init additional ripples
});