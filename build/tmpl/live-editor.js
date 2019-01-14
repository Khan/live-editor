window["Handlebars"] = window["Handlebars"] || {};
window["Handlebars"]["templates"] = window["Handlebars"]["templates"] || {};
window["Handlebars"]["templates"]["live-editor"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return " no-output";
},"3":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "                <iframe id=\"output-frame\"\n                    src=\""
    + alias4(((helper = (helper = helpers.execFile || (depth0 != null ? depth0.execFile : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"execFile","hash":{},"data":data}) : helper)))
    + "\"\n                    data-src=\""
    + alias4(((helper = (helper = helpers.execFile || (depth0 != null ? depth0.execFile : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"execFile","hash":{},"data":data}) : helper)))
    + "\"></iframe>\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "Loading...";
},"7":function(container,depth0,helpers,partials,data) {
    return "Hmm...";
},"9":function(container,depth0,helpers,partials,data) {
    return "Restart";
},"11":function(container,depth0,helpers,partials,data) {
    return "                <a href=\"\" class=\"draw-color-button\" id=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\">\n                    <span></span>\n                </a>\n";
},"13":function(container,depth0,helpers,partials,data) {
    return "Record";
},"15":function(container,depth0,helpers,partials,data) {
    return "Enable Flash to load audio:";
},"17":function(container,depth0,helpers,partials,data) {
    return "Play";
},"19":function(container,depth0,helpers,partials,data) {
    return "Loading audio...";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=helpers.blockHelperMissing, buffer = 
  "<div class=\"scratchpad-wrap"
    + ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.execFile : depth0),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\n    <!-- Canvases (Drawing + Output) -->\n    <div class=\"scratchpad-canvas-wrap\">\n        <div id=\"output\">\n            <!-- Extra data-src attribute to work around\n                 cross-origin access policies. -->\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.execFile : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "            <canvas class=\"scratchpad-draw-canvas\" style=\"display:none;\"\n                width=\"400\" height=\"400\"></canvas>\n\n            <div class=\"overlay disable-overlay\" style=\"display:none;\">\n            </div>\n\n            <div class=\"scratchpad-canvas-loading\">\n                <img src=\""
    + alias4(((helper = (helper = helpers.imagesDir || (depth0 != null ? depth0.imagesDir : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"imagesDir","hash":{},"data":data}) : helper)))
    + "/spinner-large.gif\">\n                <span class=\"hide-text\">";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "</span>\n            </div>\n        </div>\n\n        <div class=\"scratchpad-toolbar\">\n            <div class=\"error-buddy-resting\">\n                <div class=\"error-buddy-happy\" style=\"display:none;\">\n                    <img src=\""
    + alias4(((helper = (helper = helpers.imagesDir || (depth0 != null ? depth0.imagesDir : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"imagesDir","hash":{},"data":data}) : helper)))
    + "/creatures/OhNoes-Happy.png\"/>\n                </div>\n                <a class=\"error-buddy-thinking\" style=\"display:none;\" href=\"javascript:void()\">\n                    <img src=\""
    + alias4(((helper = (helper = helpers.imagesDir || (depth0 != null ? depth0.imagesDir : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"imagesDir","hash":{},"data":data}) : helper)))
    + "/creatures/OhNoes-Hmm.png\"/>\n                    ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n                </a>\n            </div>\n            <button id=\"restart-code\"\n                class=\"simple-button pull-right\">\n                <span class=\"icon-refresh\"></span>\n                ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "</button>\n\n            <!-- Widgets for selecting colors to doodle on the canvas during\n                recordings -->\n            <div id=\"draw-widgets\" style=\"display:none;\">\n                <a href=\"\" id=\"draw-clear-button\" class=\"ui-button\">\n                    <span class=\"ui-icon-cancel\"></span>\n                </a>\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.colors : depth0),{"name":"each","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "            </div>\n\n            <!-- Record button -->\n            <button id=\"record\" class=\"simple-button pull-left\" style=\"display:none;\">";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "</button>\n        </div>\n    </div>\n\n    <!-- Editor -->\n    <div class=\"scratchpad-editor-wrap overlay-container\">\n        <div class=\"scratchpad-editor-tabs\">\n          <div id=\"scratchpad-code-editor-tab\" class=\"scratchpad-editor-tab\">\n            <div class=\"scratchpad-editor scratchpad-ace-editor\"></div>\n            <div class=\"overlay disable-overlay\" style=\"display:none;\">\n            </div>\n\n            <div class=\"scratchpad-editor-bigplay-loading\" style=\"display:none;\">\n                <img src=\""
    + alias4(((helper = (helper = helpers.imagesDir || (depth0 != null ? depth0.imagesDir : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"imagesDir","hash":{},"data":data}) : helper)))
    + "/spinner-large.gif\">\n                <span class=\"hide-text\">";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "</span>\n            </div>\n\n            <!-- This cannot be removed, if we want Flash to keep working! -->\n            <div id=\"sm2-container\">\n                ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n                <br>\n            </div>\n\n            <button class=\"scratchpad-editor-bigplay-button\" style=\"display:none;\">\n                <span class=\"icon-play\"></span>\n                <span class=\"hide-text\">";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "</span>\n            </button>\n          </div>\n        </div>\n\n        <div class=\"scratchpad-toolbar\">\n            <!-- Row for playback controls -->\n            <div class=\"scratchpad-playbar\" style=\"display:none;\">\n                <div class=\"scratchpad-playbar-area\" style=\"display:none;\">\n                    <button\n                        class=\"simple-button primary scratchpad-playbar-play\"\n                        type=\"button\">\n                        <span class=\"icon-play\"></span>\n                    </button>\n\n                    <div class=\"scratchpad-playbar-progress\"></div>\n\n                    <span class=\"scratchpad-playbar-timeleft\"></span>\n                </div>\n                <div class=\"loading-msg\">\n                    ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n                </div>\n            </div>\n            <div class=\"scratchpad-debugger\"></div>\n        </div>\n\n        <div class=\"scratchpad-toolbar scratchpad-dev-record-row\" style=\"display:none;\"></div>\n    </div>\n</div>";
},"useData":true});;