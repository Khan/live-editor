this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["imagemodalpreview"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, tmp1, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  
  return "Pick Image:";}

  buffer += "<div class=\"tooltip imagemodal-preview\">\n	<div class=\"content\">\n		<img src=\"/images/throbber.gif\" class=\"thumb-throbber\" />\n		<div class=\"thumb-shell\"><img class=\"thumb\" /><div class=\"thumb-error\"></div></div> \n		<button class=\"kui-button kui-button-submit kui-button-primary\" style=\"padding: 5px; width: 100%; margin: 0 auto;\" >\n			";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n		</button> \n	</div>\n	<div class=\"arrow\"></div>\n</div>";
  return buffer;});;