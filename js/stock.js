//# dc.js Getting Started and How-To Guide
//'use strict';

/* jshint globalstrict: true */
/* global dc,d3,crossfilter,colorbrewer */

// ### Create Chart Objects

// Create chart objects associated with the container elements identified by the css selector.
// Note: It is often a good idea to have these objects accessible at the global scope so that they can be modified or
// filtered by other page controls.


let gainOrLossChart = dc.pieChart('#gain-loss-chart');
let dayOfWeekChart = dc.rowChart('#day-of-week-chart');
let volumeChart = dc.barChart('#monthly-volume-chart');


/* MAP */
 /// params
 let color_na = d3.rgb("#d4d4d4");
 // only works if array.length-1 is between 3 and 9 (d3 color scheme)
 let quantiles = [0, 0.2, 0.4, 0.6, 0.8, 1];
 let width = 960, height = 425;

 /// main
 // init map container, projection

 let svg = d3.select("body")
             .append("svg")
             .attr("id", "map")
			 .attr("align","center")
             .attr('width', width)
             .attr('height', height);

 //$("svg").css({top: 3000, left: 450, position:'absolute'});
 
 let projection = d3.geo.mercator().translate([width/2, height/2]).scale(125);
 let path = d3.geo.path().projection(projection);  
 
 let mapLayer = svg.append('svg_layer')
                   .classed('map-layer', true);

  // init legend container
 let legendMap = svg.append("g")
          .attr("class", "legend");

          
          
 svg.append("g")
         .attr("class", "legend_title")
         .append("text");

 // init bars container
 let margin = {top: 50, right:10, bottom:50, left:30};
 let svgBarsWidth = 960 - margin.left - margin.right,
     svgBarsHeight = 200 - margin.top - margin.bottom;

 let x = d3.scale.ordinal()
             .rangeRoundBands([0, svgBarsWidth]);
             //.padding(.05);

 let y = d3.scale.linear().range([svgBarsHeight, 0]);

 let svg_bars = d3.select("#container")
     .append("svg")
       .attr("id", "bars")
	   .attr("align","center")
       .attr("width", svgBarsWidth + margin.left + margin.right)
       .attr("height", svgBarsHeight + margin.top + margin.bottom)
     .append("g")
       .attr("class", "bars")
       .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
 // load data

d3.csv('/data/data-crashes.csv', function (data) {
  

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    let ndx = crossfilter(data);
    let all = ndx.groupAll();

    // Create categorical dimension
    let commercialOrNot = ndx.dimension(function (d) {
        //return d.open > d.close ? 'Loss' : 'Gain';
        return d.ScheduledCommercial.localeCompare('true') ? 'Commercial' : 'Other'; 
    });
    // Produce counts records in the dimension
    let commercialOrNotGroup = commercialOrNot.group();

    // Counts per weekday
    let dayOfWeek = ndx.dimension(function (d) {
        let day = new Date(d.Date).getDay();
        let name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return name[day];
    });
    let dayOfWeekGroup = dayOfWeek.group();

    console.log(dayOfWeekGroup.top(2));


    // Dimension by month
    let dateDim = ndx.dimension(function (d) {
        return d3.time.month(new Date(d.Date))
    });

    // Group by total accidents within month
    let crashByDate = dateDim.group().reduceCount();

    //Dimension by StateOfOccurence
    let stateOccCrashDim = ndx.dimension(function(d) {
        return d.StateOfOccurrence;
    });
    //Group by total accidents with state of occurence
    let crashByState = stateOccCrashDim.group().reduceCount();
    let crashPerCountry = crashByState.top(Infinity);


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
            let label = d.key;
            if (all.value()) {
                label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
            }
            return label;
        }).on("renderlet",function(){
            updateMap(crashByState.top(Infinity));
        });

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
        let countries = world.features;

        let mapcountry = crashPerCountry.reduce(function(map, obj) {
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
	

    dc.renderAll();


});

document.getElementById("map").align = "center";
