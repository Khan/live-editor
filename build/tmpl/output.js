this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["output"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div id=\"output\">\n    <canvas id=\"output-canvas\" width=\"400\" height=\"400\"></canvas>\n    <div class=\"overlay error-overlay hidden\"></div>\n</div>\n<div id=\"test-errors\" style=\"display: none;\"></div>";
  });;