//# dc.js Getting Started and How-To Guide
//'use strict';

/* jshint globalstrict: true */
/* global dc,d3,crossfilter,colorbrewer */

// ### Create Chart Objects

// Create chart objects associated with the container elements identified by the css selector.
// Note: It is often a good idea to have these objects accessible at the global scope so that they can be modified or
// filtered by other page controls.
//var fluctuationChart = dc.barChart('#fluctuation-chart');
//var quarterChart = dc.pieChart('#quarter-chart');
//var yearlyBubbleChart = dc.bubbleChart('#yearly-bubble-chart');
/* var nasdaqCount = dc.dataCount('.dc-data-count');
var nasdaqTable = dc.dataTable('.dc-data-table'); */

var gainOrLossChart = dc.pieChart('#gain-loss-chart');
var dayOfWeekChart = dc.rowChart('#day-of-week-chart');
//var moveChart = dc.lineChart('#monthly-move-chart');
var volumeChart = dc.barChart('#monthly-volume-chart');


/* MAP */
 /// params
 var color_na = d3.rgb("#d4d4d4");
 // only works if array.length-1 is between 3 and 9 (d3 color scheme)
 var quantiles = [0, 0.2, 0.4, 0.6, 0.8, 1];
 var width = 960, height = 425;

 /// main
 // init map container, projection

 var svg = d3.select("body")
             .append("svg")
             .attr("id", "map")
             .attr('width', width)
             .attr('height', height);

 var projection = d3.geo.mercator().translate([width/2, height/2]).scale(125);
 var path = d3.geo.path().projection(projection);  
 
 var mapLayer = svg.append('svg_layer')
                   .classed('map-layer', true);

  // init legend container
 var legendMap = svg.append("g")
          .attr("class", "legend");

          
          
 svg.append("g")
         .attr("class", "legend_title")
         .append("text");

 // init bars container
 var margin = {top: 50, right:10, bottom:50, left:30};
 var svgBarsWidth = 960 - margin.left - margin.right,
     svgBarsHeight = 200 - margin.top - margin.bottom;

 var x = d3.scale.ordinal()
             .rangeRoundBands([0, svgBarsWidth]);
             //.padding(.05);

 var y = d3.scale.linear().range([svgBarsHeight, 0]);

 var svg_bars = d3.select("body")
     .append("svg")
       .attr("id", "bars")
       .attr("width", svgBarsWidth + margin.left + margin.right)
       .attr("height", svgBarsHeight + margin.top + margin.bottom)
     .append("g")
       .attr("class", "bars")
       .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
 // load data


// ### Anchor Div for Charts
/*
// A div anchor that can be identified by id
    <div id='your-chart'></div>
// Title or anything you want to add above the chart
    <div id='chart'><span>Days by Gain or Loss</span></div>
// ##### .turnOnControls()

// If a link with css class `reset` is present then the chart
// will automatically hide/show it based on whether there is a filter
// set on the chart (e.g. slice selection for pie chart and brush
// selection for bar chart). Enable this with `chart.turnOnControls(true)`

// dc.js >=2.1 uses `visibility: hidden` to hide/show controls without
// disrupting the layout. To return the old `display: none` behavior,
// set `chart.controlsUseVisibility(false)` and use that style instead.
    <div id='chart'>
       <a class='reset'
          href='javascript:myChart.filterAll();dc.redrawAll();'
          style='visibility: hidden;'>reset</a>
    </div>
// dc.js will also automatically inject the current filter value into
// any html element with its css class set to `filter`
    <div id='chart'>
        <span class='reset' style='visibility: hidden;'>
          Current filter: <span class='filter'></span>
        </span>
    </div>
*/

//### Load your data

//Data can be loaded through regular means with your
//favorite javascript library
//
//```javascript
//d3.csv('data.csv', function(data) {...});*/
//d3.json('data.json', function(data) {...});
//jQuery.getJson('data.json', function(data){...});
//```
d3.csv('/data/data-crashes.csv', function (data) {
  

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    // Create categorical dimension
    var commercialOrNot = ndx.dimension(function (d) {
        //return d.open > d.close ? 'Loss' : 'Gain';
        return d.ScheduledCommercial.localeCompare('true') ? 'Commercial' : 'Other'; 
    });
    // Produce counts records in the dimension
    var commercialOrNotGroup = commercialOrNot.group();

    // Counts per weekday
    var dayOfWeek = ndx.dimension(function (d) {
        var day = new Date(d.Date).getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return name[day];
    });
    var dayOfWeekGroup = dayOfWeek.group();

    console.log(dayOfWeekGroup.top(2));


    // Dimension by month
    var dateDim = ndx.dimension(function (d) {
        return d3.time.month(new Date(d.Date))
    });

    // Group by total accidents within month
    var crashByDate = dateDim.group().reduceCount();

    //Dimension by StateOfOccurence
    var stateOccCrashDim = ndx.dimension(function(d) {
        return d.StateOfOccurrence;
    });
    //Group by total accidents with state of occurence
    var crashByState = stateOccCrashDim.group().reduceCount();
    var crashPerCountry = crashByState.top(Infinity);


    //### Define Chart Attributes
    // Define chart attributes using fluent methods. See the
    // [dc.js API Reference](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md) for more information
    //

    // #### Pie/Donut Charts

    // Create a pie chart and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Pie Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#pie-chart)


    gainOrLossChart /* dc.pieChart('#gain-loss-chart', 'chartGroup') */
    // (_optional_) define chart width, `default = 200`
        .width(180)
    // (optional) define chart height, `default = 200`
        .height(180)
    // Define pie radius
        .radius(80)
    // Set dimension
        .dimension(commercialOrNot)
    // Set group
        .group(commercialOrNotGroup)
    // (_optional_) by default pie chart will use `group.key` as its label but you can overwrite it with a closure.
        .label(function (d) {
            if (gainOrLossChart.hasFilter() && !gainOrLossChart.hasFilter(d.key)) {
                return d.key + '(0%)';
            }
            var label = d.key;
            if (all.value()) {
                label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
            }
            return label;
        }).on("renderlet",function(){
            updateMap(crashByState.top(Infinity));
        });
        /*
        onClick = function(chart){
            dc.redrawAll();
            //dc.renderAll();
};*/
    /*
        // (_optional_) whether chart should render labels, `default = true`
        .renderLabel(true)
        // (_optional_) if inner radius is used then a donut chart will be generated instead of pie chart
        .innerRadius(40)
        // (_optional_) define chart transition duration, `default = 350`
        .transitionDuration(500)
        // (_optional_) define color array for slices
        .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        // (_optional_) define color domain to match your data domain if you want to bind data or color
        .colorDomain([-1750, 1644])
        // (_optional_) define color value accessor
        .colorAccessor(function(d, i){return d.value;})
        */
/*
        var original = gainOrLossChart.defaults.global.legend.onClick;
        gainOrLossChart.defaults.global.legend.onClick = function(e, legendItem) {
            updateMap(crashByState.top(Infinity));
     
          original.call(this, e, legendItem);
        };*/
/*
    quarterChart // dc.pieChart('#quarter-chart', 'chartGroup')
        .width(180)
        .height(180)
        .radius(80)
        .innerRadius(30)
        .dimension(quarter)
        .group(quarterGroup);
*/
    //#### Row Chart

    // Create a row chart and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Row Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#row-chart)
    dayOfWeekChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
        .width(180)
        .height(180)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .group(dayOfWeekGroup)
        .dimension(dayOfWeek)
        // Assign colors to each value in the x scale domain
        //.ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        .label(function (d) {
            return d.key;
        }).on("renderlet",function(){
            updateMap(crashByState.top(Infinity));
        })
        // Title sets the row text
        .title(function (d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(4);

    //#### Range Chart

    // Since this bar chart is specified as "range chart" for the area chart, its brush extent
    // will always match the zoom of the area chart.


    
    volumeChart
        .width(990) // dc.barChart('#monthly-volume-chart', 'chartGroup');
        .height(40)
        .margins({top: 0, right: 50, bottom: 20, left: 40})
        .dimension(dateDim)
        .group(crashByDate)
        .on("renderlet",function(){
            updateMap(crashByState.top(Infinity));
        })
        .centerBar(true)
        .gap(1)
        .x(d3.time.scale().domain([new Date(2008, 1, 2), new Date(2017, 11, 7)]))
        .round(d3.time.month.round)
        .alwaysUseRounding(true)
        .xUnits(d3.time.month).brush().extent([ d3.time.month(new Date("May 2009")),  d3.time.month(new Date("May 2010"))]);
        //.context.select('.brush').call(brush);
        //.transitionDuration(500)
        //.xAxis().tickFormat();


   
    //#### MAP

      // load map data and render it
    d3.json("/data/world.geojson", function(error, world) {
        var countries = world.features;

        var mapcountry = crashPerCountry.reduce(function(map, obj) {
           map[obj.key] = obj.value;
           return map;
        }, {});

        let color = calcColorScale(mapcountry);

        // Draw each countries as a path
        svg.selectAll('path')
            .data(countries)
            .enter().append('path')
            .attr("class", "country")
            .attr('d', path)
            .attr("id", function(d,i) { return d.id; })
            .attr("title", function(d,i) { return d.properties.name; })
            .call(fillMap, color, mapcountry)
            .append("title")
            .call(setPathTitle, mapcountry);

        // render legend
        renderLegend(color, mapcountry);
        // render bar 
        //renderBars(color, mapcountry);
    });
        //#### Data Count

    // Create a data count widget and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Data Count Widget](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#data-count-widget)
    //
    //```html
    //<div class='dc-data-count'>
    //  <span class='filter-count'></span>
    //  selected out of <span class='total-count'></span> records.
    //</div>
    //```
/*
    nasdaqCount // dc.dataCount('.dc-data-count', 'chartGroup'); 
        .dimension(ndx)
        .group(all);*/
        // (_optional_) `.html` sets different html when some records or all records are selected.
        // `.html` replaces everything in the anchor with the html given using the following function.
        // `%filter-count` and `%total-count` are replaced with the values obtained.
        /*
        .html({
            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        });*/

    //#### Data Table

    // Create a data table widget and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Data Table Widget](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#data-table-widget)
    //
    // You can statically define the headers like in
    //
    // ```html
    //    <!-- anchor div for data table -->
    //    <div id='data-table'>
    //       <!-- create a custom header -->
    //       <div class='header'>
    //           <span>Date</span>
    //           <span>Open</span>
    //           <span>Close</span>
    //           <span>Change</span>
    //           <span>Volume</span>
    //       </div>
    //       <!-- data rows will filled in here -->
    //    </div>
    // ```
    // or do it programmatically using `.columns()`.
/*
    nasdaqTable // dc.dataTable('.dc-data-table', 'chartGroup')
        .dimension(dateDimension)
        // Data table does not use crossfilter group but rather a closure
        // as a grouping function
        .group(function (d) {
            var format = d3.format('02d');
            return d.Date.getFullYear();// + '/' + format((d.dd.getMonth() + 1));
        })
        // (_optional_) max number of records to be shown, `default = 25`
        .size(10)
        // There are several ways to specify the columns; see the data-table documentation.
        // This code demonstrates generating the column header automatically based on the columns.
        .columns([
            // Use the `d.date` field; capitalized automatically
            'date',
            // Use `d.open`, `d.close`
            'open',
            'close',
            {
                // Specify a custom format for column 'Change' by using a label with a function.
                label: 'Change',
                format: function (d) {
                    return numberFormat(d.close - d.open);
                }
            },
            // Use `d.volume`
            'volume'
        ])

        // (_optional_) sort using the given field, `default = function(d){return d;}`
        .sortBy(function (d) {
            return d.dd;
        })
        // (_optional_) sort order, `default = d3.ascending`
        .order(d3.ascending)
        // (_optional_) custom renderlet to post-process chart using [D3](http://d3js.org)
        .on('renderlet', function (table) {
            table.selectAll('.dc-table-group').classed('info', true);
        });
*/
    /*
    //#### Geo Choropleth Chart

    //Create a choropleth chart and use the given css selector as anchor. You can also specify
    //an optional chart group for this chart to be scoped within. When a chart belongs
    //to a specific group then any interaction with such chart will only trigger redraw
    //on other charts within the same chart group.
    // <br>API: [Geo Chroropleth Chart][choro]
    // [choro]: https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#geo-choropleth-chart
    dc.geoChoroplethChart('#us-chart')
         // (_optional_) define chart width, default 200
        .width(990)
        // (optional) define chart height, default 200
        .height(500)
        // (optional) define chart transition duration, default 1000
        .transitionDuration(1000)
        // set crossfilter dimension, dimension key should match the name retrieved in geojson layer
        .dimension(states)
        // set crossfilter group
        .group(stateRaisedSum)
        // (_optional_) define color function or array for bubbles
        .colors(['#ccc', '#E2F2FF','#C4E4FF','#9ED2FF','#81C5FF','#6BBAFF','#51AEFF','#36A2FF','#1E96FF','#0089FF',
            '#0061B5'])
        // (_optional_) define color domain to match your data domain if you want to bind data or color
        .colorDomain([-5, 200])
        // (_optional_) define color value accessor
        .colorAccessor(function(d, i){return d.value;})
        // Project the given geojson. You can call this function multiple times with different geojson feed to generate
        // multiple layers of geo paths.
        //
        // * 1st param - geojson data
        // * 2nd param - name of the layer which will be used to generate css class
        // * 3rd param - (_optional_) a function used to generate key for geo path, it should match the dimension key
        // in order for the coloring to work properly
        .overlayGeoJson(statesJson.features, 'state', function(d) {
            return d.properties.name;
        })
        // (_optional_) closure to generate title for path, `default = d.key + ': ' + d.value`
        .title(function(d) {
            return 'State: ' + d.key + '\nTotal Amount Raised: ' + numberFormat(d.value ? d.value : 0) + 'M';
        });

        //#### Bubble Overlay Chart

        // Create a overlay bubble chart and use the given css selector as anchor. You can also specify
        // an optional chart group for this chart to be scoped within. When a chart belongs
        // to a specific group then any interaction with the chart will only trigger redraw
        // on charts within the same chart group.
        // <br>API: [Bubble Overlay Chart][bubble]
        // [bubble]: https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#bubble-overlay-chart
        dc.bubbleOverlay('#bubble-overlay', 'chartGroup')
            // The bubble overlay chart does not generate its own svg element but rather reuses an existing
            // svg to generate its overlay layer
            .svg(d3.select('#bubble-overlay svg'))
            // (_optional_) define chart width, `default = 200`
            .width(990)
            // (_optional_) define chart height, `default = 200`
            .height(500)
            // (_optional_) define chart transition duration, `default = 1000`
            .transitionDuration(1000)
            // Set crossfilter dimension, dimension key should match the name retrieved in geo json layer
            .dimension(states)
            // Set crossfilter group
            .group(stateRaisedSum)
            // Closure used to retrieve x value from multi-value group
            .keyAccessor(function(p) {return p.value.absGain;})
            // Closure used to retrieve y value from multi-value group
            .valueAccessor(function(p) {return p.value.percentageGain;})
            // (_optional_) define color function or array for bubbles
            .colors(['#ccc', '#E2F2FF','#C4E4FF','#9ED2FF','#81C5FF','#6BBAFF','#51AEFF','#36A2FF','#1E96FF','#0089FF',
                '#0061B5'])
            // (_optional_) define color domain to match your data domain if you want to bind data or color
            .colorDomain([-5, 200])
            // (_optional_) define color value accessor
            .colorAccessor(function(d, i){return d.value;})
            // Closure used to retrieve radius value from multi-value group
            .radiusValueAccessor(function(p) {return p.value.fluctuationPercentage;})
            // set radius scale
            .r(d3.scale.linear().domain([0, 3]))
            // (_optional_) whether chart should render labels, `default = true`
            .renderLabel(true)
            // (_optional_) closure to generate label per bubble, `default = group.key`
            .label(function(p) {return p.key.getFullYear();})
            // (_optional_) whether chart should render titles, `default = false`
            .renderTitle(true)
            // (_optional_) closure to generate title per bubble, `default = d.key + ': ' + d.value`
            .title(function(d) {
                return 'Title: ' + d.key;
            })
            // add data point to its layer dimension key that matches point name: it will be used to
            // generate a bubble. Multiple data points can be added to the bubble overlay to generate
            // multiple bubbles.
            .point('California', 100, 120)
            .point('Colorado', 300, 120)
            // (_optional_) setting debug flag to true will generate a transparent layer on top of
            // bubble overlay which can be used to obtain relative `x`,`y` coordinate for specific
            // data point, `default = false`
            .debug(true);
    */

    //#### Rendering

    //simply call `.renderAll()` to render all charts on the page
    dc.renderAll();
    /*
    // Or you can render charts belonging to a specific chart group
    dc.renderAll('group');
    // Once rendered you can call `.redrawAll()` to update charts incrementally when the data
    // changes, without re-rendering everything
    dc.redrawAll();
    // Or you can choose to redraw only those charts associated with a specific chart group
    dc.redrawAll('group');
    */

});
