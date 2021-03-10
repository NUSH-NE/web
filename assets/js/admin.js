const spinner = $('editorLoading');
spinner.MDCCircularProgress.determinate = false;
const storageRef = firebase.storage().ref();

// Onclick listeners
$('submitBtn').onclick = () => {
    const uploadTask = storageRef.child('test.png').put($('fileUpload').files[0]);

    uploadTask.on('state_changed', (snap) => {
        $('file-upload-progress').MDCLinearProgress.progress = snap.bytesTransferred / snap.totalBytes;
    });
}

$('uploadBtn').onclick = () => {
    $('fileUpload').click();
}

$('fileUpload').onchange = () => {
    const fr = new FileReader();
    fr.onload = (e) => {
        $('testimg').src = e.target.result;
        console.log(e.target.result)
    }
    fr.readAsDataURL($('fileUpload').files[0])
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