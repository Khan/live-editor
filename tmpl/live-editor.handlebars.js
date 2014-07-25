(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['live-editor'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  
  return "Loading...";
  }

function program3(depth0,data) {
  
  
  return "Restart";
  }

function program5(depth0,data) {
  
  var buffer = "";
  buffer += "\n                <a href=\"\" class=\"draw-color-button\" id=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\">\n                    <span></span>\n                </a>\n                ";
  return buffer;
  }

function program7(depth0,data) {
  
  
  return "Record";
  }

function program9(depth0,data) {
  
  
  return "Enable Flash to load audio:";
  }

function program11(depth0,data) {
  
  
  return "Play";
  }

function program13(depth0,data) {
  
  
  return "Loading audio...";
  }

  buffer += "<div class=\"scratchpad-wrap\">\n    <!-- Canvases (Drawing + Output) -->\n    <div class=\"scratchpad-canvas-wrap\">\n        <div id=\"output\">\n            <!-- Extra data-src attribute to work around\n                 cross-origin access policies. -->\n            <iframe id=\"output-frame\"\n                src=\"";
  if (helper = helpers.execFile) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.execFile); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"\n                data-src=\"";
  if (helper = helpers.execFile) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.execFile); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\"></iframe>\n            <canvas class=\"scratchpad-draw-canvas\" style=\"display:none;\"\n                width=\"400\" height=\"400\"></canvas>\n\n            <div class=\"overlay disable-overlay\" style=\"display:none;\">\n            </div>\n\n            <div class=\"scratchpad-canvas-loading\">\n                <img src=\"";
  if (helper = helpers.imagesDir) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.imagesDir); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "/throbber-full.gif\">\n                <span class=\"hide-text\">";
  options={hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n            </div>\n        </div>\n\n        <div class=\"scratchpad-toolbar\">\n            <button id=\"restart-code\"\n                class=\"simple-button pull-right\">\n                <span class=\"glyphicon glyphicon-refresh icon-refresh\"></span>\n                ";
  options={hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</button>\n\n            <!-- Widgets for selecting colors to doodle on the canvas during\n                recordings -->\n            <div id=\"draw-widgets\" style=\"display:none;\">\n                <a href=\"\" id=\"draw-clear-button\" class=\"ui-button\">\n                    <span class=\"ui-icon-cancel\"></span>\n                </a>\n                ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.colors), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </div>\n\n            <!-- Record button -->\n            <button id=\"record\" class=\"simple-button pull-left\" style=\"display:none;\">";
  options={hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</button>\n        </div>\n    </div>\n\n    <!-- Editor -->\n    <div class=\"scratchpad-editor-wrap overlay-container\">\n        <div class=\"scratchpad-editor-tabs\">\n          <div id=\"scratchpad-code-editor-tab\" class=\"scratchpad-editor-tab\">\n            <div class=\"scratchpad-editor scratchpad-ace-editor\"></div>\n            <div class=\"overlay disable-overlay\" style=\"display:none;\">\n            </div>\n\n            <div class=\"scratchpad-editor-bigplay-loading\" style=\"display:none;\">\n                <img src=\"";
  if (helper = helpers.imagesDir) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.imagesDir); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "/throbber-full.gif\">\n                <span class=\"hide-text\">";
  options={hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n            </div>\n\n            <!-- This cannot be removed, if we want Flash to keep working! -->\n            <div id=\"sm2-container\">\n                ";
  options={hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                <br>\n            </div>\n\n            <button class=\"scratchpad-editor-bigplay-button\" style=\"display:none;\">\n                <span class=\"glyphicon glyphicon-play icon-play\"></span>\n                <span class=\"hide-text\">";
  options={hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n            </button>\n          </div>\n        </div>\n\n        <div class=\"scratchpad-toolbar\">\n            <!-- Row for playback controls -->\n            <div class=\"scratchpad-playbar\" style=\"display:none;\">\n                <div class=\"scratchpad-playbar-area\" style=\"display:none;\">\n                    <button\n                        class=\"simple-button primary scratchpad-playbar-play\"\n                        type=\"button\">\n                        <span class=\"glyphicon glyphicon-play icon-play\"></span>\n                    </button>\n\n                    <div class=\"scratchpad-playbar-progress\"></div>\n\n                    <span class=\"scratchpad-playbar-timeleft\"></span>\n                </div>\n                <div class=\"loading-msg\">\n                    ";
  options={hash:{},inverse:self.noop,fn:self.program(13, program13, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(13, program13, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                </div>\n            </div>\n        </div>\n\n        <div class=\"scratchpad-toolbar scratchpad-dev-record-row\" style=\"display:none;\"></div>\n    </div>\n</div>";
  return buffer;
  });
})();