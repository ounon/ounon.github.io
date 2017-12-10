
//let occurrenceChart = dc.barChart("#occurrence-chart");
let occurrenceChart = dc.bubbleChart("#occurrence-chart");
let registryChart = dc.barChart("#registry-chart");

d3.csv("/data/data-crashes.csv", function(flights) {

    flights.forEach(function(d) {
        d.StateOfOccurrence = d.StateOfOccurrence;
        d.StateOfRegistry = d.StateOfRegistry;
    });
    
    /* Creating crossfilter dimensions and groups */

    let flight = crossfilter(flights);
    let all = flight.groupAll;

    let occurrence = flight.dimension(function(d) {
        //console.log(d.Registration);
        return d.StateOfOccurrence;
    });
    let occurrences = occurrence.group();

    let registry = flight.dimension(function(d) {
        return d.StateOfRegistry;
    })
    let registries = registry.group();

    /* BAR CHART VERSION OF OCCURRENCE CHART */

    /*occurrenceChart  
        .width(1000)
        .height(400)
        .margins({top: 10, right: 50, bottom: 30, left: 100})
        .dimension(occurrence)
        .group(occurrences)
        .gap(1)
        .brushOn(true)
        .linearColors(["#65A321"])
        .x(d3.scale.ordinal()
            .domain(flights.map(function(d) {return d.StateOfOccurrence})))
            //.domain(["Standing", "Initial Climb", "Take-off", "En route", "Approach", "Taxi", "Manoeuvring", "Landing", "Unknown", "Tow", "Post-impact"]))
            //.domain(d3.extent(flights, function(d){return d.FlightPhase;})))
            //.rangeRound([0, 10 * 15]))
        .xUnits(dc.units.ordinal)

        occurrenceChart.xAxis().ticks(5);*/

    occurrenceChart
        .width(1000)
        .height(400)
        .margins({top: 10, right: 50, bottom: 30, left: 100})
        .dimension(occurrence)
        .group(occurrences)
        .colorAccessor(function (d) {
            return d.value;
        })
        .keyAccessor(function (d) {
            return d.key;
        })
        .valueAccessor(function (p) {
            return p.value;
        })
        .radiusValueAccessor(function (p) {
            return p.value;
        })
        .maxBubbleRelativeSize(0.3)
        //.x(d3.scale.linear().domain([-2500, 2500]))
        .x(d3.scale.ordinal()
            //.domain(flights.map(function(d) {return d.StateOfOccurrence})))
            .domain(d3.extent(flights, function(d){return d.FlightPhase;})))
            .xUnits(dc.units.ordinal)
        .y(d3.scale.linear().domain([-100, 100]))
        .r(d3.scale.linear().domain([0, 5000]))

        .elasticY(true)
        .elasticX(true)

        .yAxisPadding(100)
        .xAxisPadding(500)

        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)

        .renderLabel(true)
        .label(function (p) {
            return p.key;
        });

    /* BAR CHART VERSION OF REGISTRY CHART */

    registryChart  
        .width(1000)
        .height(400)
        .margins({top: 10, right: 50, bottom: 30, left: 100})
        .dimension(registry)
        .group(registries)
        .gap(1)
        .brushOn(true)
        .linearColors(["#65A321"])
        .x(d3.scale.ordinal()
            .domain(flights.map(function(d) {return d.StateOfRegistry})))
            //.domain(["Standing", "Initial Climb", "Take-off", "En route", "Approach", "Taxi", "Manoeuvring", "Landing", "Unknown", "Tow", "Post-impact"]))
            //.domain(d3.extent(flights, function(d){return d.FlightPhase;})))
            //.rangeRound([0, 10 * 15]))
        .xUnits(dc.units.ordinal)

        occurrenceChart.xAxis().ticks(5);

    dc.renderAll();
   
});


