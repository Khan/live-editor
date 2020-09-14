window["Handlebars"] = window["Handlebars"] || {};
window["Handlebars"]["templates"] = window["Handlebars"]["templates"] || {};
window["Handlebars"]["templates"]["sql-results"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <h1>"
    + container.escapeExpression(((helper = (helper = helpers.databaseMsg || (depth0 != null ? depth0.databaseMsg : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"databaseMsg","hash":{},"data":data}) : helper)))
    + "</h1>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        <table class=\"sql-schema-table\" data-table-name=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">\n        <thead>\n            <th><a href=\"javascript:void(0)\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</a> <span class=\"row-count\">"
    + alias4(((helper = (helper = helpers.rowsMsg || (depth0 != null ? depth0.rowsMsg : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"rowsMsg","hash":{},"data":data}) : helper)))
    + "</span></th>\n        </thead>\n        <tbody>\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.columns : depth0),{"name":"each","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </tbody>\n        </table>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "            <tr><td>\n            "
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.pk : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " <span class=\"column-type-wrap\"><span class=\"schema-column-type\">"
    + alias4(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data}) : helper)))
    + "</span></span>\n            </td></tr>\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "<span class=\"schema-pk\">(PK)</span>";
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <h1>"
    + container.escapeExpression(((helper = (helper = helpers.resultsMsg || (depth0 != null ? depth0.resultsMsg : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"resultsMsg","hash":{},"data":data}) : helper)))
    + "</h1>\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return "        <table class=\"sql-result-table\">\n        <thead>\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.columns : depth0),{"name":"each","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </thead>\n        <tbody>\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.values : depth0),{"name":"each","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </tbody>\n        </table>\n";
},"10":function(container,depth0,helpers,partials,data) {
    return "            <th>"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</th>\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "            <tr>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.result : depth0),{"name":"each","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "            </tr>\n";
},"13":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.isNull || (depth0 && depth0.isNull) || helpers.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? depth0.data : depth0),{"name":"isNull","hash":{},"fn":container.program(14, data, 0),"inverse":container.program(16, data, 0),"data":data})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    return "                        <td>NULL</td>\n";
},"16":function(container,depth0,helpers,partials,data) {
    var helper;

  return "                        <td>"
    + container.escapeExpression(((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"data","hash":{},"data":data}) : helper)))
    + "</td>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {});

  return "<html>\n<head>\n<style>\ntable {\n    border-collapse: collapse;\n    border-spacing: 0;\n    empty-cells: show;\n    width: 100%;\n    margin-bottom: 20px;\n}\ntable thead {\n    background: #e6e6e6;\n    color: #000;\n    text-align: left;\n    vertical-align: bottom;\n}\nth:first-child {\n    border-radius: 6px 0 0 0;\n}\nth:last-child {\n    border-radius: 0 6px 0 0;\n}\nth:only-child{\n    border-radius: 6px 6px 0 0;\n}\ntbody {\n    border: 1px solid #dbdbdb;\n}\ntd {\n    border: 1px solid #eeeeee;\n    font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, source-code-pro, monospace;\n    font-size: inherit;\n    margin: 0;\n    overflow: visible;\n    padding: .3em 1em;\n}\nth {\n    font-family: \"Proxima Nova\", sans-serif;\n    padding: .4em 1em;\n}\nth a {\n    color: #699c52;\n}\nh1 {\n    clear: both;\n    color: #aaa;\n    font-family: \"Proxima Nova\", sans-serif;\n    font-size: 1.1em;\n    font-weight: normal;\n    margin-top: 10px;\n    text-transform: uppercase;\n}\ntable.sql-schema-table {\n    float:left;\n    width: auto;\n}\ntable.sql-schema-table .column-type-wrap {\n    float: right;\n    margin-left: 20px;\n    min-width: 70px;\n}\ntable.sql-schema-table .schema-pk {\n    color: #999;\n}\ntable.sql-schema-table .schema-column-type {\n    float: left;\n    color: #999;\n}\ntable.sql-schema-table + table.sql-schema-table {\n    margin-left: 10px\n}\ntable.sql-schema-table .row-count {\n    color: #999;\n    float: right;\n    margin-left: 30px;\n    text-align: right;\n    font-weight: normal;\n}\n</style>\n</head>\n\n<body>\n<div class=\"sql-output\">\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.tables : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.tables : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.results : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.results : depth0),{"name":"each","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n</body>\n</html>\n";
},"useData":true});;