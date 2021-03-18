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

        setTimeout(() => {
            this.intID = setInterval(() => {
                this.progress.progress = this.current / this.totalTime;
                if (this.current % 1000 === 0) this.cb(this.current / 1000); // Every 1 second call callback

                this.current -= 100;
                if (this.current < 0) {
                    clearInterval(this.intID);
                    this.intID = null;
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
        this.history = {
            stats: {
                quizStart: new Date(),
                quizEnd: null,
                quizTime: null,
                tPoints: 0
            }
        };
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
        this.history.stats.quizEnd = new Date();
        this.history.stats.quizTime = this.history.quizEnd - this.history.quizStart;
    }

    getHistory() {
        return this.history;
    }
}

(() => {
    const resDialog = $('result-dialog').MDCDialog;
    const endDialog = $('end-dialog').MDCDialog;
    const dialogMeter = $('dialog-pts-odometer');

    const init = () => {
        endDialog.scrimClickAction = '';
        endDialog.escapeKeyAction  = '';
    }

    const tm = new timer($('timer-progress'), (t) => {
        $('timer-number').textContent = t;
        if (t === 0) checkAns(10);
    });

    const qPt = new pointsCalc(10000);

    const qnsObj = [{
        qn: 'Funny',
        op1: 'Yes',
        op2: 'No',
        op3: 'Very',
        op4: 'Extremely',
        cOp: 4,
    }, {
        qn: 'Are you retarded',
        op1: 'Yes',
        op2: 'No',
        op3: 'Very',
        op4: 'Extremely',
        cOp: 4,
    }, {
        qn: 'You are a piece of funny stone',
        op1: 'Waaang',
        op2: 'Andre',
        op3: 'Rohaida',
        op4: 'Zerui',
        cOp: 1
    }];

    const qnSeq = [0, 2, 1];

    const endQuiz = () => {
        $('end-dialog-content').textContent = `You have reached the end of the quiz, and scored 10000 points! Congrats!`;
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
    }

    const refreshUI = () => {
        tm.initTimer(10000);
        tm.startTimer();
        qPt.start(qnSeq[0]);

        q('button.quiz-opt__1 > span.mdc-typography--body1').textContent = qnsObj[qnSeq[0]].op1;
        q('button.quiz-opt__2 > span.mdc-typography--body1').textContent = qnsObj[qnSeq[0]].op2;
        q('button.quiz-opt__3 > span.mdc-typography--body1').textContent = qnsObj[qnSeq[0]].op3;
        q('button.quiz-opt__4 > span.mdc-typography--body1').textContent = qnsObj[qnSeq[0]].op4;

        $('question-text').textContent = qnsObj[qnSeq[0]].qn;

        $('num-qns').textContent = qnSeq.length;
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

        showMsg(res === 2 ? 'Out of time' : !!res ? 'Correct' : 'Wrong');
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

    qPt.mainStart();
    refreshUI();
})(); // Wrap the whole logic into a self calling function
