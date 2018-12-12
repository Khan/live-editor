window["Handlebars"] = window["Handlebars"] || {};
window["Handlebars"]["templates"] = window["Handlebars"]["templates"] || {};
window["Handlebars"]["templates"]["image-picker"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return "        <div class=\"media-group\">\n            <h3>"
    + container.escapeExpression(((helper = (helper = helpers.groupName || (depth0 != null ? depth0.groupName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"groupName","hash":{},"data":data}) : helper)))
    + "</h3>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.cite : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.images : depth0),{"name":"each","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "                <p><a href=\""
    + alias4(((helper = (helper = helpers.citeLink || (depth0 != null ? depth0.citeLink : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"citeLink","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">"
    + alias4(((helper = (helper = helpers.cite || (depth0 != null ? depth0.cite : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"cite","hash":{},"data":data}) : helper)))
    + "</a></p>\n";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "            <div class=\"image\" data-path=\""
    + alias2(alias1((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + alias2(alias1(depth0, depth0))
    + "\">\n                <img src=\""
    + alias2(alias1((depths[1] != null ? depths[1].imagesDir : depths[1]), depth0))
    + "spinner.gif\" data-lazy-src=\""
    + alias2(alias1((depths[1] != null ? depths[1].imagesDir : depths[1]), depth0))
    + alias2(alias1((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + alias2(alias1(depth0, depth0))
    + ".png\"/>\n                <span class=\"name\">"
    + alias2(alias1(depth0, depth0))
    + "</span>\n            </div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return "<div class=\"current-media\"><img src=\""
    + container.escapeExpression(((helper = (helper = helpers.imagesDir || (depth0 != null ? depth0.imagesDir : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"imagesDir","hash":{},"data":data}) : helper)))
    + "cute/Blank.png\"/></div>\n<div class=\"media-groups\">\n    <div style=\"position: relative;\">\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.groups : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n</div>";
},"useData":true,"useDepths":true});;