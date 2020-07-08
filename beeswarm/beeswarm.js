let height = 400;
let width = 1000;
let margin = ({top: 0, right: 40, bottom: 34, left: 40});

// Data structure describing chart scales
let Scales = {
    lin: "scaleLinear",
    log: "scaleLog"
};

// Data structure describing volume of displayed data
let Count = {
    total: "total",
    perCap: "perCapita"
};

// Data structure describing legend fields value
let Legend = {
    total: "Total Deaths",
    perCap: "Per Capita Deaths"
};

let chartState = {};

chartState.measure = Count.total;
chartState.scale = Scales.lin;
chartState.legend = Legend.total;


// Colors used for circles depending on continent
let colors = d3.scaleOrdinal()
    .domain(["asia", "africa", "northAmerica", "europe", "southAmerica", "oceania"])
    .range(['#D81B60','#1976D2','#388E3C','#FBC02D','#E64A19','#455A64']);

d3.select("#asiaColor").style("color", colors("asia"));
d3.select("#africaColor").style("color", colors("africa"));
d3.select("#northAmericaColor").style("color", colors("northAmerica"));
d3.select("#southAmericaColor").style("color", colors("southAmerica"));
d3.select("#europeColor").style("color", colors("europe"));
d3.select("#oceaniaColor").style("color", colors("oceania"));

let svg = d3.select("#svganchor")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

let xScale = d3.scaleLinear()
    .range([margin.left, width - margin.right]);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")");

// Create line that connects circle and X axis
let xLine = svg.append("line")
    .attr("stroke", "rgb(96,125,139)")
    .attr("stroke-dasharray", "1,2");

// Create tooltip div and make it invisible
let tooltip = d3.select("#svganchor").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load and process data
d3.csv("https://martinheinz.github.io/charts/data/who_suicide_stats.csv").then(function (data) {

    let dataSet = data;

    // Set chart domain max value to the highest total value in data set
    xScale.domain(d3.extent(data, function (d) {
        return +d.total;
    }));

    redraw();

    // Listen to click on "total" and "per capita" buttons and trigger redraw when they are clicked
    d3.selectAll(".measure").on("click", function() {
        let thisClicked = this.value;
        chartState.measure = thisClicked;
        if (thisClicked === Count.total) {
            chartState.legend = Legend.total;
        }
        if (thisClicked === Count.perCap) {
            chartState.legend = Legend.perCap;
        }
        redraw();
    });

    // Listen to click on "scale" buttons and trigger redraw when they are clicked
    d3.selectAll(".scale").on("click", function() {
        chartState.scale = this.value;
        redraw(chartState.measure);
    });

    // Trigger filter function whenever checkbox is ticked/unticked
    d3.selectAll("input").on("change", filter);

    function redraw() {

        // Set scale type based on button clicked
        if (chartState.scale === Scales.lin) {
            xScale = d3.scaleLinear().range([ margin.left, width - margin.right ])
        }

        if (chartState.scale === Scales.log) {
            xScale = d3.scaleLog().range([ margin.left, width - margin.right ]);
        }

        xScale.domain(d3.extent(dataSet, function(d) {
            return +d[chartState.measure];
        }));

        let xAxis;
        // Set X axis based on new scale. If chart is set to "per capita" use numbers with one decimal point
        if (chartState.measure === Count.perCap) {
            xAxis = d3.axisBottom(xScale)
                .ticks(10, ".1f")
                .tickSizeOuter(0);
        }
        else {
            xAxis = d3.axisBottom(xScale)
                .ticks(10, ".1s")
                .tickSizeOuter(0);
        }

        d3.transition(svg).select(".x.axis")
            .transition()
            .duration(1000)
            .call(xAxis);

        // Create simulation with specified dataset
        let simulation = d3.forceSimulation(dataSet)
            // Apply positioning force to push nodes towards desired position along X axis
            .force("x", d3.forceX(function(d) {
                // Mapping of values from total/perCapita column of dataset to range of SVG chart (<margin.left, margin.right>)
                return xScale(+d[chartState.measure]);  // This is the desired position
            }).strength(2))  // Increase velocity
            .force("y", d3.forceY((height / 2) - margin.bottom / 2))  // // Apply positioning force to push nodes towards center along Y axis
            .force("collide", d3.forceCollide(9)) // Apply collision force with radius of 9 - keeps nodes centers 9 pixels apart
            .stop();  // Stop simulation from starting automatically

        // Manually run simulation
        for (let i = 0; i < dataSet.length; ++i) {
            simulation.tick(10);
        }

        // Create country circles
        let countriesCircles = svg.selectAll(".countries")
            .data(dataSet, function(d) { return d.country });

        countriesCircles.exit()
            .transition()
            .duration(1000)
            .attr("cx", 0)
            .attr("cy", (height / 2) - margin.bottom / 2)
            .remove();

        countriesCircles.enter()
            .append("circle")
            .attr("class", "countries")
            .attr("cx", 0)
            .attr("cy", (height / 2) - margin.bottom / 2)
            .attr("r", 6)
            .attr("fill", function(d){ return colors(d.continent)})
            .merge(countriesCircles)
            .transition()
            .duration(2000)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        // Show tooltip when hovering over circle (data for respective country)
        d3.selectAll(".countries").on("mousemove", function(d) {
            tooltip.html(`Country: <strong>${d.country}</strong><br>
                          ${chartState.legend.slice(0, chartState.legend.indexOf(","))}: 
                          <strong>${d3.format(",")(d[chartState.measure])}</strong>
                          ${chartState.legend.slice(chartState.legend.lastIndexOf(" "))}`)
                .style('top', d3.event.pageY - 12 + 'px')
                .style('left', d3.event.pageX + 25 + 'px')
                .style("opacity", 0.9);

            xLine.attr("x1", d3.select(this).attr("cx"))
                .attr("y1", d3.select(this).attr("cy"))
                .attr("y2", (height - margin.bottom))
                .attr("x2",  d3.select(this).attr("cx"))
                .attr("opacity", 1);

        }).on("mouseout", function(_) {
            tooltip.style("opacity", 0);
            xLine.attr("opacity", 0);
        });

    }

    // Filter data based on which checkboxes are ticked
    function filter() {

        function getCheckedBoxes(checkboxName) {

            let checkboxes = d3.selectAll(checkboxName).nodes();
            let checkboxesChecked = [];
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    checkboxesChecked.push(checkboxes[i].defaultValue);
                }
            }
            return checkboxesChecked.length > 0 ? checkboxesChecked : null;
        }

        let checkedBoxes = getCheckedBoxes(".continent");

        let newData = [];

        if (checkedBoxes == null) {
            dataSet = newData;
            redraw();
            return;
        }

        for (let i = 0; i < checkedBoxes.length; i++){
            let newArray = data.filter(function(d) {
                return d.continent === checkedBoxes[i];
            });
            Array.prototype.push.apply(newData, newArray);
        }

        dataSet = newData;
        redraw();
    }

}).catch(function (error) {
    if (error) throw error;
});