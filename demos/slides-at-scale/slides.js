/*
  "Sync audio to code",
  "Assess user code",
  "Secure user code"
*/
var slides = [
    function () {
colorMode(RGB);
background(255, 255, 255);

textSize(32);
textFont(createFont("monospace"));
fill(0, 0, 0);
text("Instant JavaScript!", 11, 55);

var doge = ["wow", "much instant", "so javascript", "very js", "much impress"];

for (var i = 0; i < doge.length; i++) {
    fill(random(255), random(255), random(255));
    text(doge[i], random(5, width-textWidth(doge[i])), i*70+100);
    
}

    },
    function() {
colorMode(RGB);
background(255, 255, 255);

textSize(32);
textFont(createFont("monospace"));
fill(0, 0, 0);
text("The basic setup", 62, 27);


text("ACE editor", 11, 85);
text("<----", 11, 118);

text("+ ProcessingJS", 11, 188);
text("----->", 11, 228);


draw = function() {
    if (mouseY > 300) {
        colorMode(HSB);
        fill(mouseX%255, 236, 218);
        noStroke();
        ellipse(mouseX, mouseY, 100, 100);
        fill(0, 0, 0);
        ellipse(mouseX-15, mouseY-20, 10, 10);
        ellipse(mouseX+15, mouseY-20, 10, 10);
        arc(mouseX, mouseY, 40, 40, 0, 180);
    }
};

Program.restart();
    },
/* But you can do step 1 in a few hours
And in fact, we have people do that as just a part of our technical project interview.*/
    function() {
colorMode(RGB);
background(255, 255, 255);
noStroke();

var baseh = 0;
var speed = 5;
var incr = 15;

draw = function() {
    baseh += speed;
    background(0, 0, 0);
    
    for (var i = 0; i < 360; i+= incr) {
        pushMatrix();
        translate(width/2, height/2);
        rotate(i);
        colorMode(HSB, 360);
        fill((baseh + i) % 360, 360, 250);
        triangle(0, 0, 150-i*5, -15, 150, 15);
        popMatrix();
    }
    
    textSize(40);
    colorMode(RGB, 255);
    fill(255, 255, 255, 255);
    text("...but that's easy™", 23, 44);
    text("Let's talk about where things get CRAZY!", 11, 188, width, 200);
    
};
    },
    function() {
var drawLetter = function(letter, x, y) {
  fill(random(255), random(255), random(255));
  textFont(createFont("monospace"));
  text(letter, x, y);
};

var drawPhrase = function(phrase, y) {
    fill(113, 0, 135);
    textSize(55);
    textFont(createFont("monospace"));
    var charWidth = textWidth('a');
    for (var i = 0; i < phrase.length; i++) {
        drawLetter(phrase.charAt(i), i*charWidth+20, y);
    }
};

var started = 0;
draw = function() {
    if (started < 5) {
        colorMode(RGB);
        background(255, 255, 255);
        textFont(createFont("monospace"));
        drawPhrase("Goal #1", 80);
        drawPhrase("Don't CRASH", 200);
        drawPhrase("the browser", 250);
        started++;
    }
};
    }, function() {
var drawMadMoney = function() {
    var coinX = 10;
    var coinY = 100;
    var coinWidth = 30;
    
    var i = 0;
    while (i < width/coinWidth) {
        coinX = i*coinWidth;
        var j = 0;
        while (j < height/coinWidth) {
            coinY = j*coinWidth;
            fill(255, 213, 0);
            stroke(181, 157, 90);
            ellipse(coinX, coinY, coinWidth, coinWidth);
            ellipse(coinX, coinY, coinWidth-8, coinWidth-8);
            fill(163, 139, 20);
            text("$", coinX-3, coinY+4);
        }
    }
    
};

colorMode(RGB);
background(255, 255, 255);

    }, function() {
var drawBox = function(label, x, y, height) {
    rectMode(CORNER);
    textAlign(LEFT, TOP);
    textSize(20);
    stroke(179, 0, 255);
    fill(250, 239, 252);
    rect(x, y, textWidth(label)+35, height || 50);
    fill(131, 0, 212);
    textFont(createFont("monospace"));
    text(label, x+10, y+15);
};

var drawBrowser = function(x, y, width, height, url) {
    fill(214, 214, 214);
    stroke(87, 87, 87);
    rect(x, y, width, height, 5);
    // address bar
    fill(255, 255, 255);
    rect(x+5, y+10, width-10, height/15);
    // url in address bar
    if (url) {
        fill(59, 59, 59);
        textFont(createFont("monospace"));
        textSize(height/20);
        text(url, x+10, y+height/15*1.7);
    }
    // window
    fill(255, 255, 255);
    rect(x+5, y+height/15*3, width-10, height*0.75);
};

var drawArrow = function(startX, startY, endX, endY) {
    line(startX, startY, endX, endY);
    if (startY === endY) {
        fill(140, 0, 140);
        text("▶", endX-15, endY-8);
    }
};

colorMode(RGB);
background(255, 255, 255);
fill(0, 0, 0);
textSize(20);
text("Sending user code through workers", 45, 40);
drawBrowser(13, 113, 164, 165, "khanacademy.org");
drawBox("User code", 24, 177);
drawArrow(167, 205, 209, 205);
drawBox("worker.js", 209, 176, 100);
textSize(12);
text("processing-stubs.js", 215, 215);
    }, function() {

var drawBox = function(label, x, y, height) {
    rectMode(CORNER);
    textAlign(LEFT, TOP);
    textSize(20);
    stroke(179, 0, 255);
    fill(250, 239, 252);
    rect(x, y, textWidth(label)+35, height || 50);
    fill(131, 0, 212);
    textFont(createFont("monospace"));
    text(label, x+10, y+15);
};

var drawBrowser = function(x, y, width, height, url) {
    fill(214, 214, 214);
    stroke(87, 87, 87);
    rect(x, y, width, height, 5);
    // address bar
    fill(255, 255, 255);
    rect(x+5, y+10, width-10, height/15);
    // url in address bar
    if (url) {
        fill(59, 59, 59);
        textFont(createFont("monospace"));
        textSize(height/20);
        text(url, x+10, y+height/15*1.7);
    }
    // window
    fill(255, 255, 255);
    rect(x+5, y+height/15*3, width-10, height*0.75);
};

var drawArrow = function(startX, startY, endX, endY) {
    line(startX, startY, endX, endY);
    if (startY === endY) {
        fill(140, 0, 140);
        text("▶", endX-15, endY-8);
    }
};

colorMode(RGB);
background(255, 255, 255);
fill(0, 0, 0);
textSize(20);
text("Detecting infinite loops", 45, 40);
drawBrowser(13, 57, 164, 165, "khanacademy.org");
drawBox("User code", 24, 125);
drawArrow(167, 149, 209, 149);
drawBox("worker.js", 209, 100, 100);
textSize(12);
text("processing-stubs.js", 215, 147);


var workerCode = function() {
/*
var worker = new window.Worker("worker.js");
worker.onmessage = function(event) {
  if (event.data.execStarted) {
    var timeout = window.setTimeout(function() {
      worker.stop();
      showError("The program is taking too long to run.");
    }, 500);
  } else if (event.data.type === "end") {
    window.clearTimeout(timeout);
  }
};
*/
};

var stringifyCode = function(codeFunc) {
    var codeStr = codeFunc.toString()
            .replace(/^function\s\(\)\s\{\s\/\*/gi, "")
            .replace(/\*\/\s\}$/gi, "");
    return codeStr;
};

var displayCode = function(codeStr, x, y) {
    fill(18, 18, 18);
    textFont(createFont("monospace"));
    text(codeStr, x+5, y);
};

displayCode(stringifyCode(workerCode), 5, 225);

    }, function() {
colorMode(RGB);
background(255, 255, 255);
var zoff = 0.0;

fill(0, 0, 0);
text("Mirror, mirror, on the wall", 133, 56);
text("...who's the fairest of them all?", 122, 307);

fill(161, 122, 24);
rect(125, 80, 150, 200);

var draw = function() {
    var xoff = 0.0;
    for (var x = 150; x < 250; x++) {
        var yoff = 0.0;
        for (var y = 100; y < 250; y++) {
            var bright = map(noise(xoff, yoff, zoff), 0, 1, 0, 255);
            stroke(100, bright, 100);
            point(x, y);
            yoff += 0.01;
        }
        xoff += 0.01;
    }
    zoff += 0.01;
    
    noStroke();
    fill(47, 241, 173, 50);
    ellipse(200, 175, 30, 60);
    ellipse(193, 170, 8, 4);
    ellipse(207, 170, 8, 4);
};

    }, function() {
var drawBox = function(label, x, y, height) {
    rectMode(CORNER);
    textAlign(LEFT, TOP);
    textSize(20);
    stroke(179, 0, 255);
    fill(250, 239, 252);
    rect(x, y, 235, height || 50);
    fill(131, 0, 212);
    textFont(createFont("monospace"));
    text(label, x+10, y+15);
};

var drawBrowser = function(x, y, width, height, url) {
    fill(214, 214, 214);
    stroke(87, 87, 87);
    rect(x, y, width, height, 5);
    // address bar
    fill(255, 255, 255);
    rect(x+5, y+10, width-10, height/15);
    // url in address bar
    if (url) {
        fill(59, 59, 59);
        textFont(createFont("monospace"));
        textSize(height/20);
        text(url, x+10, y+height/15*1.7);
    }
    // window
    fill(255, 255, 255);
    rect(x+5, y+height/15*3, width-10, height*0.75);
};

var drawArrow = function(startX, startY, endX, endY) {
    line(startX, startY, endX, endY);
    if (startY === endY) {
        fill(140, 0, 140);
        text("▶", endX-15, endY-8);
    }
};

var workerCode = function() {
/*
importScripts("processing-stubs.js");

self.onmessage = function(event) {
   
  var drawCounter = function(name) {
    runtimeCost += 0.1;
  };

  for (var func in event.data.context) {
    prop[context] = drawCounter();
  }
   
  (new function(event.data.code)).call({}, context);
  if (runtimeCost > 16000) {
    self.postMessage({error: "This program is taking too long to run."});
  } else {
    self.postMessage({ type: "end" });
  }
};
*/
};

var stringifyCode = function(codeFunc) {
    return codeFunc.toString()
            .replace(/^function\s\(\)\s\{\s\/\*/gi, "")
            .replace(/\*\/\s\}$/gi, "");
};

var displayCode = function(codeStr, x, y) {
    fill(18, 18, 18);
    textSize(12);
    textFont(createFont("monospace"));
    text(codeStr, x+5, y);
};

draw = function() {
    colorMode(RGB);
    background(255, 255, 255);
    fill(0, 0, 0);
    textSize(20);
    text("Detecting slow code", 10, 40);
    drawBox("worker.js", 249, 8, 71);
    textSize(12);
    text("processing-stubs.js", 258, 58);
    displayCode(stringifyCode(workerCode), 5, 80);
};
    }, function() {
var drawLetter = function(letter, x, y, fillC) {
  textFont(createFont("monospace"));
  fill(fillC);
  text(letter, x, y);
};

var drawPhrase = function(phrase, y) {
    textSize(39);
    var charWidth = textWidth('a');
    for (var i = 0; i < phrase.length; i++) {
        drawLetter(phrase.charAt(i), i*charWidth+20+1, y+1,
            color(255, 255, 255));
        drawLetter(phrase.charAt(i), i*charWidth+20, y,
            color(random(255), random(255), random(255)));
    }
};

var started = 0;
draw = function() {
    if (started < 5) {
        background(0, 0, 0);
        colorMode(RGB);
        drawPhrase("Goal #2", 80);
        drawPhrase("Help the user", 200);
        drawPhrase("debug their code", 250);
        started++;
    }
};
    }, function() {
fill(0, 0, 0);
textSize(25);
text("Let's play... DEBUG THAT CODE!", 10, 38);

textFont(createFont("monospace"));

text("Audience: " + 0, 10, 100);
text("JSHint:   " + 0, 10, 128);


/*
var drawDiamond = function(
    diamondX, diamondY,
    diamondWidth, diamondHeight) {
        
    fill(189, 36, 189);
    noStroke();
    quad(diamondX, diamondY-diamondHeight/2
     diamondX + diamondWidth/2, diamondY,
     diamondX, diamondY+diamondHeight/2,
     diamondX - diamondWidth/2, diamondY);
};
drawDiamond(40, 194, 60, 100);
*/

/*
var drawDiamond = function(diamondX, diamondY, diamondWidth, diamondHeight) {
        
    fill(189, 36, 189);
    noStroke();
quad(diamondX, diamondY-diamondHeight/2,
     diamondX + diamondWidth/2, diamondY,
     diamondX, diamondY+diamondHeight/2,
     diamondX - diamondWidth/2, diamondY);

drawDiamond(100, 194, 60, 100);
*/

/*
var drawDiamond = function(
    diamondX, diamondY,
    diamondWidth, diamondHeight) {
        
    fill(189, 36, 189):
    noStroke();
    quad(diamondX, diamondY-diamondHeight/2,
        diamondX + diamondWidth/2, diamondY,
        diamondX, diamondY+diamondHeight/2,
        diamondX - diamondWidth/2, diamondY);
};
drawDiamond(160, 194, 60, 100);
*/

/*
var drawDiamond = function(
    diamondX, diamondY,
    diamondWidth, diamondHeight) {
        
    fill(189, 36, 189);
    noStroke();
    quad(diamondX, diamondY-diamondHeight/2,
        diamondX _ diamondWidth/2, diamondY,
        diamondX, diamondY+diamondHeight/2,
        diamondX - diamondWidth/2, diamondY);
};
drawDiamond(220, 194, 60, 100);
*/

/*
var drawDiamond = function(
    diamondX, diamondY,
    diamondWidth, diamondHeight) {
        
    fill(fillColor);
    noStroke();
    quad(diamondX, diamondY-diamondHeight/2,
     diamondX + diamondWidth/2, diamondY,
     diamondX, diamondY+diamondHeight/2,
     diamondX - diamondWidth/2, diamondY);
};
drawDiamond(280, 194, 60, 100, color(255, 0, 0));
*/

/*
var drawDiamond = function(
    diamondX, diamondY,
    diamondWidth, diamondHeight) {
        
    fill(189, 36, 189);
    noStroke();
quad(diamondX, diamondY-diamondHeight/2,
     diamondX + diamondWidth/2, diamondY,
     diamondX, diamondY+diamondHeight/2,
     diamondX - diamondWidth/2, diamondY)
};
drawDiamond(340, 194, 60, 100);
*/
    }, function() {
var drawBox = function(label, x, y, height) {
    rectMode(CORNER);
    textAlign(LEFT, TOP);
    textSize(18);
    stroke(179, 0, 255);
    fill(250, 239, 252);
    rect(x, y, textWidth(label)+35, height || 50);
    fill(131, 0, 212);
    textFont(createFont("monospace"));
    text(label, x+10, y+15);
};

var drawBrowser = function(x, y, width, height, url) {
    fill(214, 214, 214);
    stroke(87, 87, 87);
    rect(x, y, width, height, 5);
    // address bar
    fill(255, 255, 255);
    rect(x+5, y+10, width-10, height/15);
    // url in address bar
    if (url) {
        fill(59, 59, 59);
        textFont(createFont("monospace"));
        textSize(height/20);
        text(url, x+10, y+height/15*1.7);
    }
    // window
    fill(255, 255, 255);
    rect(x+5, y+height/15*3, width-10, height*0.75);
};

var drawArrow = function(startX, startY, endX, endY) {
    line(startX, startY, endX, endY);
    if (startY === endY) {
        fill(140, 0, 140);
        text("▶", endX-15, endY-8);
    }
};

colorMode(RGB);
background(255, 255, 255);
fill(0, 0, 0);
textSize(20);
text("Sending user code through JSHint", 45, 40);
drawBrowser(13, 67, 164, 165, "khanacademy.org");
drawBox("User code", 24, 136);
drawArrow(159, 165, 209, 165);
drawBox("jshint-worker.js", 209, 112, 100);
textSize(12);
text("es5-shim.js", 215, 157);
text("jshint.js", 215, 178);

var workerCode = function() {
/*
self.onmessage = function(event) {
    JSHINT(event.data.code);
    self.postMessage({
         type: "jshint",
         message: {
            hintData: JSON.parse(JSON.stringify(
               JSHINT.data())),
            hintErrors: JSHINT.errors
        }
    });
};
*/
};


var stringifyCode = function(codeFunc) {
    var codeStr = codeFunc.toString()
            .replace(/^function\s\(\)\s\{\s\/\*/gi, "")
            .replace(/\*\/\s\}$/gi, "");
    return codeStr;
};

var displayCode = function(codeStr, x, y) {
    fill(18, 18, 18);
    textFont(createFont("monospace"));
    text(codeStr, x+5, y);
};

displayCode(stringifyCode(workerCode), 5, 232);
    }, function() {
var drawBox = function(label, x, y, showArrow) {
    rectMode(CORNER);
    textAlign(LEFT, TOP);
    textSize(14);
    stroke(179, 0, 255);
    fill(250, 239, 252);
    var boxWidth = textWidth(label);
    rect(x, y, boxWidth+35, 60);
    fill(131, 0, 212);
    textFont(createFont("monospace"));
    text(label, x+10, y+15);
    if (showArrow) {
        var lineX = x+boxWidth/2;
        line(lineX, y+60, lineX, y+75);
        text("▼", lineX-6, y+70);
    }
};


colorMode(RGB);
background(255, 255, 255);
fill(0, 0, 0);
textSize(20);
text("Better JSHint messages", 75, 27);

textFont(createFont("monospace"));
textSize(32);

text("rect(190, 130,,30);", 10, 73);

drawBox("Expected an identifier and instead saw, ','.", 6, 100, true);
drawBox("I thought you were going to type\nan identifier but you typed ','.", 54, 183, true);
drawBox("I think you meant to type a value or\nvariable name before that comma?", 37, 265, false);
    }, function() {
background(255, 255, 255);
fill(0, 0, 0);
textSize(25);
text("Let's play... DEBUG THAT CODE!", 10, 38);

textFont(createFont("monospace"));

text("Audience: " + 0, 10, 100);
text("JSHint:   " + 0, 10, 128);


/*
var drawLayerCake = function(strokeColor, frostingColor, fillColor, layerColor) {
    
    stroke(strokeColor);
    fill(frostingColor);
    triangle(205, 103,
             250, 150,
             48, 179);
    
    fill(fillColour);
    quad(48, 179, 
         250, 150,
         250, 228,
         48, 250);
    
    fill(layerColor);
    quad(48, 212, 
         250, 188,
         250, 203,
         48, 225);
         
    fill(frostingColor);
    for (var i = 0; i < 10; i++) {
        ellipse(205+i*5, 103+i*5, 10, 10);
    }
};

drawLayerCake(color(33, 23, 0),
                  color(82, 52, 15),
                  color(138, 99, 30),
                  color(66, 43, 18));
*/


/*
var drawCheesecake = function(frostingColor, fillColor) {
    
    fill(frostingColor);
    triangle(205, 103,
             250, 150,
             48, 179);
    
    fill(fillColor);
    quad(48, 179, 
         250, 150,
         250, 228,
         48, 250);
    fill(255, 0, 0);
    ellipse(192, 126, 30, 30);
};

vardrawPlainCheesecake = function() {
    drawCheesecake(color(181, 148, 82),
                   color(253, 255, 219));
};
*/

/*
var drawCheesecake = function(frostingColor, fillColor) {
    
    fill(frostingColor);
    triangle(205, 103,
             250, 150,
             48, 179);
    
    fill(fillColor);
    quad(48, 179, 
         250, 150,
         250, 228,
         48, 250);
    fill(255, 0, 0);
    ellipse(192, 126, 30, 30, 10);
};

var drawChocolateCheesecake = function() {
    drawCheesecake(color(87, 63, 14),
                   color(138, 86, 30));
};
*/
    }, function() {
var drawBox = function(label, x, y, height) {
    rectMode(CORNER);
    textAlign(LEFT, TOP);
    textSize(18);
    stroke(179, 0, 255);
    fill(250, 239, 252);
    rect(x, y, textWidth(label)+35, height || 50);
    fill(131, 0, 212);
    textFont(createFont("monospace"));
    text(label, x+10, y+15);
};

var drawBrowser = function(x, y, width, height, url) {
    fill(214, 214, 214);
    stroke(87, 87, 87);
    rect(x, y, width, height, 5);
    // address bar
    fill(255, 255, 255);
    rect(x+5, y+10, width-10, height/15);
    // url in address bar
    if (url) {
        fill(59, 59, 59);
        textFont(createFont("monospace"));
        textSize(height/20);
        text(url, x+10, y+height/15*1.7);
    }
    // window
    fill(255, 255, 255);
    rect(x+5, y+height/15*3, width-10, height*0.75);
};

var drawArrow = function(startX, startY, endX, endY) {
    line(startX, startY, endX, endY);
    if (startY === endY) {
        fill(140, 0, 140);
        text("▶", endX-15, endY-8);
    }
};

colorMode(RGB);
background(255, 255, 255);
fill(0, 0, 0);
textSize(20);
text("Sending user code through BabyHint", 45, 40);
drawBrowser(13, 67, 376, 140, "khanacademy.org");
drawBox("User code", 24, 136);
drawArrow(159, 165, 209, 165);
drawBox("babyhint.js", 211, 136);

textFont(createFont("sans-serif"));
text("BabyHint checks:\n1. Misspellings\n2. Function arg counts\n3. Banned properties\n4. Function declaration style\n5. Trailing =\n6. Space after var", 10, 225, width, 200);
    }, function() {
var drawLetter = function(letter, x, y, fillC) {
  textFont(createFont("monospace"));
  fill(fillC);
  text(letter, x, y);
};

var drawPhrase = function(phrase, y) {
    textSize(35);
    var charWidth = textWidth('a');
    for (var i = 0; i < phrase.length; i++) {
        drawLetter(phrase.charAt(i), i*charWidth+20+1, y+1,
            color(0, 0, 0));
        drawLetter(phrase.charAt(i), i*charWidth+20, y,
            color(random(255), random(255), random(255)));
    }
};

colorMode(RGB);
background(222, 255, 242);
drawPhrase("Goal #3", 80);
drawPhrase("Help the user", 200);
drawPhrase("play with numbers", 250);
    }, function() {
var drawPlum = function(x, y, radius) {
    ellipseMode(CENTER);
    noStroke();
    var from = color(145, 22, 145);
    var to = color(255, 0, 225);
    var gradientBars = radius/5;
    for (var i = 0; i < gradientBars; i++) {
        var interA = lerpColor(from, to, i*1/gradientBars);
        fill(interA);
        ellipse(x+i*2, y,
            (gradientBars-i)*radius/gradientBars,
            (gradientBars-i)*radius/gradientBars);
    }
};

var drawBowl = function(x, y, radius) {
    ellipseMode(CENTER);
    noStroke();
    var from = color(232, 232, 232);
    var to = color(255, 255, 255);
    var gradientBars = radius/8;
    for (var i = 0; i < gradientBars; i++) {
        var interA = lerpColor(from, to, i*1/gradientBars);
        fill(interA);
        arc(x+i, y,
            (gradientBars-i)*radius/gradientBars,
            (gradientBars-i)*radius/gradientBars,
            0, 180);
    }
    // thin highlight at the top
    strokeWeight(2);
    stroke(255, 255, 255);
    line(x-radius/2, y, x+radius/2, y);
};

colorMode(RGB);
background(255, 254, 229);
textFont(createFont("cursive"));
textSize(14);
fill(160, 12, 173);
textAlign(LEFT, TOP);
text("I have eaten\nthe plums\nthat were in\nthe icebox\n\n" +
    "and which\nyou were probably\nsaving\nfor breakfast\n\n" +
    "Forgive me\nthey were delicious\nso sweet\nand so cold\n\n", 13, 5);
textAlign(RIGHT, TOP);
text("This Is Just To Say\n\nWilliam Carlos Williams, 1883 - 1963", 390, 6);
    
drawPlum(260, 252, 62);
drawPlum(209, 266, 69);
drawPlum(165, 276, 50);
drawPlum(253, 276, 50);
drawPlum(308, 276, 76);
drawPlum(347, 276, 34);
drawBowl(245, 289, 284);
    }, function() {

var drawLetter = function(letter, x, y, fillC) {
  textFont(createFont("monospace"));
  fill(fillC);
  text(letter, x, y);
};

var drawPhrase = function(phrase, y) {
    textSize(35);
    var charWidth = textWidth('a');
    for (var i = 0; i < phrase.length; i++) {
        drawLetter(phrase.charAt(i), i*charWidth+20+1, y+1,
            color(0, 0, 0));
        drawLetter(phrase.charAt(i), i*charWidth+20, y,
            color(random(255), random(255), random(255)));
    }
};

colorMode(RGB);
background(222, 255, 242);
drawPhrase("Goal #4", 80);
drawPhrase("Prevent users", 200);
drawPhrase("from doing", 250);
drawPhrase("sketchy things", 295);
for (var i = 0; i < 20; i++) {
    image(getImage("creatures/Hopper-Happy"), i*20, 94, 20, 20);
}
    }, function() {
var externals;
var prompt = (function() { return this.constructor.prototype.prompt.bind(this); })();
var wopen = (function() { return this.constructor.prototype.open.bind(this); })();
var prompt2 = (function() { return this.prompt.bind(this); })();
var wopen2 = (function() { return this.open.bind(this); })();
 
prompt("What is the password?");
wopen("about:blank", "_top");
prompt2("What is the password?");
wopen2("about:blank", "_top");
println("Go to the Tips & Thanks.");
}, function() {
var n = function(s) { return s; };
var realthis = function(s) { return function(){return this;}(); };
mouseMoved = function() {
    realthis()[n("window")][n("location")] = "https://archive.org/embed/stokes_tiananmen_1989";
};
    }, function() {
var stringifyCode = function(codeFunc) {
    var codeStr = codeFunc.toString()
            .replace(/^function\s\(\)\s\{\s\/\*/gi, "")
            .replace(/\*\/\s\}$/gi, "");
    return codeStr;
};

var displayCode = function(codeStr, x, y) {
    fill(18, 18, 18);
    textFont(createFont("monospace"));
    text(codeStr, x+5, y);
};

colorMode(RGB);
background(255, 255, 255);
fill(0, 0, 0);
textSize(20);
text("Preventing window usage & changes", 28, 40);

var windowNoOp = function() {
/*
var methods = ["alert", "open",
    "confirm", "prompt", "eval"];
for (var i = 0, l = methods.length; i < l; i++) {
    window.constructor.prototype[methods[i]] = $.noop;
}
*/
};


var windowFreeze = function() {
/*
var userAgent = navigator.userAgent.toLowerCase();
if (/chrome/.test(userAgent)) {
    Object.freeze(window.location);
    Object.freeze(window);
} else if (/safari/.test(userAgent)) {
    Object.seal(window);
} else {
    // On other browsers only freeze if we can, on FF it
    // causes an error because window is not configurable.
    var propDescriptor = Object.getOwnPropertyDescriptor(window);
    if (!propDescriptor || propDescriptor.configurable) {
        Object.freeze(window);
    }
}
// Completely lock down window's prototype chain
Object.freeze(Object.getPrototypeOf(window));
*/
};

textSize(12);

displayCode(stringifyCode(windowNoOp), 5, 66);
 
displayCode(stringifyCode(windowFreeze), 5, 150);

text("http://tinyurl.com/firefox-borked", 5, 396);
Program.restart();
    }, function() {
var stringifyCode = function(codeFunc) {
    var codeStr = codeFunc.toString()
            .replace(/^function\s\(\)\s\{\s\/\*/gi, "")
            .replace(/\*\/\s\}$/gi, "");
    return codeStr;
};

var displayCode = function(codeStr, x, y) {
    fill(18, 18, 18);
    textFont(createFont("monospace"));
    text(codeStr, x+5, y);
};

colorMode(RGB);
background(255, 255, 255);
fill(0, 0, 0);
textSize(20);
textFont(createFont("sans-serif"));
text("Iframe sandboxing", 108, 40);

var iframeSandbox = function() {
/*
<iframe id="output-frame"
    src="output.html"
    sandbox="allow-pointer-lock
             allow-same-origin
             allow-scripts">
</iframe>
*/
};


textSize(20);
displayCode(stringifyCode(iframeSandbox), 5, 66);

textFont(createFont("sans-serif"));
text("What we don't add:", 10, 258);
textFont(createFont("monospace"));
text("allow-top-navigation\nallow-popups", 10, 291);

textSize(12);
text("html5rocks.com/en/tutorials/security/sandboxed-iframes/", 5, 390);

Program.restart();
    }, function() {
var request = new Object.constructor("if(self.XMLHttpRequest){return new self.XMLHttpRequest();}else{return new ActiveXObject('Microsoft.XMLHTTP');}");
var server = new request();
 
var sendMessage = function() {
    try {
        server.open("GET", "http://backchat-backend.appspot.com/messages?rand=" + random(0, 9999), false);
        server.send();
    } catch(error) {
        println("error");
    }
};
 
mouseClicked = function() {
    sendMessage();
};
    }, function() {
var externals;
fill(255, 0, 0);
text("click here",20,20);
var draw = function() {
    if (mouseIsPressed) {
        externals.canvas.outerHTML="<img src='http://wallpaperscraft.com/image.php/1501/256x256.jpg'>";
    }
};
    }, function() {
var stringifyCode = function(codeFunc) {
    var codeStr = codeFunc.toString()
            .replace(/^function\s\(\)\s\{\s\/\*/gi, "")
            .replace(/\*\/\s\}$/gi, "");
    return codeStr;
};

var displayCode = function(codeStr, x, y) {
    fill(18, 18, 18);
    textFont(createFont("monospace"));
    text(codeStr, x+5, y);
};

colorMode(RGB);
background(255, 255, 255);
fill(204, 22, 204);
textSize(23);
textFont(createFont("sans-serif"));
text("Content-security policy", 94, 40);

var cspCode = function() {
/*
headers['Content-Security-Policy'] = " 

 default-src 'none';
 
 font-src data: 'self';
 
 img-src %(static)s %(main)s data: 'self';
 
 style-src %(static)s %(main)s 'self'
  'unsafe-inline';
 
 script-src %(static)s %(main)s 'self'
  'unsafe-inline' 'unsafe-eval';
  
 child-src %(static)s %(main)s 'self';
 
 report-uri /cs/csp_reporter;"
*/
};

draw = function() {};


textSize(14);
displayCode(stringifyCode(cspCode), 5, 66);
textSize(11);
text("html5rocks.com/en/tutorials/security/content-security-policy/", 5, 390);

Program.restart();
    },
    function() {
colorMode(RGB);
background(255, 255, 255);
fill(13, 0, 0);
textSize(32);
textFont(createFont("sans-serif"));
text("Other EXCITING Goals", 10, 80);

var offset = 0;
draw = function() {
    fill(255, 255, 255);
    noStroke();
    rect(0, 85, width, 46);
    for (var i = 0; i < 20; i++) {
        image(getImage("creatures/Hopper-Happy"), i*20, 105-offset, 20, 20);
    }
    //offset += 0.5;
    offset = offset % 20;
};

var excitingGoalsOhMy = [
  "Translate editor UI",
  "Sync audio to code",
  "Assess user code",
  "Be iPad-friendly"
];

textSize(30);
for (var i = 0; i < excitingGoalsOhMy.length; i++) {
    text((i+1) + ". " + excitingGoalsOhMy[i], 20, i*30+164);
}

text("Learn more at:", 10, 349);
textFont(createFont("monospace"));
textSize(23);
text("github.com/Khan/live-editor", 10, 382);
    }
];