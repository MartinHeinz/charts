let width = 1000, height = 3000;

let margin = ({top: 26, right: 20, bottom: 86, left: 100});

let xScale = d3.scaleLinear()
    .range([margin.left, width - margin.right]);

let xMin = 0;

let yScale = d3.scaleBand()
    .range([margin.top, height - margin.bottom])
    .paddingInner(0.4)
    .paddingOuter(0.4);

let xAxis = d3.axisBottom(xScale)
    .tickSizeInner(-(height - margin.top - margin.bottom))
    .ticks(15, ".0f")
    .tickSizeOuter(0)
    .tickPadding(6);

let yAxis = d3.axisLeft(yScale)
    .tickSizeOuter(0)
    .tickSizeInner(0);

let formatNumber = d3.format(".2f");

let tt = d3.select("#svganchor").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

let svg = d3.select("#svganchor")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

let inputFrom = d3.select("#from");
let inputTo = d3.select("#to");

let chartTitle = svg.append("text")
    .attr("class", "chartTitle")
    .attr("text-anchor", "middle")
    .attr("y", 16)
    .attr("x", (margin.left + (width - margin.right))/2)
    .text("Epidemics");

let xTitle = svg.append("text")
    .attr("class", "axisTitle")
    .attr("text-anchor", "middle")
    .attr("y", (height - margin.bottom) + 34)
    .attr("x", (margin.left + (width - margin.right))/2)
    .text("Time (Years)");

d3.csv("../data/epidemics.csv").then(function(data) {

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
            d.end = +span;
            d.span = 1;
        }

    });

    data.forEach(function(d) {
      d.toll = +d.toll;
    });

    let dataSet = data;

    xScale.domain([
        d3.min(dataSet, function(d) { return d.start }),
        d3.max(dataSet, function(d) { return d.end })
        ]);

    yScale.domain(dataSet.map(function(d) { return d.title; })); // TODO too many lines

    let colors = d3.scaleLinear()
        .domain([d3.max(dataSet, function(d) {
            return d.start - d.end;
        }), d3.min(dataSet, function(d) {
            return d.start - d.end;
        })])
        .range(["#2c7bb6", "#d7191c"])
        .interpolate(d3.interpolateHcl);

    let bars = svg.selectAll(".myBars")
        .data(dataSet)
        .enter()
        .append("rect");

    bars.attr("x", function(d) { return xScale(d.start);})
        .attr("y", function(d) { return yScale(d.title);})
        .attr("width", function(d) {
            return xScale(d.end) - xScale(d.start);})
        .attr("height", yScale.bandwidth())
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", function(d) {
            return colors(d.start - d.end);
        });

    let gX = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis);

    let gY = svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxis);

    d3.selectAll(".tick line")
        .filter(function (d) { return d === 0;  })
        .remove();

    gX.lower();

    d3.selectAll(".y.axis text").on("mousemove", function(d) {
        let filteredData = dataSet.filter(function(e) { return e.title === d})[0];
        tt.html(`Name: <strong>${filteredData.title}</strong><br>
                 Location: <strong>${filteredData.location}</strong>
                `)
            .style('top', d3.event.pageY - 12 + 'px')
            .style('left', d3.event.pageX + 15 + 'px')
            .style("opacity", 1);
    }).on("mouseout", function() {
        tt.style("opacity", 0)
    });

    let gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#2c7bb6")
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#d7191c")
        .attr("stop-opacity", 1);

    let rectSize = 100;

    let colorRect = svg.append("rect")
        .attr("x", ((margin.left + (width - margin.right)) / 2) - rectSize)
        .attr("y", height - 20)
        .attr("width", rectSize * 2)
        .attr("height", 8)
        .attr("rx", 4)
        .attr("ry", 4)
        .style("fill", "url(#gradient)");

    let legend = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", (margin.left + (width - margin.right)) / 2)
        .attr("y", height - 24)
        .attr("class", "legend")
        .text("color legend");

    let minLegend = svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", ((margin.left + (width - margin.right))/2) - rectSize - 4)
        .attr("y", height - 13)
        .attr("class", "legend")
        .text("Minimum");

    let maxLegend = svg.append("text")
        .attr("text-anchor", "start")
        .attr("x", ((margin.left + (width - margin.right))/2) + rectSize + 4)
        .attr("y", height - 13)
        .attr("class", "legend")
        .text("Maximum");

    bars.on("mousemove", function(d) {
        bars.attr("opacity", 0.25);
        d3.select(this).attr("opacity", 1);
        tt.html(`Name: <strong>${d.title}</strong><br>
                 Time Span: <strong>${d.span}</strong><br>
                 Death Toll: <strong>${d.toll === 0 ? "Unknown" : d.toll}</strong>
                `)
            .style('top', d3.event.pageY + 16 + 'px')
            .style('left', d3.event.pageX - 30 + 'px')
            .style("opacity", 1);
    }).on("mouseout", function() {
        tt.style("opacity", 0);
        bars.attr("opacity", 1);
    });

    d3.selectAll(".sort").on("click", function() {
        let thisClicked = this.value;
        drawSort(thisClicked);
    });

    d3.selectAll(".since").on("click", function() {
        let thisClicked = this.value;
        drawSince(thisClicked);
    });

    d3.selectAll(".boundaryLine").attr("opacity", 0);

    function drawSort(sort) {

        let sortedData;

        if(sort === "sortTotalDeathToll") {
            sortedData = dataSet.sort(function(a, b) {
                return d3.descending(a.toll , b.toll);
            });
        }
        else if(sort === "sortStartYear") {
            sortedData = dataSet.sort(function(a, b) {
                return d3.ascending(a.start , b.start);
            });
        }
        else if(sort === "sortTotalSpan") {
            sortedData = dataSet.sort(function(a, b) {
                return d3.descending(a.span , b.span);
            });
        }

        yScale.domain(dataSet.map(function(d) { return d.title; }));

        bars.transition()
            .duration(1000)
            .attr("y", function(d) { return yScale(d.title); });

        svg.transition(svg).select(".y.axis")
            .transition()
            .duration(1000)
            .call(yAxis);

    }

    function drawSince(since) {

        dataSet = data;

        if(since === "all") {
            xScale.domain([
                d3.min(dataSet, function(d) { return d.start; }),
                d3.max(dataSet, function(d) { return d.end; })
            ]);
        }
        else if(since === "basedOnInput") {
            let xMin = +inputFrom.property("value");
            dataSet = [];
            for (const d of data) {
                if (d.start < xMin && d.end > xMin) {
                    d.start = xMin;
                }
                if (d.end >= xMin) {
                    dataSet.push(d)
                }
            }
            xScale.domain([
                xMin,
                +inputTo.property("value"),
                ]);
        }
        else if(since === "modern") {
            let xMin = 1600;
            dataSet = [];
            for (const d of data) {
                if (d.start < xMin && d.end > xMin) {
                    d.start = xMin;
                }
                if (d.end >= xMin) {
                    dataSet.push(d)
                }
            }
            xScale.domain([
                xMin,
                d3.max(dataSet, function(d) { return d.end;})
            ]);
        }

        // console.log(dataSet);

        bars.data(dataSet);
        bars.exit().remove();


        yScale.domain(dataSet.map(function(d) { return d.title; }));

        console.log(yScale.bandwidth());

        bars.transition()
            .duration(1000)
            .attr("x", function(d) { return xScale(d.start); })
            .attr("y", function(d) { return yScale(d.title);})
            .attr("width", function(d) { return xScale(d.end) - xScale(d.start);})
            .attr("height", yScale.bandwidth())
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("fill", function(d) {
                return colors(d.start - d.end);
            });

        svg.transition(svg).select(".x.axis").transition().duration(1000)
            .call(xAxis);

        svg.transition(svg).select(".y.axis")
            .transition()
            .duration(1000)
            .call(yAxis);

        d3.selectAll(".y.axis text").on("mousemove", function(d) {
            let filteredData = dataSet.filter(function(e) { return e.title === d})[0];
            tt.html(`Name: <strong>${filteredData.title}</strong><br>
                 Location: <strong>${filteredData.location}</strong>
                `)
                .style('top', d3.event.pageY - 12 + 'px')
                .style('left', d3.event.pageX + 15 + 'px')
                .style("opacity", 1);
        }).on("mouseout", function() {
            tt.style("opacity", 0)
        });

    }


}).catch(function (error) {
    if (error) throw error;
});
