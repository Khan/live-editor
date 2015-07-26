this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["live-editor"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  
  return " no-output";}

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n                <iframe id=\"output-frame\"\r\n                    src=\"";
  foundHelper = helpers.execFile;
  stack1 = foundHelper || depth0.execFile;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "execFile", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\"\r\n                    data-src=\"";
  foundHelper = helpers.execFile;
  stack1 = foundHelper || depth0.execFile;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "execFile", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\"></iframe>\r\n            ";
  return buffer;}

function program5(depth0,data) {
  
  
  return "Loading...";}

function program7(depth0,data) {
  
  
  return "Hmm...";}

function program9(depth0,data) {
  
  
  return "Restart";}

function program11(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n                <a href=\"\" class=\"draw-color-button\" id=\"";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\r\n                    <span></span>\r\n                </a>\r\n                ";
  return buffer;}

function program13(depth0,data) {
  
  
  return "Record";}

function program15(depth0,data) {
  
  
  return "Loading...";}

function program17(depth0,data) {
  
  
  return "Enable Flash to load audio:";}

function program19(depth0,data) {
  
  
  return "Play";}

function program21(depth0,data) {
  
  
  return "Loading audio...";}

  buffer += "<div class=\"scratchpad-wrap";
  foundHelper = helpers.execFile;
  stack1 = foundHelper || depth0.execFile;
  stack2 = helpers.unless;
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\r\n    <!-- Canvases (Drawing + Output) -->\r\n    <div class=\"scratchpad-canvas-wrap\">\r\n        <div id=\"output\">\r\n            <!-- Extra data-src attribute to work around\r\n                 cross-origin access policies. -->\r\n            ";
  foundHelper = helpers.execFile;
  stack1 = foundHelper || depth0.execFile;
  stack2 = helpers['if'];
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n            <canvas class=\"scratchpad-draw-canvas\" style=\"display:none;\"\r\n                width=\"400\" height=\"400\"></canvas>\r\n\r\n            <div class=\"overlay disable-overlay\" style=\"display:none;\">\r\n            </div>\r\n\r\n            <div class=\"scratchpad-canvas-loading\">\r\n                <img src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth0.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/throbber-full.gif\">\r\n                <span class=\"hide-text\">";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(5, program5, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\r\n            </div>\r\n        </div>\r\n\r\n        <div class=\"scratchpad-toolbar\">\r\n            <div class=\"error-buddy-resting\">\r\n                <div class=\"error-buddy-happy\" style=\"display:none;\">\r\n                    <img src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth0.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/ohnoes-happy.png\"/>\r\n                </div>\r\n                <div class=\"error-buddy-thinking\" style=\"display:none;\">\r\n                    <img src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth0.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/ohnoes-hmm.png\"/>\r\n                    ";
  buffer += "\r\n                    ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(7, program7, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n                </div>\r\n            </div>\r\n            <button id=\"restart-code\"\r\n                class=\"simple-button pull-right\">\r\n                <span class=\"icon-refresh\"></span>\r\n                ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(9, program9, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</button>\r\n\r\n            <!-- Widgets for selecting colors to doodle on the canvas during\r\n                recordings -->\r\n            <div id=\"draw-widgets\" style=\"display:none;\">\r\n                <a href=\"\" id=\"draw-clear-button\" class=\"ui-button\">\r\n                    <span class=\"ui-icon-cancel\"></span>\r\n                </a>\r\n                ";
  foundHelper = helpers.colors;
  stack1 = foundHelper || depth0.colors;
  stack2 = helpers.each;
  tmp1 = self.program(11, program11, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n            </div>\r\n\r\n            <!-- Record button -->\r\n            <button id=\"record\" class=\"simple-button pull-left\" style=\"display:none;\">";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(13, program13, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</button>\r\n        </div>\r\n    </div>\r\n\r\n    <!-- Editor -->\r\n    <div class=\"scratchpad-editor-wrap overlay-container\">\r\n        <div class=\"scratchpad-editor-tabs\">\r\n          <div id=\"scratchpad-code-editor-tab\" class=\"scratchpad-editor-tab\">\r\n            <div class=\"scratchpad-editor scratchpad-ace-editor\"></div>\r\n            <div class=\"overlay disable-overlay\" style=\"display:none;\">\r\n            </div>\r\n\r\n            <div class=\"scratchpad-editor-bigplay-loading\" style=\"display:none;\">\r\n                <img src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth0.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/throbber-full.gif\">\r\n                <span class=\"hide-text\">";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(15, program15, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\r\n            </div>\r\n\r\n            <!-- This cannot be removed, if we want Flash to keep working! -->\r\n            <div id=\"sm2-container\">\r\n                ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(17, program17, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n                <br>\r\n            </div>\r\n\r\n            <button class=\"scratchpad-editor-bigplay-button\" style=\"display:none;\">\r\n                <span class=\"icon-play\"></span>\r\n                <span class=\"hide-text\">";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(19, program19, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\r\n            </button>\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"scratchpad-toolbar\">\r\n            <!-- Row for playback controls -->\r\n            <div class=\"scratchpad-playbar\" style=\"display:none;\">\r\n                <div class=\"scratchpad-playbar-area\" style=\"display:none;\">\r\n                    <button\r\n                        class=\"simple-button primary scratchpad-playbar-play\"\r\n                        type=\"button\">\r\n                        <span class=\"icon-play\"></span>\r\n                    </button>\r\n\r\n                    <div class=\"scratchpad-playbar-progress\"></div>\r\n\r\n                    <span class=\"scratchpad-playbar-timeleft\"></span>\r\n                </div>\r\n                <div class=\"loading-msg\">\r\n                    ";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(21, program21, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n                </div>\r\n            </div>\r\n            <div class=\"scratchpad-debugger\"></div>\r\n        </div>\r\n\r\n        <div class=\"scratchpad-toolbar scratchpad-dev-record-row\" style=\"display:none;\"></div>\r\n    </div>\r\n</div>";
  return buffer;});;