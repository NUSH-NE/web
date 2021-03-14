const $ = (e) => { return document.getElementById(e); }
const q = (e) => { return document.querySelector(e); }

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