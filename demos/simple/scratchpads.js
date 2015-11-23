var challengesDiv = document.getElementById('challenges');
var officialDiv = document.getElementById('official');
var tutorialsDiv = document.getElementById('tutorials');

var xhr = new XMLHttpRequest();
xhr.open("GET", "scratchpads.json", false);
xhr.send();

var scratchads = JSON.parse(xhr.responseText);
var urlBase = "index.html?scratchpad=";

scratchads.challenges.forEach(function(scratchpad) {
    if (scratchpad.type === "pjs") {
        var a = document.createElement('a');
        a.href = urlBase + scratchpad.id;
        a.innerText = scratchpad.title;
        challengesDiv.appendChild(a);
        challengesDiv.appendChild(document.createElement('br'));
    }
});

scratchads.official.forEach(function(scratchpad) {
    if (scratchpad.type === "pjs") {
        var a = document.createElement('a');
        a.href = urlBase + scratchpad.id;
        a.innerText = scratchpad.title;
        officialDiv.appendChild(a);
        officialDiv.appendChild(document.createElement('br'));
    }
});

scratchads.tutorials.forEach(function(scratchpad) {
    if (scratchpad.type === "pjs") {
        var a = document.createElement('a');
        a.href = urlBase + scratchpad.id;
        a.innerText = scratchpad.title;
        tutorialsDiv.appendChild(a);
        tutorialsDiv.appendChild(document.createElement('br'));
    }
});
