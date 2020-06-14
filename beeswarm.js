let height = 300;
let width = 1000;
let margin = ({top: 0, right: 40, bottom: 34, left: 40});

let xScale = d3.scaleLinear()
    .range([margin.left, width - margin.right]);

let xAxis = d3.axisBottom(xScale)
    .ticks(10, ".0s")
    .tickSizeOuter(0);

var colors = d3.scaleOrdinal()
    .domain(["asia", "africa", "northAmerica", "europe", "southAmerica", "oceania"])
    .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33']);

d3.select("#africaColor").style("color", colors("africa"));
d3.select("#namericaColor").style("color", colors("northAmerica"));
d3.select("#samericaColor").style("color", colors("southAmerica"));
d3.select("#asiaColor").style("color", colors("asia"));
d3.select("#europeColor").style("color", colors("europe"));
d3.select("#oceaniaColor").style("color", colors("oceania"));

let formatNumber = d3.format(",");

let tooltip = d3.select("#svganchor").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

let svg = d3.select("#svganchor")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

let xLine = svg.append("line")
    .attr("stroke", "gray")
    .attr("stroke-dasharray", "1,2");

let chartState = {};

chartState.variable = "total";
chartState.scale = "scaleLinear";
chartState.legend = "Total Deaths";

d3.csv("http://localhost:8000/data/who_suicide_stats.csv").then(function (data) {

    let dataSet = data;

    xScale.domain(d3.extent(data, function (d) {
        return +d.total;
    }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis);

    let legend = svg.append("text")
        .attr("class", "legend");

    redraw(chartState.variable);

    d3.selectAll(".button1").on("click", function(){
        let thisClicked = this.value;
        chartState.variable = thisClicked;
        if (thisClicked === "total") {
            chartState.legend = "Total Deaths";
        }
        if (thisClicked === "perCapita"){
            chartState.legend = "Per Capita Deaths";
        }
        redraw(chartState.variable);
    });

    d3.selectAll(".button2").on("click", function(){
        chartState.scale = this.value;
        redraw(chartState.variable);
    });


    d3.selectAll("input").on("change", filter);

    function redraw(variable){

        if (chartState.scale === "scaleLinear") {
            xScale = d3.scaleLinear().range([ margin.left, width - margin.right ])
        }

        if (chartState.scale === "scaleLog") {
            xScale = d3.scaleLog().range([ margin.left, width - margin.right ]);
        }

        xScale.domain(d3.extent(dataSet, function(d) {
            return +d[variable];
        }));

        let xAxis = d3.axisBottom(xScale)
            .ticks(10, ".0s")
            .tickSizeOuter(0);

        d3.transition(svg).select(".x.axis")
            .transition()
            .duration(1000)
            .call(xAxis);

        let simulation = d3.forceSimulation(dataSet)
            .force("x", d3.forceX(function(d) {
                return xScale(+d[variable]);
            }).strength(2))
            .force("y", d3.forceY((height / 2) - margin.bottom / 2))
            .force("collide", d3.forceCollide(4))
            .stop();

        for (let i = 0; i < dataSet.length; ++i) {
            simulation.tick();
        }

        let countriesCircles = svg.selectAll(".countries")
            .data(dataSet, function(d) { return d.country});

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
            .attr("r", 3)
            .attr("fill", function(d){ return colors(d.continent)})
            .merge(countriesCircles)
            .transition()
            .duration(2000)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        legend.text(chartState.legend);

        d3.selectAll(".countries").on("mousemove", function(d) {
            tooltip.html("Country: <strong>" + d.country + "</strong><br>"
                + chartState.legend.slice(0, chartState.legend.indexOf(",")) + ": <strong>" + formatNumber(d[variable]) + "</strong>" + chartState.legend.slice(chartState.legend.lastIndexOf(" ")))
                .style('top', d3.event.pageY - 12 + 'px')
                .style('left', d3.event.pageX + 25 + 'px')
                .style("opacity", 0.9);

            xLine.attr("x1", d3.select(this).attr("cx"))
                .attr("y1", d3.select(this).attr("cy"))
                .attr("y2", (height - margin.bottom))
                .attr("x2",  d3.select(this).attr("cx"))
                .attr("opacity", 1);

        }).on("mouseout", function(d) {
            tooltip.style("opacity", 0);
            xLine.attr("opacity", 0);
        });

        //end of redraw
    }

    function filter(){

        function getCheckedBoxes(checkboxName) {
            let checkboxes = document.getElementsByName(checkboxName);
            let checkboxesChecked = [];
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    checkboxesChecked.push(checkboxes[i].defaultValue);
                }
            }
            return checkboxesChecked.length > 0 ? checkboxesChecked : null;
        }

        let checkedBoxes = getCheckedBoxes("continent");

        let newData = [];

        if (checkedBoxes == null){
            dataSet = newData;
            redraw();
            return;
        }

        for (let i = 0; i < checkedBoxes.length; i++){
            let newArray = data.filter(function(d){
                return d.continent == checkedBoxes[i];
            });
            Array.prototype.push.apply(newData, newArray);
        }

        dataSet = newData;
        redraw(chartState.variable);
    }

}).catch(function (error) {
    if (error) throw error;
});