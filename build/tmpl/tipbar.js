window["Handlebars"] = window["Handlebars"] || {};
window["Handlebars"]["templates"] = window["Handlebars"]["templates"] || {};
window["Handlebars"]["templates"]["tipbar"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "&times;";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, buffer = 
  "<div class=\"tipbar\">\n    <div class=\"speech-arrow\"></div>\n    <div class=\"error-buddy\"></div>\n\n    <div class=\"text-wrap\">\n        <button class=\"close\" type=\"button\" aria-label=\"Close\">";
  stack1 = ((helper = (helper = helpers.i18nDoNotTranslate || (depth0 != null ? depth0.i18nDoNotTranslate : depth0)) != null ? helper : alias2),(options={"name":"i18nDoNotTranslate","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.i18nDoNotTranslate) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</button>\n        <div class=\"oh-no\">"
    + alias4(((helper = (helper = helpers.ohNoesMsg || (depth0 != null ? depth0.ohNoesMsg : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ohNoesMsg","hash":{},"data":data}) : helper)))
    + "</div>\n        <div class=\"message\"></div>\n        <div class=\"show-me\"><a href>"
    + alias4(((helper = (helper = helpers.showMeMsg || (depth0 != null ? depth0.showMeMsg : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"showMeMsg","hash":{},"data":data}) : helper)))
    + "</a></div>\n        <div class=\"tipnav\">\n            <a href=\"javascript:void(0);\" class=\"prev\" title=\""
    + alias4(((helper = (helper = helpers.prevMsg || (depth0 != null ? depth0.prevMsg : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"prevMsg","hash":{},"data":data}) : helper)))
    + "\">\n                <span class=\"ui-icon ui-icon-circle-triangle-w\"></span>\n            </a>\n            <span class=\"current-pos\"></span>\n            <a href=\"javascript:void(0);\" class=\"next\" title=\""
    + alias4(((helper = (helper = helpers.nextMsg || (depth0 != null ? depth0.nextMsg : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"nextMsg","hash":{},"data":data}) : helper)))
    + "\">\n                <span class=\"ui-icon ui-icon-circle-triangle-e\"></span>\n            </a>\n        </div>\n    </div>\n</div>";
},"useData":true});;