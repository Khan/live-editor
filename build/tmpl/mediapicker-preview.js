window["Handlebars"] = window["Handlebars"] || {};
window["Handlebars"]["templates"] = window["Handlebars"]["templates"] || {};
window["Handlebars"]["templates"]["mediapicker-preview"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "mediapicker__sound";
},"3":function(container,depth0,helpers,partials,data) {
    return "mediapicker__image";
},"5":function(container,depth0,helpers,partials,data) {
    return "		<audio controls class=\"mediapicker-preview-file\"></audio>\n		<div class=\"thumb-error\"></div>\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "		<img src=\"/images/spinner.gif\" class=\"thumb-throbber\" />\n		<div class=\"thumb-shell\">\n			<img class=\"thumb\" />\n			<div class=\"thumb-error\"></div>\n		</div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return "<div class=\"tooltip mediapicker-preview "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isAudio : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "\">\n	<div class=\"mediapicker-preview-content\">\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isAudio : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + "\n		<button class=\"kui-button kui-button-submit kui-button-primary\" style=\"padding: 5px; width: 100%; margin: 0 auto;\" >\n			"
    + container.escapeExpression(((helper = (helper = helpers.pickMsg || (depth0 != null ? depth0.pickMsg : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"pickMsg","hash":{},"data":data}) : helper)))
    + "\n		</button>\n	</div>\n	<div class=\"arrow\"></div>\n</div>";
},"useData":true});;