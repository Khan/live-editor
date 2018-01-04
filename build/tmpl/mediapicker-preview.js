this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["mediapicker-preview"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  return "mediapicker__sound";
  },"3":function(depth0,helpers,partials,data) {
  return "mediapicker__image";
  },"5":function(depth0,helpers,partials,data) {
  return "		<audio controls class=\"mediapicker-preview-file\"></audio>\n		<div class=\"thumb-error\"></div>\n";
  },"7":function(depth0,helpers,partials,data) {
  return "		<img src=\"/images/spinner.gif\" class=\"thumb-throbber\" />\n		<div class=\"thumb-shell\">\n			<img class=\"thumb\" />\n			<div class=\"thumb-error\"></div>\n		</div> \n";
  },"9":function(depth0,helpers,partials,data) {
  return "Pick file:";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "<div class=\"tooltip mediapicker-preview ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isAudio : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.program(3, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\n	<div class=\"mediapicker-preview-content\">\n		\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.isAudio : depth0), {"name":"if","hash":{},"fn":this.program(5, data),"inverse":this.program(7, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n		<button class=\"kui-button kui-button-submit kui-button-primary\" style=\"padding: 5px; width: 100%; margin: 0 auto;\" >\n			";
  stack1 = ((helper = (helper = helpers._ || (depth0 != null ? depth0._ : depth0)) != null ? helper : helperMissing),(options={"name":"_","hash":{},"fn":this.program(9, data),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n		</button> \n	</div>\n	<div class=\"arrow\"></div>\n</div>";
},"useData":true});;