this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["image-picker"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\r\n        <div class=\"media-group\">\r\n            <h3>";
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth0.groupName;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "groupName", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h3>\r\n            ";
  foundHelper = helpers.cite;
  stack1 = foundHelper || depth0.cite;
  stack2 = helpers['if'];
  tmp1 = self.program(2, program2, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n            ";
  foundHelper = helpers.images;
  stack1 = foundHelper || depth0.images;
  stack2 = helpers.each;
  tmp1 = self.programWithDepth(program4, data, depth0);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n        </div>\r\n    ";
  return buffer;}
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n                <p><a href=\"";
  foundHelper = helpers.citeLink;
  stack1 = foundHelper || depth0.citeLink;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "citeLink", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" target=\"_blank\">";
  foundHelper = helpers.cite;
  stack1 = foundHelper || depth0.cite;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "cite", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></p>\r\n            ";
  return buffer;}

function program4(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\r\n            <div class=\"image\" data-path=\"";
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth1.groupName;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...groupName", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\r\n                <img src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth1.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "throbber.gif\" data-lazy-src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth1.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1);
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth1.groupName;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...groupName", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + ".png\"/>\r\n                <span class=\"name\">";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span>\r\n            </div>\r\n            ";
  return buffer;}

  buffer += "<div class=\"current-media\"><img src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth0.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "cute/Blank.png\"/></div>\r\n<div class=\"media-groups\">\r\n    <div style=\"position: relative;\">\r\n    ";
  foundHelper = helpers.groups;
  stack1 = foundHelper || depth0.groups;
  stack2 = helpers.each;
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div>\r\n</div>\r\n<script>console.log(\"imagesDir = ";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth0.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\");</script>";
  return buffer;});;