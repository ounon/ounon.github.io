
//let fatalityChart = dc.barChart("#fatality-chart");
let dateChart = dc.barChart("#date-chart");
let phaseChart = dc.barChart("#phase-chart");
let fatalityChart = dc.pieChart("#fatality-chart");

d3.csv("/data/data-crashes.csv", function(flights) {

    flights.forEach(function(d) {
        d.Fatalities = +d.Fatalities;
        d.Engines = +d.Engines;
        d.Date = new Date(d.Date);
    });

    //console.log(flights[0]);
    //console.log(new Date('2008-01-02T00:00:00.000Z'));

    /* Creating crossfilter dimensions and groups */

    let flight = crossfilter(flights);
    let all = flight.groupAll;

    let date = flight.dimension(function(d) {
        return d.Date;
    });
    let dates = date.group();

    let fatality = flight.dimension(function(d) {
        return d.Fatalities;
    });
    let fatalities = fatality.group(); 

    let phase = flight.dimension(function(d) {
        return d.FlightPhase;
    });
    let phases = phase.group();

    /* BAR CHART VERSION */

    /*fatalityChart
        .width(1000)
        .height(500)
        .margins({top: 10, right: 50, bottom: 30, left: 100})
        .dimension(fatality)
        .group(fatalities)
        //.elasticY(true)
        .gap(1)
        //.round(dc.round.floor)
        //.alwaysUseRounding(true)
        .x(d3.scale.linear()
            .domain([0, 50]))   // More than 200?
            //.rangeRound([0, 10 * 20]))
        //.renderHorizontalGridLines(true)
        .y(d3.scale.linear()
            .domain([0, 7500]));

        fatalityChart.xAxis().ticks(5);
        fatalityChart.yAxis().ticks(10);*/
        
    dateChart
        .width(500)    
        .height(400)
        .dimension(date)
        .group(dates)
        .gap(1)
        .linearColors(["#893D68"])
        .colorDomain([-500, 500])
        .x(d3.time.scale()
            .domain([new Date('2008-01-02T00:00:00.000Z'), new Date('2017-11-07T00:00:00.000Z')])
            .rangeRound([0, 10 * 50]))
        .y(d3.scale.linear()
            .domain([0, 10]));

        dateChart.xAxis().ticks(5);
        dateChart.yAxis().ticks(2); 

    phaseChart  
        .width(1000)
        .height(400)
        .margins({top: 10, right: 50, bottom: 30, left: 100})
        .dimension(phase)
        .group(phases)
        .gap(1)
        .brushOn(true)
        .x(d3.scale.ordinal()
            .domain(flights.map(function(d) {return d.FlightPhase})))
            //.domain(["Standing", "Initial Climb", "Take-off", "En route", "Approach", "Taxi", "Manoeuvring", "Landing", "Unknown"]))
            //.domain(d3.extent(flights, function(d){return d.FlightPhase;})))
            //.rangeRound([0, 10 * 15]))
        .xUnits(dc.units.ordinal);

        phaseChart.xAxis().ticks(5);

    /* PIE CHART VERSION */

    fatalityChart
        .width(500)
        .height(500)
        .radius(200)
        .slicesCap(6)
        .drawPaths(true)  
        .externalRadiusPadding(50)
        .externalLabels(40)
        .group(fatalities)
        .dimension(fatality)
        .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        .label(function (d) {
            var label = d.key;
            return label;
        })
        .renderLabel(true)
        .transitionDuration(500)
        .legend(dc.legend())
        .minAngleForLabel(0)
    //fatalityChart  
        .on('pretransition', function(chart) {
            chart.selectAll('.dc-legend-item text')
                    .text('')
                .append('tspan')
                    .text(function(d) {return d.name})  // Legend labels
                .append('tspan')
                    .attr('x', 100)
                    .attr('text-anchor', 'end')
                    .text(function(d) { return d.data; });
        });

    dc.renderAll();
   
});


