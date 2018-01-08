this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["debugger"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "Debug Mode";
},"3":function(container,depth0,helpers,partials,data) {
    return "Level";
},"5":function(container,depth0,helpers,partials,data) {
    return "Beginner";
},"7":function(container,depth0,helpers,partials,data) {
    return "Advanced";
},"9":function(container,depth0,helpers,partials,data) {
    return "Begin";
},"11":function(container,depth0,helpers,partials,data) {
    return "Step";
},"13":function(container,depth0,helpers,partials,data) {
    return "End";
},"15":function(container,depth0,helpers,partials,data) {
    return "Restart";
},"17":function(container,depth0,helpers,partials,data) {
    return "Step Over";
},"19":function(container,depth0,helpers,partials,data) {
    return "Step In";
},"21":function(container,depth0,helpers,partials,data) {
    return "Step Out";
},"23":function(container,depth0,helpers,partials,data) {
    return "Continue";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, buffer = 
  "<div class=\"scratchpad-debugger\">\n    ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n    <input type=\"checkbox\" class=\"debug-mode\">\n    <span class=\"debugger-level\" style=\"display:none;margin-left:20px;\">\n        ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        <select class=\"debugger-level-select\">\n            <option value=\"beginner\" selected>\n                ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n            </option>\n            <option value=\"advanced\">\n                ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n            </option>\n        </select>\n    </span>\n\n    <div class=\"debugger-simple\" style=\"display:none;margin-top:5px;\">\n        <button class=\"debug-begin\" style=\"margin-right:20px;\">\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"step-in\" disabled>\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"debug-end\" disabled style=\"margin-left:20px;\">\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n    </div>\n    <div class=\"debugger-complex\" style=\"display:none;margin-top:5px;\">\n        <button class=\"debug-restart\" style=\"margin-right:10px;\">\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n        <!-- start/restart -->\n        <button class=\"step-over\" disabled>\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"step-in\" disabled>\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"step-out\" disabled>\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n        </button>\n        <button class=\"debug-continue\" disabled style=\"margin-left:10px;\">\n            ";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n        </button>\n    </div>\n</div>\n";
},"useData":true});;