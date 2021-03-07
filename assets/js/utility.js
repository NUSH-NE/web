const $ = (e) => { return document.getElementById(e); }
const q = (e) => { return document.querySelector(e); }

const showMsg = (msg) => {
    const sb = $('msgSnackbar').MDCSnackbar;
    sb.labelText = msg;
    sb.open();
}