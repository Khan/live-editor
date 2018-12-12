window["Handlebars"] = window["Handlebars"] || {};
window["Handlebars"]["templates"] = window["Handlebars"]["templates"] || {};
window["Handlebars"]["templates"]["mediapicker-modal"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3=container.escapeExpression;

  return "      <li "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.$first : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "><a href=\"#im-class-"
    + alias3((helpers.slugify || (depth0 && depth0.slugify) || alias2).call(alias1,(depth0 != null ? depth0.className : depth0),{"name":"slugify","hash":{},"data":data}))
    + "\">"
    + alias3(((helper = (helper = helpers.className || (depth0 != null ? depth0.className : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"className","hash":{},"data":data}) : helper)))
    + "</a></li>\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "class=\"active\"";
},"4":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "      <div class=\"tab-pane "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.$first : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" id=\"im-class-"
    + container.escapeExpression((helpers.slugify || (depth0 && depth0.slugify) || alias2).call(alias1,(depth0 != null ? depth0.className : depth0),{"name":"slugify","hash":{},"data":data}))
    + "\">\n        <div class=\"mediapicker-modal-content\">\n        <div style=\"position: relative;\">\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.groups : depth0),{"name":"each","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\n        </div>\n\n        <div class=\"right\">\n"
    + ((stack1 = (helpers.hasMultipleItems || (depth0 && depth0.hasMultipleItems) || alias2).call(alias1,(depth0 != null ? depth0.groups : depth0),{"name":"hasMultipleItems","hash":{},"fn":container.program(16, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\n\n        <div style=\"clear: both;\"></div>\n      </div>\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "active";
},"7":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return "            <div class=\"mediapicker-modal-group\">\n"
    + ((stack1 = (helpers.hasMultipleItems || (depth0 && depth0.hasMultipleItems) || helpers.helperMissing).call(alias1,(depths[1] != null ? depths[1].groups : depths[1]),{"name":"hasMultipleItems","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.cite : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.images : depth0),{"name":"each","hash":{},"fn":container.program(12, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.sounds : depth0),{"name":"each","hash":{},"fn":container.program(14, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "            </div>\n";
},"8":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3=container.escapeExpression;

  return "                <h3 id=\"im-group-"
    + alias3((helpers.slugify || (depth0 && depth0.slugify) || alias2).call(alias1,(depth0 != null ? depth0.groupName : depth0),{"name":"slugify","hash":{},"data":data}))
    + "\">"
    + alias3(((helper = (helper = helpers.groupName || (depth0 != null ? depth0.groupName : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"groupName","hash":{},"data":data}) : helper)))
    + "</h3>\n";
},"10":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "                    <p><a href=\""
    + alias4(((helper = (helper = helpers.citeLink || (depth0 != null ? depth0.citeLink : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"citeLink","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\">"
    + alias4(((helper = (helper = helpers.cite || (depth0 != null ? depth0.cite : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"cite","hash":{},"data":data}) : helper)))
    + "</a></p>\n";
},"12":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "                <div class=\"image mediapicker-modal-file\"\n                    data-update-path=\""
    + alias2(alias1((depths[3] != null ? depths[3].imagesDir : depths[3]), depth0))
    + alias2(alias1((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + alias2(alias1(depth0, depth0))
    + ".png\"\n                    data-preview-path=\""
    + alias2(alias1((depths[3] != null ? depths[3].imagesDir : depths[3]), depth0))
    + alias2(alias1((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + alias2(alias1((depths[1] != null ? depths[1].thumbsDir : depths[1]), depth0))
    + "/"
    + alias2(alias1(depth0, depth0))
    + ".png\"\n                    data-path=\""
    + alias2(alias1((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + alias2(alias1(depth0, depth0))
    + "\">\n                    <div class=\"thumb-shell\"><img src=\""
    + alias2(alias1((depths[3] != null ? depths[3].imagesDir : depths[3]), depth0))
    + "spinner.gif\" data-lazy-src=\""
    + alias2(alias1((depths[3] != null ? depths[3].imagesDir : depths[3]), depth0))
    + alias2(alias1((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + alias2(alias1((depths[1] != null ? depths[1].thumbsDir : depths[1]), depth0))
    + "/"
    + alias2(alias1(depth0, depth0))
    + ".png\"/></div>\n                    <span>"
    + alias2(alias1(depth0, depth0))
    + "</span>\n                </div>\n";
},"14":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "                <div class=\"sound mediapicker-modal-file\"\n                    data-update-path='\""
    + alias2(alias1((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + alias2(alias1(depth0, depth0))
    + "\"'\n                    data-preview-path=\""
    + alias2(alias1((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + alias2(alias1(depth0, depth0))
    + "\"\n                    data-path=\""
    + alias2(alias1((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + alias2(alias1(depth0, depth0))
    + "\">\n                    <audio data-lazy-src=\""
    + alias2(alias1((depths[3] != null ? depths[3].soundsDir : depths[3]), depth0))
    + alias2(alias1((depths[1] != null ? depths[1].groupName : depths[1]), depth0))
    + "/"
    + alias2(alias1(depth0, depth0))
    + ".mp3\" controls/>\n                    <span>"
    + alias2(alias1(depth0, depth0))
    + "</span>\n                </div>\n";
},"16":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "        <ul class=\"nav nav-pills nav-stackable\">\n"
    + ((stack1 = (helpers.patchedEach || (depth0 && depth0.patchedEach) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.groups : depth0),{"name":"patchedEach","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </ul>\n";
},"17":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3=container.escapeExpression;

  return "            <li "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.$first : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "><a href=\"#im-group-"
    + alias3((helpers.slugify || (depth0 && depth0.slugify) || alias2).call(alias1,(depth0 != null ? depth0.groupName : depth0),{"name":"slugify","hash":{},"data":data}))
    + "\">"
    + alias3(((helper = (helper = helpers.groupName || (depth0 != null ? depth0.groupName : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"groupName","hash":{},"data":data}) : helper)))
    + "</a></li>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"modal mediapicker-modal\">\n    <ul class=\"nav nav-tabs\" role=\"tablist\">\n"
    + ((stack1 = (helpers.patchedEach || (depth0 && depth0.patchedEach) || alias2).call(alias1,(depth0 != null ? depth0.classes : depth0),{"name":"patchedEach","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </ul>\n\n    <div class=\"tab-content\">\n"
    + ((stack1 = (helpers.patchedEach || (depth0 && depth0.patchedEach) || alias2).call(alias1,(depth0 != null ? depth0.classes : depth0),{"name":"patchedEach","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n\n    <div class=\"mediapicker-modal-footer\">\n      <button type=\"button\" class=\"simple-button\" data-dismiss=\"modal\">"
    + alias4(((helper = (helper = helpers.closeMsg || (depth0 != null ? depth0.closeMsg : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"closeMsg","hash":{},"data":data}) : helper)))
    + "</button>\n      <button type=\"button\" class=\"simple-button green mediapicker-modal-submit\" data-dismiss=\"modal\">"
    + alias4(((helper = (helper = helpers.okMsg || (depth0 != null ? depth0.okMsg : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"okMsg","hash":{},"data":data}) : helper)))
    + "</button>\n    </div>\n</div>";
},"useData":true,"useDepths":true});;