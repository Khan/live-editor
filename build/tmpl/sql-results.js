this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["sql-results"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  return "        <h1>Database Schema</h1>\n";
  },"3":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "        <table class=\"sql-schema-table\" data-table-name=\""
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\">\n        <thead>\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.hasSingleRow : depth0), {"name":"if","hash":{},"fn":this.program(4, data),"inverse":this.program(6, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "        </thead>\n        <tbody>\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.columns : depth0), {"name":"each","hash":{},"fn":this.program(8, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "        </tbody>\n        </table>\n";
},"4":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "            <th><a href=\"javascript:void(0)\">"
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "</a> <span class=\"row-count\">"
    + escapeExpression(((helper = (helper = helpers.rowCount || (depth0 != null ? depth0.rowCount : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"rowCount","hash":{},"data":data}) : helper)))
    + " row</span></th>\n";
},"6":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "            <th><a href=\"javascript:void(0)\">"
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "</a> <span class=\"row-count\">"
    + escapeExpression(((helper = (helper = helpers.rowCount || (depth0 != null ? depth0.rowCount : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"rowCount","hash":{},"data":data}) : helper)))
    + " rows</span></th>\n";
},"8":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "            <tr><td>\n            "
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + " ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.pk : depth0), {"name":"if","hash":{},"fn":this.program(9, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + " <span class=\"column-type-wrap\"><span class=\"schema-column-type\">"
    + escapeExpression(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"type","hash":{},"data":data}) : helper)))
    + "</span></span>\n            </td></tr>\n";
},"9":function(depth0,helpers,partials,data) {
  return "<span class=\"schema-pk\">(PK)</span>";
  },"11":function(depth0,helpers,partials,data) {
  return "        <h1>Results</h1>\n";
  },"13":function(depth0,helpers,partials,data) {
  var stack1, buffer = "        <table class=\"sql-result-table\">\n        <thead>\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.columns : depth0), {"name":"each","hash":{},"fn":this.program(14, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "        </thead>\n        <tbody>\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.values : depth0), {"name":"each","hash":{},"fn":this.program(16, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "        </tbody>\n        </table>\n";
},"14":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "            <th>"
    + escapeExpression(lambda(depth0, depth0))
    + "</th>\n";
},"16":function(depth0,helpers,partials,data) {
  var stack1, buffer = "            <tr>\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.result : depth0), {"name":"each","hash":{},"fn":this.program(17, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "            </tr>\n";
},"17":function(depth0,helpers,partials,data) {
  var stack1, helperMissing=helpers.helperMissing, buffer = "";
  stack1 = ((helpers.isNull || (depth0 && depth0.isNull) || helperMissing).call(depth0, (depth0 != null ? depth0.data : depth0), {"name":"isNull","hash":{},"fn":this.program(18, data),"inverse":this.program(20, data),"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"18":function(depth0,helpers,partials,data) {
  return "                        <td>NULL</td>\n";
  },"20":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "                        <td>"
    + escapeExpression(((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"data","hash":{},"data":data}) : helper)))
    + "</td>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "<html>\n<head>\n<style>\ntable {\n    border-collapse: collapse;\n    border-spacing: 0;\n    empty-cells: show;\n    width: 100%;\n    margin-bottom: 20px;\n}\ntable thead {\n    background: #e6e6e6;\n    color: #000;\n    text-align: left;\n    vertical-align: bottom;\n}\nth:first-child {\n    border-radius: 6px 0 0 0;\n}\nth:last-child {\n    border-radius: 0 6px 0 0;\n}\nth:only-child{\n    border-radius: 6px 6px 0 0;\n}\ntbody {\n    border: 1px solid #dbdbdb;\n}\ntd {\n    border: 1px solid #eeeeee;\n    font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, source-code-pro, monospace;\n    font-size: inherit;\n    margin: 0;\n    overflow: visible;\n    padding: .3em 1em;\n}\nth {\n    font-family: \"Proxima Nova\", sans-serif;\n    padding: .4em 1em;\n}\nth a {\n    color: #699c52;\n}\nh1 {\n    clear: both;\n    color: #aaa;\n    font-family: \"Proxima Nova\", sans-serif;\n    font-size: 1.1em;\n    font-weight: normal;\n    margin-top: 10px;\n    text-transform: uppercase;\n}\ntable.sql-schema-table {\n    float:left;\n    width: auto;\n}\ntable.sql-schema-table .column-type-wrap {\n    float: right;\n    margin-left: 20px;\n    min-width: 70px;\n}\ntable.sql-schema-table .schema-pk {\n    color: #999;\n}\ntable.sql-schema-table .schema-column-type {\n    float: left;\n    color: #999;\n}\ntable.sql-schema-table + table.sql-schema-table {\n    margin-left: 10px\n}\ntable.sql-schema-table .row-count {\n    color: #999;\n    float: right;\n    margin-left: 30px;\n    text-align: right;\n    font-weight: normal;\n}\n</style>\n</head>\n\n<body>\n<div class=\"sql-output\">\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.tables : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.tables : depth0), {"name":"each","hash":{},"fn":this.program(3, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.results : depth0), {"name":"if","hash":{},"fn":this.program(11, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.results : depth0), {"name":"each","hash":{},"fn":this.program(13, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\n</body>\n</html>\n";
},"useData":true});;