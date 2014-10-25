function waitForTidy(test, done) {
    function wait() {
        if ($(".disable-overlay").css("display") !== "none") {
            setTimeout(wait, 100);
        } else {
            test();
            done();
        }
    }
   
    wait();
}
