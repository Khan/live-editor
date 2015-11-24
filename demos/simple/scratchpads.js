var challengesDiv = document.getElementById("challenges");
var officialDiv = document.getElementById("official");
var tutorialsDiv = document.getElementById("tutorials");

var xhr = new XMLHttpRequest();
xhr.open("GET", "scratchpads.json", false);
xhr.send();

var scratchads = JSON.parse(xhr.responseText);
var urlBase = "index.html?scratchpad=";

var createScratchpadLink = function(scratchpad, divElem) {
    if (scratchpad.type === "pjs") {
        var a = document.createElement("a");
        a.href = urlBase + scratchpad.id;
        a.innerText = scratchpad.title;
        divElem.appendChild(a);
        divElem.appendChild(document.createElement("br"));
    }
};

scratchads.challenges.forEach(function(scratchpad) {
    createScratchpadLink(scratchpad, challengesDiv);
});

scratchads.official.forEach(function(scratchpad) {
    createScratchpadLink(scratchpad, officialDiv);
});

scratchads.tutorials.forEach(function(scratchpad) {
    createScratchpadLink(scratchpad, tutorialsDiv);
});
