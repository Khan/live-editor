/* eslint-disable */

var runTestFiles = function(defaultFiles) {
    var isHeadless = /HeadlessChrome/.test(navigator.userAgent);

    mocha.setup({
        ui: 'bdd',
        reporter: isHeadless ? jsonReporter : 'html'
    });

    if (location.search.substring) {
        var params = {};
        location.search.substring(1).split("&")
            .forEach(function(param) {
                var parts = param.split("=");
                params[parts[0]] = parts[1];
            });

        var tests = defaultFiles;

        if (params.tests) {
            tests = params.tests.split(",");
        }

        var loadCount = 0;

        tests.forEach(function(test) {
            var script = document.createElement('script');
            script.onload = function() {
                loadCount++;
                if (loadCount === tests.length) {
                    mocha.run();
                }
            };
            script.src = test;
            document.body.appendChild(script);
        });
    }
};
