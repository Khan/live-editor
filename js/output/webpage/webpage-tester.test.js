import WebpageTester from "./webpage-tester.js";

describe("CSS selector matching with wildcards", function() {
    let tester;

    before(function() {
        tester = new WebpageTester({onPhoneHomeRequest: () => {}});
    });

    const selectorTests = [
        [true, "div", "div"],
        [false, "div", "li"],
        [true, "_", "div"],
        [false, "_", "a a"],
        [true, "_ _", "a b"],
        [true, "$1 div, $1 li", ".home div, .home li"],
        [true, "$1 div, $1 li, _ div", ".home div, #foo li, #foo div"],
        [false, "_", "table, li"],
    ];
    selectorTests.forEach(function(test) {
        const goal = test[0];
        const pattern = test[1];
        const selector = test[2];
        const title =
            '"' +
            pattern.substring(0, 50) +
            '" ' +
            (goal ? "=" : "!") +
            '= "' +
            selector.substring(0, 50) +
            '"';
        it(title, function() {
            const P = tester.testContext.normalizeSelector(pattern);
            const S = tester.testContext.normalizeSelector(selector);
            const result = tester.testContext.selectorMatch(P, S);
            expect(result === goal).to.be.ok();
        });
    });
});
