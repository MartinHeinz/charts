let width = 1000, height = 600;

let margin = ({top: 20, right: 10, bottom: 80, left: 10});

let tooltip = d3.select("#svganchor").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

let svg = d3.select("#svganchor")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

let svgBottom = svg.append("g")
    .attr("class", "svgBottom");

let Domain = {
    full: "full",
    relative: "relative",
};

let currentDomain = Domain.relative;

let coordinates = ["2007", "2012", "2019"];

let color = "#003f5c";

let coordinatesScale = d3.scalePoint()
    .range([margin.left, width - margin.right])
    .domain(coordinates)
    .padding(0.5);

let coordinatesLines = svg.selectAll(".coordinatesLines")
    .data(coordinates)
    .enter()
    .append("line")
    .attr("y1", margin.bottom - 6)
    .attr("y2", height - margin.top)
    .attr("x1", d => coordinatesScale(d))
    .attr("x2", d => coordinatesScale(d))
    .attr("stroke-width", 1)
    .attr("stroke", "lightgray");

let chartTitle = svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", 16)
    .attr("class", "chartTitle")
    .attr("font-size", "18px")
    .text("Individuals Who Have Written Computer Code");

let coordTitle = svg.selectAll(".coordTitle")
    .data(coordinates)
    .enter()
    .append("text");

d3.csv("https://martinheinz.github.io/charts/data/ICT_HH2_13062020143325255_H1K_all.csv").then(function (data) {

    data.forEach(d => {
        d.percentage = +d.percentage;
        d.year = +d.year;
    });

    console.log(data);

    let totalLineData = [];

    d3.selectAll(".button").on("click", function() {
        currentDomain = this.value;

        coordinates.forEach(function(d,i) {
            drawCoordinates(d, i);
        });

        drawLines()

    });

    coordinates.forEach(function(d, i) {
        drawCoordinates(d, i);
    });

    let selected = false;
    let selectedCountry, thisCountry;

    let dropdown = d3.select("#drop");

    dropdown.append("option")
        .property("selected", true)
        .text("Highlight a Country");

    dropdown.selectAll(".option")
        .data(data)
        .enter()
        .append("option")
        .attr("value", d => d.country)
        .text(d => d.country);

    dropdown.on("change", function(_) {
        selected = true;
        thisCountry = this.value;
        selectedCountry = thisCountry;
        let currentColor = svg.select("circle").attr("fill");
        svg.selectAll("circle").attr("fill", currentColor);
        svg.selectAll("path").attr("stroke", "#bbb").attr("stroke-width", 0.5);
        d3.selectAll("circle." + thisCountry).attr("fill", "#ffa600");
        d3.selectAll(".line" + thisCountry).attr("stroke", "#ffa600").attr("stroke-width", 1);
    });

    function drawCoordinates(year, index) {

        coordTitle.attr("text-anchor", "middle")
            .attr("class", "coordTitle")
            .attr("font-size", "16px")
            .attr("y", 46)
            .attr("x", (d, i) => coordinatesScale(coordinates[i]))
            .text(d => d)
            .append("tspan");

        let coordinatesDataset = [];

        for (const record of data) {
            if (record.year === +year) {
                coordinatesDataset.push(record);
            }
        }

        let verticalScale;
        if (currentDomain === Domain.relative) {
            verticalScale = d3.scaleLinear()
                .range([height - margin.top, margin.bottom])
                .domain([d3.min(coordinatesDataset, d => d.percentage),
                    d3.max(coordinatesDataset, d => d.percentage)]);
        }
        else {
            verticalScale = d3.scaleLinear()
                .range([height - margin.top, margin.bottom])
                .domain([d3.min(data, d => d.percentage),
                    d3.max(data, d => d.percentage)]);
        }

        let simulation = d3.forceSimulation(coordinatesDataset)
            .force("x", d3.forceX(() => coordinatesScale(year)))
            .force("y", d3.forceY((d) => verticalScale(d.percentage)).strength(2))
            .force("collide", d3.forceCollide(6));

        for (let i = 0; i < coordinatesDataset.length * 2; ++i) {
            simulation.tick();
        }

        totalLineData.push(coordinatesDataset);

        let circles = svg.selectAll(`.circles${index}`)
            .data(coordinatesDataset, (d) => d.country);

        let circlesEnter = circles.enter()
            .append("circle");

        circlesEnter.attr("r", 5)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("fill", color)
            .attr("id", d => `d.country${index}`)
            .attr("class", d => `circles${index} ${d.country}`)
            .attr("id", d =>`d.country${index}`);

        circles.transition()
            .duration(1500)
            .attr("r", 5)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("fill", d => {
                if (selected) {
                    if (d.country === selectedCountry) {
                        return "#ffa600"
                    } else {
                        return color
                    }
                }
                else {
                    return color
                }
            });

        d3.selectAll(".circles" + index).on("mousemove", function(d, i) {
            selected = false;

            tooltip.html(`
                Country: <strong>${d.country}</strong><br>
                Percentage: <strong>${Math.round(d.percentage * 100) / 100}</strong>
                `)
                .style('top', d3.event.pageY - 12 + 'px')
                .style('left', d3.event.pageX + 25 + 'px')
                .style("opacity", 0.9);

            svg.selectAll("circle").attr("fill", color);
            svg.selectAll("path").attr("stroke", "#bbb").attr("stroke-width", 0.5);
            d3.selectAll("circle." + d.country).attr("fill", "#ffa600");
            d3.selectAll(".line" + d.country).attr("stroke", "#ffa600").attr("stroke-width", 1);
        }).on("mouseout", function(d) {
            tooltip.style("opacity", 0);
            d3.selectAll("circle." + d.country).attr("fill", color);
            d3.selectAll(".line" + d.country).attr("stroke", "#bbb").attr("stroke-width", 0.5);
        });
    }

    drawLines();

    function drawLines() {

        let line = d3.line()
            .y(d => d.y)
            .x(d => d.x)
            .curve(d3.curveCatmullRom.alpha(1));

        data.forEach(d => {

            let thisCountry = d.country;

            let thisLineData = [];

            totalLineData.forEach(d => {
                let filtered = d.filter(e => e.country === thisCountry);
                thisLineData.push({x: filtered[0].x, y: filtered[0].y})
            });

            if (!(d3.select(".line" + thisCountry).nodes().length)) {
                let linePath = svgBottom.append("path")
                    .datum(thisLineData)
                    .attr("class", function (d) {
                        return "line" + thisCountry
                    })
                    .attr("d", line)
                    .attr("stroke-width", 0.5)
                    .attr("fill", "none")
                    .attr("stroke", "#bbb");
            }
            else if ((d3.select(".line" + thisCountry).nodes().length)) {
                d3.select(".line" + thisCountry)
                    .datum(thisLineData)
                    .transition()
                    .duration(1500)
                    .attr("d", line);
            }
        });

        totalLineData = [];

    }

}).catch(function (error) {
    if (error) throw error;
});