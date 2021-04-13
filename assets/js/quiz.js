class timer {
    constructor(bar, tickCb) {
        this.intID = null;

        this.cb = tickCb;
        this.progress = bar.MDCLinearProgress;
    }

    initTimer(time) { // Total time in ms
        this.totalTime = time;
        this.current = time;
        if (this.intID !== null) {
            clearInterval(this.intID);
            this.intID = null
        }
    }

    startTimer() {
        if (this.current < 0) return false;

        this.progress.progress = 1; // Move progress bar to full position
        this.cb((this.totalTime / 1000).toFixed(0)); // Call callback for the first time

        this.st = new Date();

        setTimeout(() => {
            this.intID = setInterval(() => {
                this.progress.progress = this.current / this.totalTime;
                this.cb((this.current / 1000).toFixed(0)); // Call callback to update various UI elems

                this.current = this.totalTime - (new Date() - this.st);
                if (this.current < 0) {
                    clearInterval(this.intID);
                    this.intID = null;
                    // Set all progresses to 0
                    this.progress.progress = 0;
                    this.cb(0);
                }
            }, 100);
        }, 250); // Wait 250ms for animation to complete

        return true
    }

    pauseTimer() {
        clearInterval(this.intID);
        this.intID = null;
    }
}

class pointsCalc {
    constructor(qnTime) {
        this.maxTime = qnTime;
    }

    mainStart() {
        this.stats = {
            quizStart: new Date(),
            quizEnd: null,
            quizTime: null,
        }
        this.history = {};
    }

    start(id) {
        this.history[id] = {
            startTime: new Date(),
            endTime: null,
            tTime: null,
            res: 0,
            pts: 0
        }
    }

    end(id, res) {
        this.history[id].endTime = new Date()
        this.history[id].tTime = this.history[id].endTime - this.history[id].startTime;
        this.history[id].res = res;
        // Now do some math
        this.history[id].pts = res === 2 ? 0 : !!res ?
            ((0.5 * Math.pow(10 - (this.history[id].tTime * (10000 / this.maxTime) / 1000), 2)) + 2) * 10 : 20;
    }

    mainEnd() {
        this.stats.quizEnd = new Date();
        this.stats.quizTime = this.stats.quizEnd - this.stats.quizStart;
    }

    getHistory() {
        return this.history;
    }

    getTotPts() {
        console.log(this.history);
        let s = 0;
        for (const k in this.history) if (this.history.hasOwnProperty(k)) s += Math.round(this.history[k].pts);
        return s;
    }
}

(() => {
    const db = firebase.firestore(); // Init Firestore

    // Hmm what's this?
    const i = () => {

    }

    // Elements
    const resDialog = $('result-dialog').MDCDialog;
    const endDialog = $('end-dialog').MDCDialog;
    const dialogMeter = $('dialog-pts-odometer');
    // Scrim and contained elements
    const scrim = $('scrim');
    const sTimer = q('#scrimTimer > span');
    const sTimerHolder = $('scrimTimer');

    const random = (max) => Math.floor(Math.random() * max);

    const tm = new timer($('timer-progress'), (t) => {
        $('timer-number').textContent = t;
        if (t === 0) checkAns(10);
    });

    const qPt = new pointsCalc(10000);

    let qnsObj = [];
    /* {
        qn: 'This is a test question',
        op1: 'First option',
        op2: 'This is definitely the correct option',
        op3: 'You can add your own question text',
        op4: 'Like this',
        cOp: 2,
    }, {
        qn: 'Hello There!',
        op1: 'Goodbye!',
        op2: 'Hey',
        op3: 'Hello!',
        op4: 'Happy',
        cOp: 3,
    }, {
        qn: 'This is another funny question',
        op1: 'Click me!',
        op2: 'More options',
        op3: 'Even more options',
        op4: 'You can include as many questions as you want',
        cOp: 1
    }
     */

    const qnSeq = [];

    // Bootstraps the UI
    const init = () => {
        endDialog.scrimClickAction = '';
        endDialog.escapeKeyAction  = '';
    }

    const endQuiz = () => {
        $('end-dialog-content').textContent = `You have reached the end of the quiz, and scored ${qPt.getTotPts()} points! Congrats!`;
        $('endAnim').play();
        endDialog.open();
    }

    const showRes = (res, oot = false) => {
        $('resultAnim').load(res ? 'assets/raw/check.json' : 'assets/raw/cross.json');
        q('#res-dialog-title > h2').textContent = oot ? 'You ran out of time!' : (res ? 'Correct!' : 'Wrong!');
        $('res-dialog-content').textContent = oot ? 'Try to be faster next time! You can do it!' :
            (res ? 'Congratulations! Keep up the good work!' : 'Whoops! Try harder next time. You can do it!');

        // Get calculated points
        dialogMeter.textContent = '0'; // Clear to 0 to allow reanimation
        dialogMeter.textContent = qPt.getHistory()[qnSeq[0]].pts.toFixed(0);

        resDialog.open();

        $('totPts').textContent = qPt.getTotPts();
    }

    const refreshUI = () => {
        // Timer to show question for 5 seconds first
        let t = 5000;
        let rState = 0;

        // Init some stuff before showing scrim
        sTimer.textContent = (t / 1000).toFixed(0);
        sTimerHolder.style.setProperty('--shape-rotation', `${rState * 45}deg`);
        scrim.classList.remove('hidden');

        // Put question on scrim
        $('scrimQn').textContent = qnsObj[qnSeq[0]].qn;

        const intID = setInterval(() => {
            sTimer.textContent = (t / 1000).toFixed(0);
            t -= 100;

            // Rotate block while keeping text straight
            sTimerHolder.style.setProperty('--shape-rotation', `${rState * 45}deg`);
            if (t % 500 === 0) rState++;

            if (t < 0) {
                scrim.classList.add('hidden');
                clearInterval(intID);

                // Init helper objects
                tm.initTimer(10000);
                tm.startTimer();
                qPt.start(qnSeq[0]);

                // Init all elements
                q('button.quiz-opt__1 > span.mdc-typography--body1').textContent = qnsObj[qnSeq[0]].op1;
                q('button.quiz-opt__2 > span.mdc-typography--body1').textContent = qnsObj[qnSeq[0]].op2;
                q('button.quiz-opt__3 > span.mdc-typography--body1').textContent = qnsObj[qnSeq[0]].op3;
                q('button.quiz-opt__4 > span.mdc-typography--body1').textContent = qnsObj[qnSeq[0]].op4;

                $('question-text').textContent = qnsObj[qnSeq[0]].qn;

                $('num-qns').textContent = qnSeq.length;
            }
        }, 100);
    }

    const nextQn = () => {
        qnSeq.splice(0, 1);
        if (qnSeq.length <= 0) {
            endQuiz();
            return;
        }
        refreshUI();
    }

    const skipQn = () => {

    }

    const checkAns = (op) => {
        tm.pauseTimer();
        if (qnSeq.length === 0) return;
        const res = op > 4 ? 2 : (op === qnsObj[qnSeq[0]].cOp ? 1 : 0);

        qPt.end(qnSeq[0], res); // Call points tally counter

        showMsg(res === 2 ? 'Out of time!' : !!res ? 'Correct!' : 'Wrong!');
        showRes(res === 1, res === 2);

        $('main-anim').pause();
    }

    resDialog.listen('MDCDialog:closed', () => {
        nextQn();
        qnSeq.length > 0 ? $('main-anim').play() : 0;
    });

    // Onclick listeners
    q('button.quiz-opt__1').onclick = () => checkAns(1);
    q('button.quiz-opt__2').onclick = () => checkAns(2);
    q('button.quiz-opt__3').onclick = () => checkAns(3);
    q('button.quiz-opt__4').onclick = () => checkAns(4);

    init();

    // Starts the quiz (call when questions array is ready)
    const startQuiz = () => {
        // Generate random question sequence
        for (let i = 0; i < qnsObj.length; i++) {
            let qn = random(qnsObj.length);
            // Generate a random number that is not already in the question sequence
            do qn = random(qnsObj.length)
            while (qnSeq.includes(qn));

            qnSeq.push(qn);
        }

        qPt.mainStart();
        refreshUI();
    }

    // Download questions
    db.collection("quiz").doc(new URLSearchParams(window.location.search).get('id')).get().then((doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            // Populate array
            qnsObj = doc.data().qns;

            // Delete loading portion of scrim (and animate it)
            const sl = $('scrimLoader');
            const sc = $('scrimContent');
            const ANIM_DURATION = 400;

            // First fade out the loader
            sl.classList.add('fader', 'faded');
            sc.classList.add('fader', 'faded');
            setTimeout(() => {
                sl.remove(); // Remove the loader after it has faded
                sc.classList.remove('display-none');
                setTimeout(() => sc.classList.remove('faded'), 10); // Then fade in the content
                setTimeout(() => startQuiz(), ANIM_DURATION / 5); // Start the quiz when the element reaches ~20% opacity
            }, ANIM_DURATION);
        } else {
            // Show errors
            const a = $('dQuizAnim');
            a.load('assets/raw/error.json');
            a.loop = false;

            $('dQuizHeader').textContent = 'The quiz with the specified ID could not be downloaded';
            $('dQuizOverline').textContent = 'Go to the quiz page and click on the link that led you here again';
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
    //startQuiz();
})(); // Wrap the whole logic into a self calling function
