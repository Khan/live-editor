this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["mediapicker-modal"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n      <li ";
  foundHelper = helpers.$first;
  stack1 = foundHelper || depth0.$first;
  stack2 = helpers['if'];
  tmp1 = self.program(2, program2, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "><a href=\"#im-class-";
  foundHelper = helpers.className;
  stack1 = foundHelper || depth0.className;
  foundHelper = helpers.slugify;
  stack2 = foundHelper || depth0.slugify;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "slugify", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.className;
  stack1 = foundHelper || depth0.className;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "className", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></li>\n    ";
  return buffer;}
function program2(depth0,data) {
  
  
  return "class=\"active\"";}

function program4(depth0,data,depth1) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n      <div class=\"tab-pane ";
  foundHelper = helpers.$first;
  stack1 = foundHelper || depth0.$first;
  stack2 = helpers['if'];
  tmp1 = self.program(5, program5, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" id=\"im-class-";
  foundHelper = helpers.className;
  stack1 = foundHelper || depth0.className;
  foundHelper = helpers.slugify;
  stack2 = foundHelper || depth0.slugify;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "slugify", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "\">\n        <div class=\"mediapicker-modal-content\">\n        <div style=\"position: relative;\">\n        ";
  foundHelper = helpers.groups;
  stack1 = foundHelper || depth0.groups;
  stack2 = helpers.each;
  tmp1 = self.programWithDepth(program7, data, depth0, depth1);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </div>\n        </div>\n\n        <div class=\"right\">\n        ";
  foundHelper = helpers.groups;
  stack1 = foundHelper || depth0.groups;
  foundHelper = helpers.hasMultipleItems;
  stack2 = foundHelper || depth0.hasMultipleItems;
  tmp1 = self.program(16, program16, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </div>\n\n        <div style=\"clear: both;\"></div>\n      </div>\n    ";
  return buffer;}
function program5(depth0,data) {
  
  
  return "active";}

function program7(depth0,data,depth1,depth2) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n            <div class=\"mediapicker-modal-group\">\n                ";
  foundHelper = helpers.groups;
  stack1 = foundHelper || depth1.groups;
  foundHelper = helpers.hasMultipleItems;
  stack2 = foundHelper || depth0.hasMultipleItems;
  tmp1 = self.program(8, program8, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  foundHelper = helpers.cite;
  stack1 = foundHelper || depth0.cite;
  stack2 = helpers['if'];
  tmp1 = self.program(10, program10, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  foundHelper = helpers.images;
  stack1 = foundHelper || depth0.images;
  stack2 = helpers.each;
  tmp1 = self.programWithDepth(program12, data, depth0, depth2);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  foundHelper = helpers.sounds;
  stack1 = foundHelper || depth0.sounds;
  stack2 = helpers.each;
  tmp1 = self.programWithDepth(program14, data, depth0, depth2);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </div>\n        ";
  return buffer;}
function program8(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n                <h3 id=\"im-group-";
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth0.groupName;
  foundHelper = helpers.slugify;
  stack2 = foundHelper || depth0.slugify;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "slugify", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth0.groupName;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "groupName", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h3>\n                ";
  return buffer;}

function program10(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                    <p><a href=\"";
  foundHelper = helpers.citeLink;
  stack1 = foundHelper || depth0.citeLink;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "citeLink", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" target=\"_blank\">";
  foundHelper = helpers.cite;
  stack1 = foundHelper || depth0.cite;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "cite", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></p>\n                ";
  return buffer;}

function program12(depth0,data,depth1,depth3) {
  
  var buffer = "", stack1;
  buffer += "\n                <div class=\"image mediapicker-modal-file\"\n                    data-update-path=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth3.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, ".........imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1);
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth1.groupName;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...groupName", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + ".png\"\n                    data-preview-path=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth3.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, ".........imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1);
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth1.groupName;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...groupName", { hash: {} }); }
  buffer += escapeExpression(stack1);
  foundHelper = helpers.thumbsDir;
  stack1 = foundHelper || depth1.thumbsDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...thumbsDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + ".png\"\n                    data-path=\"";
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth1.groupName;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...groupName", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\n                    <div class=\"thumb-shell\"><img src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth3.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, ".........imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/throbber.gif\" data-lazy-src=\"";
  foundHelper = helpers.imagesDir;
  stack1 = foundHelper || depth3.imagesDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, ".........imagesDir", { hash: {} }); }
  buffer += escapeExpression(stack1);
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth1.groupName;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...groupName", { hash: {} }); }
  buffer += escapeExpression(stack1);
  foundHelper = helpers.thumbsDir;
  stack1 = foundHelper || depth1.thumbsDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...thumbsDir", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + ".png\"/></div>\n                    <span>";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span>\n                </div>\n                ";
  return buffer;}

function program14(depth0,data,depth1,depth3) {
  
  var buffer = "", stack1;
  buffer += "\n                <div class=\"sound mediapicker-modal-file\"\n                    data-update-path='\"";
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth1.groupName;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...groupName", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\"'\n                    data-preview-path=\"";
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth1.groupName;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...groupName", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\"\n                    data-path=\"";
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth1.groupName;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...groupName", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\n                    <audio data-lazy-src=\"";
  foundHelper = helpers.soundsDir;
  stack1 = foundHelper || depth3.soundsDir;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, ".........soundsDir", { hash: {} }); }
  buffer += escapeExpression(stack1);
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth1.groupName;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...groupName", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + ".mp3\" controls/>\n                    <span>";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span>\n                </div>\n                ";
  return buffer;}

function program16(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n        <ul class=\"nav nav-pills nav-stackable\">\n        ";
  foundHelper = helpers.groups;
  stack1 = foundHelper || depth0.groups;
  foundHelper = helpers.patchedEach;
  stack2 = foundHelper || depth0.patchedEach;
  tmp1 = self.program(17, program17, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </ul>\n        ";
  return buffer;}
function program17(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n            <li ";
  foundHelper = helpers.$first;
  stack1 = foundHelper || depth0.$first;
  stack2 = helpers['if'];
  tmp1 = self.program(18, program18, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "><a href=\"#im-group-";
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth0.groupName;
  foundHelper = helpers.slugify;
  stack2 = foundHelper || depth0.slugify;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "slugify", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.groupName;
  stack1 = foundHelper || depth0.groupName;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "groupName", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></li>\n        ";
  return buffer;}
function program18(depth0,data) {
  
  
  return "class=\"active\"";}

function program20(depth0,data) {
  
  
  return "Close";}

function program22(depth0,data) {
  
  
  return "Ok";}

  buffer += "<div class=\"modal mediapicker-modal\">\n    <ul class=\"nav nav-tabs\" role=\"tablist\">\n    ";
  foundHelper = helpers.classes;
  stack1 = foundHelper || depth0.classes;
  foundHelper = helpers.patchedEach;
  stack2 = foundHelper || depth0.patchedEach;
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </ul>\n\n    <div class=\"tab-content\">\n    ";
  foundHelper = helpers.classes;
  stack1 = foundHelper || depth0.classes;
  foundHelper = helpers.patchedEach;
  stack2 = foundHelper || depth0.patchedEach;
  tmp1 = self.programWithDepth(program4, data, depth0);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </div>\n\n    <div class=\"mediapicker-modal-footer\">\n      <button type=\"button\" class=\"simple-button\" data-dismiss=\"modal\">";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(20, program20, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</button>\n      <button type=\"button\" class=\"simple-button green mediapicker-modal-submit\" data-dismiss=\"modal\">";
  foundHelper = helpers['_'];
  stack1 = foundHelper || depth0['_'];
  tmp1 = self.program(22, program22, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(foundHelper && typeof stack1 === functionType) { stack1 = stack1.call(depth0, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</button>\n    </div>\n</div>";
  return buffer;});;