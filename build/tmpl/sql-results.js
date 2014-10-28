this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["sql-results"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "\n        <h1>Database Schema</h1>\n    ";
  }

function program3(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n        <table class=\"sql-schema-table\">\n        <thead>\n        <th>";
  if (helper = helpers.name) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.name); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " (";
  if (helper = helpers.rowCount) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.rowCount); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " row(s))</th>\n        </thead>\n        <tbody>\n        ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.columns), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </tbody>\n        </table>\n    ";
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n            <tr><td>\n            ";
  if (helper = helpers.name) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.name); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.pk), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  if (helper = helpers.type) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.type); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\n            </td></tr>\n        ";
  return buffer;
  }
function program5(depth0,data) {
  
  
  return " (PK)";
  }

function program7(depth0,data) {
  
  
  return "\n        <h1>Results</h1>\n    ";
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <table class=\"sql-result-table\">\n        <thead>\n        ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.columns), {hash:{},inverse:self.noop,fn:self.program(10, program10, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </thead>\n        <tbody>\n        ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.values), {hash:{},inverse:self.noop,fn:self.program(12, program12, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </tbody>\n        </table>\n    ";
  return buffer;
  }
function program10(depth0,data) {
  
  var buffer = "";
  buffer += "\n            <th>"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "</th>\n        ";
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <tr>\n                ";
  stack1 = helpers.each.call(depth0, depth0, {hash:{},inverse:self.noop,fn:self.program(13, program13, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </tr>\n        ";
  return buffer;
  }
function program13(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                     ";
  stack1 = helpers['if'].call(depth0, depth0, {hash:{},inverse:self.program(16, program16, data),fn:self.program(14, program14, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  return buffer;
  }
function program14(depth0,data) {
  
  var buffer = "";
  buffer += "\n                         <td>"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "</td>\n                     ";
  return buffer;
  }

function program16(depth0,data) {
  
  
  return "\n                         <td>NULL</td>\n                     ";
  }

  buffer += "<html>\n<head>\n\n<style>\ntable {\n    border-collapse: collapse;\n    border-spacing: 0;\n    empty-cells: show;\n    width: 100%;\n    margin-bottom: 20px;\n}\ntable thead {\n    background: #e0e0e0;\n    color: #000;\n    text-align: left;\n    vertical-align: bottom;\n}\nth:first-child {\n    border-radius: 6px 0 0 0;\n}\nth:last-child {\n    border-radius: 0 6px 0 0;\n}\nth:only-child{\n    border-radius: 6px 6px 0 0;\n}\ntbody {\n    border: 1px solid #dbdbdb;\n}\ntd {\n    border: 1px solid #eeeeee;\n    font-size: inherit;\n    margin: 0;\n    overflow: visible;\n    padding: .3em 1em;\n}\nth {\n    padding: .4em 1em;\n}\nh1 {\n    font-size: 1.4em;\n    clear: both;\n}\ntable.sql-schema-table {\n    float:left;\n    width: auto;\n}\ntable.sql-schema-table + table.sql-schema-table {\n    margin-left: 10px\n}\n</style>\n</head>\n\n<body>\n<div class=\"sql-output\">\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.tables), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.tables), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.tables), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.results), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n</body>\n</html>\n";
  return buffer;
  });;
