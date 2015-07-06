/* jshint unused:false */
/**
 * Report test results to the console in JSON encoded strings.
 * This is a modified version of mocha's provided json stream reporter.
 */
    
var Base = Mocha.reporters.Base;

function clean(test) {
    return {
        title: test.title,
        fullTitle: test.fullTitle(),
        duration: test.duration,
        error: test.err
    };
}

var jsonReporter = function(runner) {
    Base.call(this, runner);

    var self = this;
    var total = runner.total;

    runner.on('start', function() {
        console.log(JSON.stringify(['start', { total: total }]));
    });

    runner.on('pass', function(test) {
        console.log(JSON.stringify(['pass', clean(test)]));
    });

    runner.on('fail', function(test, err) {
        console.log(JSON.stringify(['fail', clean(test)]));
    });

    runner.on('end', function() {
        console.log(JSON.stringify(['end', self.stats]));
    });
};
