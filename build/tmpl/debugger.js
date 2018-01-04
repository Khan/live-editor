this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["debugger"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  return "Debug Mode";
  },"3":function(depth0,helpers,partials,data) {
  return "Level";
  },"5":function(depth0,helpers,partials,data) {
  return "Beginner";
  },"7":function(depth0,helpers,partials,data) {
  return "Advanced";
  },"9":function(depth0,helpers,partials,data) {
  return "Begin";
  },"11":function(depth0,helpers,partials,data) {
  return "Step";
  },"13":function(depth0,helpers,partials,data) {
  return "End";
  },"15":function(depth0,helpers,partials,data) {
  return "Restart";
  },"17":function(depth0,helpers,partials,data) {
  return "Step Over";
  },"19":function(depth0,helpers,partials,data) {
  return "Step In";
  },"21":function(depth0,helpers,partials,data) {
  return "Step Out";
  },"23":function(depth0,helpers,partials,data) {
  return "Continue";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "<div class=\"scratchpad-debugger\">\n    ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n    <input type=\"checkbox\" class=\"debug-mode\">\n    <span class=\"debugger-level\" style=\"display:none;margin-left:20px;\">\n        ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        <select class=\"debugger-level-select\">\n            <option value=\"beginner\" selected>\n                ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n            </option>\n            <option value=\"advanced\">\n                ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(7, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n            </option>\n        </select>\n    </span>\n\n    <div class=\"debugger-simple\" style=\"display:none;margin-top:5px;\">\n        <button class=\"debug-begin\" style=\"margin-right:20px;\">\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(9, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"step-in\" disabled>\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(11, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"debug-end\" disabled style=\"margin-left:20px;\">\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(13, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n    </div>\n    <div class=\"debugger-complex\" style=\"display:none;margin-top:5px;\">\n        <button class=\"debug-restart\" style=\"margin-right:10px;\">\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(15, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n        <!-- start/restart -->\n        <button class=\"step-over\" disabled>\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(17, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"step-in\" disabled>\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(19, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"step-out\" disabled>\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(21, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"debug-continue\" disabled style=\"margin-left:10px;\">\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(23, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n        </button>\n    </div>\n</div>\n";
},"useData":true});;