firebase.auth().onAuthStateChanged((user) => {
    if (user) showHideScrim();
});

q('.loading-scrim > div.mdc-circular-progress').MDCCircularProgress.determinate = false;