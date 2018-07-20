const ScratchpadConfig = require("./config.js");

describe("ScratchpadConfig", function() {
    it("should use version 4 or greater", function() {
        const config = new ScratchpadConfig({});
        expect(config.latestVersion()).to.be.equal(4);
    });
});
