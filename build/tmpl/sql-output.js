this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["sql-output"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<style>\ntable {\n    border-collapse: collapse;\n    border-spacing: 0;\n    empty-cells: show;\n    width: 100%;\n    margin-bottom: 20px;\n}\ntable thead {\n    background: #e0e0e0;\n    color: #000;\n    text-align: left;\n    vertical-align: bottom;\n}\nth:first-child {\n    border-radius: 6px 0 0 0;\n}\nth:last-child {\n    border-radius: 0 6px 0 0;\n}\nth:only-child{\n    border-radius: 6px 6px 0 0;\n}\ntbody {\n    border: 1px solid #dbdbdb;\n}\ntd {\n    border: 1px solid #eeeeee;\n    font-size: inherit;\n    margin: 0;\n    overflow: visible;\n    padding: .3em 1em;\n}\nth {\n    padding: .4em 1em;\n}\nh1 {\n    font-size: 1.4em;\n    clear: both;\n}\ntable.sql-schema-table + table.sql-schema-table {\n    margin-left: 10px\n}\n</style>\n<div class=\"sql-output\">\nHELLO WORLD!!!\n</div>\n";
  });;