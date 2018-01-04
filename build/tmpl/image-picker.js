this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["image-picker"] = Handlebars.template({"1":function(depth0,helpers,partials,data,depths) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "        <div class=\"media-group\">\n            <h3>"
    + escapeExpression(((helper = (helper = helpers.groupName || (depth0 != null ? depth0.groupName : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"groupName","hash":{},"data":data}) : helper)))
    + "</h3>\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.cite : depth0), {"name":"if","hash":{},"fn":this.program(2, data, depths),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.images : depth0), {"name":"each","hash":{},"fn":this.program(4, data, depths),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "        </div>\n";
},"2":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "                <p><a href=\""
    + escapeExpression(((helper = (helper = helpers.citeLink || (depth0 != null ? depth0.citeLink : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"citeLink","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">"
    + escapeExpression(((helper = (helper = helpers.cite || (depth0 != null ? depth0.cite : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"cite","hash":{},"data":data}) : helper)))
    + "</a></p>\n";
},"4":function(depth0,helpers,partials,data,depths) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "            <div class=\"image\" data-path=\""
    + escapeExpression(lambda((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + escapeExpression(lambda(depth0, depth0))
    + "\">\n                <img src=\""
    + escapeExpression(lambda((depths[1] != null ? depths[1].imagesDir : depths[1]), depth0))
    + "spinner.gif\" data-lazy-src=\""
    + escapeExpression(lambda((depths[1] != null ? depths[1].imagesDir : depths[1]), depth0))
    + escapeExpression(lambda((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + escapeExpression(lambda(depth0, depth0))
    + ".png\"/>\n                <span class=\"name\">"
    + escapeExpression(lambda(depth0, depth0))
    + "</span>\n            </div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data,depths) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\"current-media\"><img src=\""
    + escapeExpression(((helper = (helper = helpers.imagesDir || (depth0 != null ? depth0.imagesDir : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"imagesDir","hash":{},"data":data}) : helper)))
    + "cute/Blank.png\"/></div>\n<div class=\"media-groups\">\n    <div style=\"position: relative;\">\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.groups : depth0), {"name":"each","hash":{},"fn":this.program(1, data, depths),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </div>\n</div>";
},"useData":true,"useDepths":true});;