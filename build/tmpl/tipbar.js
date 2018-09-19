this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["tipbar"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "&times;";
},"3":function(container,depth0,helpers,partials,data) {
    return "Previous error";
},"5":function(container,depth0,helpers,partials,data) {
    return "Next error";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, alias5=container.escapeExpression, buffer = 
  "<div class=\"tipbar\">\n    <div class=\"speech-arrow\"></div>\n    <div class=\"error-buddy\"></div>\n\n    <div class=\"text-wrap\">\n        <button class=\"close\" type=\"button\" aria-label=\"Close\">";
  stack1 = ((helper = (helper = helpers.i18nDoNotTranslate || (depth0 != null ? depth0.i18nDoNotTranslate : depth0)) != null ? helper : alias2),(options={"name":"i18nDoNotTranslate","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.i18nDoNotTranslate) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "</button>\n        <div class=\"oh-no\">"
    + alias5(((helper = (helper = helpers.ohNoesMsg || (depth0 != null ? depth0.ohNoesMsg : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ohNoesMsg","hash":{},"data":data}) : helper)))
    + "</div>\n        <div class=\"message\"></div>\n        <div class=\"show-me\"><a href>"
    + alias5(((helper = (helper = helpers.showMeMsg || (depth0 != null ? depth0.showMeMsg : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"showMeMsg","hash":{},"data":data}) : helper)))
    + "</a></div>\n        <div class=\"tipnav\">\n            <a href=\"javascript:void(0);\" class=\"prev\" title=\"";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\n                <span class=\"ui-icon ui-icon-circle-triangle-w\"></span>\n            </a>\n            <span class=\"current-pos\"></span>\n            <a href=\"javascript:void(0);\" class=\"next\" title=\"";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : alias2),(options={"name":"_","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers._) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\">\n                <span class=\"ui-icon ui-icon-circle-triangle-e\"></span>\n            </a>\n        </div>\n    </div>\n</div>";
},"useData":true});;