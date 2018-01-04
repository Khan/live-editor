this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["mediapicker-modal"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var stack1, helper, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function", buffer = "      <li ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.$first : depth0), {"name":"if","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "><a href=\"#im-class-"
    + escapeExpression(((helpers.slugify || (depth0 && depth0.slugify) || helperMissing).call(depth0, (depth0 != null ? depth0.className : depth0), {"name":"slugify","hash":{},"data":data})))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.className || (depth0 != null ? depth0.className : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"className","hash":{},"data":data}) : helper)))
    + "</a></li>\n";
},"2":function(depth0,helpers,partials,data) {
  return "class=\"active\"";
  },"4":function(depth0,helpers,partials,data,depths) {
  var stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "      <div class=\"tab-pane ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.$first : depth0), {"name":"if","hash":{},"fn":this.program(5, data, depths),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\" id=\"im-class-"
    + escapeExpression(((helpers.slugify || (depth0 && depth0.slugify) || helperMissing).call(depth0, (depth0 != null ? depth0.className : depth0), {"name":"slugify","hash":{},"data":data})))
    + "\">\n        <div class=\"mediapicker-modal-content\">\n        <div style=\"position: relative;\">\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.groups : depth0), {"name":"each","hash":{},"fn":this.program(7, data, depths),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "        </div>\n        </div>\n\n        <div class=\"right\">\n";
  stack1 = ((helpers.hasMultipleItems || (depth0 && depth0.hasMultipleItems) || helperMissing).call(depth0, (depth0 != null ? depth0.groups : depth0), {"name":"hasMultipleItems","hash":{},"fn":this.program(16, data, depths),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "        </div>\n\n        <div style=\"clear: both;\"></div>\n      </div>\n";
},"5":function(depth0,helpers,partials,data) {
  return "active";
  },"7":function(depth0,helpers,partials,data,depths) {
  var stack1, helperMissing=helpers.helperMissing, buffer = "            <div class=\"mediapicker-modal-group\">\n";
  stack1 = ((helpers.hasMultipleItems || (depth0 && depth0.hasMultipleItems) || helperMissing).call(depth0, (depths[1] != null ? depths[1].groups : depths[1]), {"name":"hasMultipleItems","hash":{},"fn":this.program(8, data, depths),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.cite : depth0), {"name":"if","hash":{},"fn":this.program(10, data, depths),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.images : depth0), {"name":"each","hash":{},"fn":this.program(12, data, depths),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.sounds : depth0), {"name":"each","hash":{},"fn":this.program(14, data, depths),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "            </div>\n";
},"8":function(depth0,helpers,partials,data) {
  var helper, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function";
  return "                <h3 id=\"im-group-"
    + escapeExpression(((helpers.slugify || (depth0 && depth0.slugify) || helperMissing).call(depth0, (depth0 != null ? depth0.groupName : depth0), {"name":"slugify","hash":{},"data":data})))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.groupName || (depth0 != null ? depth0.groupName : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"groupName","hash":{},"data":data}) : helper)))
    + "</h3>\n";
},"10":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "                    <p><a href=\""
    + escapeExpression(((helper = (helper = helpers.citeLink || (depth0 != null ? depth0.citeLink : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"citeLink","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">"
    + escapeExpression(((helper = (helper = helpers.cite || (depth0 != null ? depth0.cite : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"cite","hash":{},"data":data}) : helper)))
    + "</a></p>\n";
},"12":function(depth0,helpers,partials,data,depths) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "                <div class=\"image mediapicker-modal-file\"\n                    data-update-path=\""
    + escapeExpression(lambda((depths[3] != null ? depths[3].imagesDir : depths[3]), depth0))
    + escapeExpression(lambda((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + escapeExpression(lambda(depth0, depth0))
    + ".png\"\n                    data-preview-path=\""
    + escapeExpression(lambda((depths[3] != null ? depths[3].imagesDir : depths[3]), depth0))
    + escapeExpression(lambda((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + escapeExpression(lambda((depths[1] != null ? depths[1].thumbsDir : depths[1]), depth0))
    + "/"
    + escapeExpression(lambda(depth0, depth0))
    + ".png\"\n                    data-path=\""
    + escapeExpression(lambda((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + escapeExpression(lambda(depth0, depth0))
    + "\">\n                    <div class=\"thumb-shell\"><img src=\""
    + escapeExpression(lambda((depths[3] != null ? depths[3].imagesDir : depths[3]), depth0))
    + "spinner.gif\" data-lazy-src=\""
    + escapeExpression(lambda((depths[3] != null ? depths[3].imagesDir : depths[3]), depth0))
    + escapeExpression(lambda((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + escapeExpression(lambda((depths[1] != null ? depths[1].thumbsDir : depths[1]), depth0))
    + "/"
    + escapeExpression(lambda(depth0, depth0))
    + ".png\"/></div>\n                    <span>"
    + escapeExpression(lambda(depth0, depth0))
    + "</span>\n                </div>\n";
},"14":function(depth0,helpers,partials,data,depths) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "                <div class=\"sound mediapicker-modal-file\"\n                    data-update-path='\""
    + escapeExpression(lambda((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + escapeExpression(lambda(depth0, depth0))
    + "\"'\n                    data-preview-path=\""
    + escapeExpression(lambda((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + escapeExpression(lambda(depth0, depth0))
    + "\"\n                    data-path=\""
    + escapeExpression(lambda((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + escapeExpression(lambda(depth0, depth0))
    + "\">\n                    <audio data-lazy-src=\""
    + escapeExpression(lambda((depths[3] != null ? depths[3].soundsDir : depths[3]), depth0))
    + escapeExpression(lambda((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + escapeExpression(lambda(depth0, depth0))
    + ".mp3\" controls/>\n                    <span>"
    + escapeExpression(lambda(depth0, depth0))
    + "</span>\n                </div>\n";
},"16":function(depth0,helpers,partials,data) {
  var stack1, helperMissing=helpers.helperMissing, buffer = "        <ul class=\"nav nav-pills nav-stackable\">\n";
  stack1 = ((helpers.patchedEach || (depth0 && depth0.patchedEach) || helperMissing).call(depth0, (depth0 != null ? depth0.groups : depth0), {"name":"patchedEach","hash":{},"fn":this.program(17, data),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "        </ul>\n";
},"17":function(depth0,helpers,partials,data) {
  var stack1, helper, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function", buffer = "            <li ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.$first : depth0), {"name":"if","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "><a href=\"#im-group-"
    + escapeExpression(((helpers.slugify || (depth0 && depth0.slugify) || helperMissing).call(depth0, (depth0 != null ? depth0.groupName : depth0), {"name":"slugify","hash":{},"data":data})))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.groupName || (depth0 != null ? depth0.groupName : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"groupName","hash":{},"data":data}) : helper)))
    + "</a></li>\n";
},"19":function(depth0,helpers,partials,data) {
  return "Close";
  },"21":function(depth0,helpers,partials,data) {
  return "Ok";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data,depths) {
  var stack1, helper, options, helperMissing=helpers.helperMissing, functionType="function", blockHelperMissing=helpers.blockHelperMissing, buffer = "<div class=\"modal mediapicker-modal\">\n    <ul class=\"nav nav-tabs\" role=\"tablist\">\n";
  stack1 = ((helpers.patchedEach || (depth0 && depth0.patchedEach) || helperMissing).call(depth0, (depth0 != null ? depth0.classes : depth0), {"name":"patchedEach","hash":{},"fn":this.program(1, data, depths),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "    </ul>\n\n    <div class=\"tab-content\">\n";
  stack1 = ((helpers.patchedEach || (depth0 && depth0.patchedEach) || helperMissing).call(depth0, (depth0 != null ? depth0.classes : depth0), {"name":"patchedEach","hash":{},"fn":this.program(4, data, depths),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "    </div>\n\n    <div class=\"mediapicker-modal-footer\">\n      <button type=\"button\" class=\"simple-button\" data-dismiss=\"modal\">";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(19, data, depths),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  buffer += "</button>\n      <button type=\"button\" class=\"simple-button green mediapicker-modal-submit\" data-dismiss=\"modal\">";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(21, data, depths),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</button>\n    </div>\n</div>";
},"useData":true,"useDepths":true});;