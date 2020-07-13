let width = 1000, height = 2962;

let margin = ({top: 0, right: 20, bottom: 86, left: 250});

let xScale = d3.scaleLinear()
    .range([margin.left, width - margin.right]);

let xMin = 0;
let rectSize = 100;
let yScale;
let yAxis;
let bars;
let colors;
let gradient;
let colorRect;
let legend;
let minLegend;
let maxLegend;
let checked = true;
let input = "basedOnInput";
let tollFormat = d3.format(",.2r");

function performYAxisTransition() {

    svg.transition(svg).select(".y.axis")
        .transition()
        .duration(1000)
        .call(yAxis);
}

function performBarsTransition() {

    bars.transition()
        .duration(1000)
        .attr("x", function(d) { return xScale(d.start); })
        .attr("y", function(d) { return yScale(d.title); })
        .attr("width", function(d) { return xScale(d.end) - xScale(d.start);})
        .attr("height", yScale.bandwidth())
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", function(d) {
            return colors(d.start - d.end);
        });
}

function createBars(ds) {
    bars = svg.selectAll(".bars")
        .data(ds)
        .enter()
        .append("rect");
}

function createLegend() {
    gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#2f4b7c")
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "33%")
        .attr("stop-color", "#a05195")
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "75%")
        .attr("stop-color", "#f95d6a")
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#ffa600")
        .attr("stop-opacity", 1);

    colorRect = svg.append("rect")
        .attr("x", ((margin.left + (width - margin.right)) / 2) - rectSize)
        .attr("y", height - 20)
        .attr("width", rectSize * 2)
        .attr("height", 8)
        .attr("rx", 4)
        .attr("ry", 4)
        .style("fill", "url(#gradient)");

    legend = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", (margin.left + (width - margin.right)) / 2)
        .attr("y", height - 24)
        .attr("class", "legend")
        .attr("font-family", "Lato")
        .text("Color legend");

    minLegend = svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", ((margin.left + (width - margin.right)) / 2) - rectSize - 4)
        .attr("y", height - 13)
        .attr("class", "legend")
        .attr("font-family", "Lato")
        .text("Minimum");

    maxLegend = svg.append("text")
        .attr("text-anchor", "start")
        .attr("x", ((margin.left + (width - margin.right)) / 2) + rectSize + 4)
        .attr("y", height - 13)
        .attr("class", "legend")
        .attr("font-family", "Lato")
        .text("Maximum");
}

function updateYScale() {
    yScale = d3.scaleBand()
        .range([margin.top, height - margin.bottom])
        .paddingInner(0.4)
        .paddingOuter(0.4);
}

function updateYAxis() {
    yAxis = d3.axisLeft(yScale)
        .tickSizeOuter(0)
        .tickSizeInner(0);
}

updateYScale();
updateYAxis();

let xAxis = d3.axisBottom(xScale)
    .tickSizeInner(-(height - margin.top - margin.bottom))
    .ticks(15, ".0f")
    .tickSizeOuter(0)
    .tickPadding(6);

let tooltip = d3.select("#svganchor").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

let svg = d3.select("#svganchor")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

let inputFrom = d3.select("#from");
let inputTo = d3.select("#to");

let xTitle = svg.append("text")
    .attr("class", "axisTitle")
    .attr("text-anchor", "middle")
    .attr("y", (height - margin.bottom) + 34)
    .attr("x", (margin.left + (width - margin.right)) / 2)
    .attr("font-family", "Lato")
    .text("Time (Years)");

function range(start, end, increment) {
    let array = [];
    let current = start;

    increment = increment || 1;
    if (increment > 0) {
        while (current <= end) {
            array.push(current);
            current += increment;
        }
    } else {
        while (current >= end) {
            array.push(current);
            current += increment;
        }
    }
    return array;
}

d3.csv("https://martinheinz.github.io/charts/data/epidemics.csv").then(function(data) {
// d3.csv("../data/epidemics.csv").then(function(data) {

    data.forEach(function(d) {
        let span = d.span;
        if (span.endsWith("BC")) {
            d.span = 1;
            d.start = -span.split("-")[0];
            d.end = -span.replace(" BC", "").split("-")[1];
            return;
        }

        if (span.includes("-")) {
            d.start = +span.split("-")[0];
            d.end = +span.split("-")[1];
            if (!span.includes("present")) {
                let start = +span.split("-")[0];
                let end = +span.split("-")[1];
                d.span = end - start;
            }
            else {
                d.span = 2020 - +span.split("-")[0];
                d.end = 2020;
            }
        }
        else {
            d.start = +span;
            d.end = (+span)+1;
            d.span = 1;
        }

    });

    data.forEach(function(d) {
      d.toll = +d.toll;
    });

    let dataSet = data;

    let colorMin = d3.max(dataSet, function(d) {
        return d.start - d.end;
    });
    let colorMax = d3.min(dataSet, function(d) {
        return d.start - d.end;
    });
    let colorRange = [-90, -75, -45, -25, -8, -5, 0]; // range(colorMin, colorMax, (colorMax/6)).map(x => Math.round(x)).reverse();
    console.log(colorRange);
    colors = d3.scaleLinear()
        .domain(colorRange)
        .range(["#ffa600", "#ff7c43", "#f95d6a", "#d45087", "#a05195", "#003f5c"]);

    createBars(dataSet);

    let gX = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);

    let gY = svg.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis);

    gX.lower();

    createLegend();

    d3.selectAll(".sort").on("click", function() {
        let thisClicked = this.value;
        drawSort(thisClicked);
    });

    d3.selectAll(".since").on("click", function() {
        input = this.value;
        redraw();
    });

    d3.select("#checkbox").on("change", function () {
        checked = !checked;
        redraw()
    });

    createListeners();

    function createListeners() {
        d3.selectAll(".y.axis text").on("mousemove", function(d) {
            let filteredData = dataSet.filter(function(e) { return e.title === d})[0];
            tooltip.html(`Name: <strong>${filteredData.title}</strong><br>
                 Location: <strong>${filteredData.location}</strong>
                `)
                .style('top', d3.event.pageY - 12 + 'px')
                .style('left', d3.event.pageX + 15 + 'px')
                .style("opacity", 1);
        }).on("mouseout", function() {
            tooltip.style("opacity", 0)
        });

        bars.on("mousemove", function(d) {
            bars.attr("opacity", 0.25);
            d3.select(this).attr("opacity", 1);
            tooltip.html(`Name: <strong>${d.title}</strong><br>
                 Time Span: <strong>${d.span} ${+d.span === 1 ? "Year" : "Years"}</strong><br>
                 Death Toll: <strong>${d.toll === 0 ? "Unknown" : tollFormat(d.toll)}</strong>
                `)
                .style('top', d3.event.pageY + 16 + 'px')
                .style('left', d3.event.pageX - 30 + 'px')
                .style("opacity", 1);
        }).on("mouseout", function() {
            tooltip.style("opacity", 0);
            bars.attr("opacity", 1);
        });

    }

    redraw();

    function drawSort(sort) {

        if(sort === "sortTotalDeathToll") {
            dataSet.sort(function(a, b) {
                return d3.descending(a.toll , b.toll);
            });
        }
        else if(sort === "sortStartYear") {
            dataSet.sort(function(a, b) {
                return d3.ascending(a.start , b.start);
            });
        }
        else if(sort === "sortTotalSpan") {
            dataSet.sort(function(a, b) {
                return d3.descending(a.span , b.span);
            });
        }

        yScale.domain(dataSet.map(function(d) { return d.title; }));

        bars.transition()
            .duration(1000)
            .attr("y", function(d) { return yScale(d.title); });

        performYAxisTransition();
    }

    function redraw() {

        dataSet = data;
        let filteredDataset = [];
        if (checked) {
            for (const d of data) {
                if (d.toll !== 0) {
                    filteredDataset.push(d)
                }
            }
        }
        else {
            filteredDataset = data;
        }

        if (input === "all") {
            if (checked) {
                dataSet = filteredDataset;
            }
            xScale.domain([
                d3.min(dataSet, function(d) { return d.start; }),
                d3.max(dataSet, function(d) { return d.end; })
            ]);
        }
        else if (input === "basedOnInput") {
            xMin = +inputFrom.property("value");
            dataSet = [];
            for (const d of filteredDataset) {
                if (d.start < xMin && d.end > xMin) {
                    d.start = xMin;
                }
                if (d.end > xMin) {
                    dataSet.push(d)
                }
            }
            xScale.domain([
                xMin,
                +inputTo.property("value"),
                ]);
        }
        console.log(dataSet);

        bars.data([]).exit().remove();  // Remove all rows

        createBars(dataSet);  // Add all currently selected rows back in

        height = Math.ceil(dataSet.length*12);

        updateYScale();
        updateYAxis();

        yScale.domain(dataSet.map(function(d) { return d.title; }));

        performBarsTransition();

        svg.transition(svg).select(".x.axis")
            .transition()
            .duration(1000)
            .call(xAxis);

        performYAxisTransition();

        createListeners();

        svg.attr("height", height);
        d3.select("#svganchor")
          .attr("height", height);

        d3.axisBottom(xScale)
          .tickSizeInner(-(height - margin.top - margin.bottom));

        xTitle.attr("y", (height - margin.bottom) + 34);

        gX.attr("transform", "translate(0," + (height - margin.bottom) + ")");

        legend.attr("x", (margin.left + (width - margin.right)) / 2)
              .attr("y", height - 24);


        minLegend.attr("y", height - 13);

        maxLegend.attr("x", ((margin.left + (width - margin.right))/2) + rectSize + 4)
                 .attr("y", height - 13);

        colorRect.attr("x", ((margin.left + (width - margin.right)) / 2) - rectSize)
                 .attr("y", height - 20);
    }

}).catch(function (error) {
    if (error) throw error;
});
