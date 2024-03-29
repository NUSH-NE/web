// Written by Wang Zerui and Vincent Kwok

const spinner = $('editorLoading');
spinner.MDCCircularProgress.determinate = false;
const storageRef = firebase.storage().ref();
const fPickerElem = $('fileUpload');
const submitBtn = $('submitBtn');
const db = firebase.firestore();
const uploadProg = $('file-upload-progress').MDCLinearProgress;

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
submitBtn.onclick = () => {
    // Validation
    if (fPickerElem.files.length === 0) {
        showMsg('No images selected');
        return;
    }
    else if ($('article-title').MDCTextField.value.length === 0) {
        showMsg('No article title');
        return;
    }
    else if (tinyMCE.activeEditor.getContent().length === 0) {
        showMsg('No article content');
        return;
    }

    // Get TinyMCE Content
    tinyMCE.activeEditor.getContent();
    const uploadTask = storageRef.child(fPickerElem.files[0].name).put(fPickerElem.files[0]);

    // Disable button and start progress bar
    uploadProg.determinate = false;
    submitBtn.disabled = true;

    uploadTask.on('state_changed', (snap) => {
        uploadProg.determinate = true;
        uploadProg.progress = snap.bytesTransferred / snap.totalBytes;
    }, (e) => {
        console.error(e);
        submitBtn.disabled = false;
    },
    () => {
        showMsg('Upload completed');
        submitBtn.disabled = false;
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {

            db.collection('articles').add({
                content: tinyMCE.activeEditor.getContent(),
                link: downloadURL,
                resourceLink: $('resourceLink').value.split("\n").map(function(e){ return e.trim();}),
                title: $('article-title').MDCTextField.value
            }).then((docRef) => {
                showMsg('Added article with ID: ' + docRef.id);
                // Clear everything
                fPickerElem.value = '';
                $('article-title').MDCTextField.value = '';
                $('resourceLink').value = '';
                tinyMCE.activeEditor.setContent('');
            }).catch((error) => {
                showMsg('Error adding article: ' + error)
            });
        });
    });
}
$('uploadBtn').onclick = () => {
    $('fileUpload').click();
}

fPickerElem.onchange = (e) => {
    q('.imgPreviews').innerHTML = '';
    q('.imgPreviews').style.display = fPickerElem.files.length !== 0 ? 'grid' : 'none';

    const fileNames = [];

    for (let i = 0; i < fPickerElem.files.length; i++) {
        const fr = new FileReader();

        fr.onload = (ev) => {
            const prevImg = document.createElement('img');
            prevImg.classList.add('preview-img');
            prevImg.src = ev.target.result.toString();
            q('.imgPreviews').appendChild(prevImg);
        }

        fr.readAsDataURL(fPickerElem.files[i]);

        // Append filename to list of filenames
        fileNames.push(fPickerElem.files[i].name);
    }

    $('uploadFName').textContent = fileNames.length !== 0 ? `Selected file(s): ${fileNames.join(', ')}` : 'No file(s) selected';
}

tinymce.init({
    selector: 'textarea#contentEditor',
    height: 400,
    min_height: 110,
    max_height: 1000,
    menubar: false,
    browser_spellcheck: true,
    contextmenu: false,
    branding: false,
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