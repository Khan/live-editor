this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["tipbar"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  return "&times;";
  },"3":function(depth0,helpers,partials,data) {
  return "Oh noes!";
  },"5":function(depth0,helpers,partials,data) {
  return "Show me where";
  },"7":function(depth0,helpers,partials,data) {
  return "Previous error";
  },"9":function(depth0,helpers,partials,data) {
  return "Next error";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "<div class=\"tipbar\">\n    <div class=\"speech-arrow\"></div>\n    <div class=\"error-buddy\"></div>\n    \n    <div class=\"text-wrap\">\n        <button class=\"close\" type=\"button\" aria-label=\"Close\">";
  stack1 = ((helper = (helper = helpers.i18nDoNotTranslate || (depth0 != null ? depth0.i18nDoNotTranslate : depth0)) != null ? helper : helperMissing),(options={"name":"i18nDoNotTranslate","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.i18nDoNotTranslate) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "</button>\n        <div class=\"oh-no\">";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "</div>\n        <div class=\"message\"></div>\n        <div class=\"show-me\"><a href>";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(5, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "</a></div>\n        <div class=\"tipnav\">\n            <a href=\"javascript:void(0);\" class=\"prev\" title=\"";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(7, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\n                <span class=\"ui-icon ui-icon-circle-triangle-w\"></span>\n            </a>\n            <span class=\"current-pos\"></span>\n            <a href=\"javascript:void(0);\" class=\"next\" title=\"";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(9, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\">\n                <span class=\"ui-icon ui-icon-circle-triangle-e\"></span>\n            </a>\n        </div>\n    </div>\n</div>";
},"useData":true});;