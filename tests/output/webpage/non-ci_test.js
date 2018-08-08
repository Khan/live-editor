describe("non-ci webpage tests", function() {
    warningTest("non-html root element", '<!DOCTYPE html><a href="#foobar"></a>',
        ["The root element on the page should be an <html> element."]
    );
});
