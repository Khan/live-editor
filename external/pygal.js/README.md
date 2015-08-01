pygal.js
========

An in the browser implementation of the [pygal](http://pygal.org) python
charting library driven by [Skulpt](http://www.skulpt.org/) and
[Highcharts](http://www.highcharts.com/).

## What is Skulpt?

> Python. Client side.
> 
> Skulpt is an entirely in-browser implementation of Python.
> 
> No preprocessing, plugins, or server-side support required, just write Python and reload.

## What is pygal?

> pygal 1.4.2 is a dynamic SVG charting library.

## What is highcharts?

> Highcharts is a charting library written in pure JavaScript, offering an easy way of adding interactive charts to your web site or web application. Highcharts currently supports line, spline, area, areaspline, column, bar, pie, scatter, angular gauges, arearange, areasplinerange, columnrange, bubble, box plot, error bars, funnel, waterfall and polar chart types.

## All together now

Pygal.js brings together the above projects to provide beatiful charts
created using python syntax all rendered in the browser with no server
necessary. Cool.  See it in action on [trinket.io](https://trinket.io/charts).

## Getting Started

Install JS dependencies with ```bower install```

Creat a basic html page

```html
<!-- @TODO: replace with example markup... -->
```

Add the pygal.js specific Skulpt configuration options
```js
// the domOutput is called whenever the chart is rendered
// and is expected to append the provided html to the DOM
// and return the resulting jquery element
Sk.domOutput = function(html) {
  return $('body').append(html).children().last();
};

// tell Skulpt where to find pygal.js and its dependencies
Sk.externalLibraries = {
  pygal : {
    path : '/path/to/pygal.js/__init__.js',
    dependencies : [
      '/path/to/highcharts.js',
      '/path/to/highcharts-more.js'
    ]
  }
};

// optionally configure the size (in pixels) at which the charts should render
Sk.availableWidth = 600;
Sk.availableHeight = 400;
```

Point our browser to your html page and have fun!

## Opportunities for contribution

* Integration with a free and open-source javascript charting library rather
  than the current dependency, [highcharts](http://www.highcharts.com/)
* adding new chart types, see [pygal](http://pygal.org/chart_types/)
* adding/improving chart customization, see
  [here](http://pygal.org/basic_customizations/) and
  [here](http://pygal.org/other_customizations/)
* general bug fixes, optimizations, suggestions and whatever else you want to do

## Pygal.js in the wild

[trinket.io](https://trinket.io/charts)



