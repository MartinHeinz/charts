let height = 240;
let width = 480;
let radius = 3;
let padding = 1.5;
let margin = ({top: 20, right: 20, bottom: 30, left: 20});


d3.csv("http://localhost:8000/data/cars-2.csv").then(function (data) {
    data = data.map(({Name: name, Weight_in_lbs: value}) => ({name, value: +value}));
    console.log(data);
    let x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.value))
        .range([margin.left, width - margin.right]);

    let xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

    const svg = d3.select("svg")
        .attr("viewBox", [0, 0, width, height]);

    svg.append("g")
        .call(xAxis);

    dodge = (data, radius) => {
        const radius2 = radius ** 2;

        const circles = data.map(d => ({x: x(d.value), data: d})).sort((a, b) => a.x - b.x);
        console.log(circles);
        const epsilon = 1e-3;
        let head = null, tail = null;

        // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
        function intersects(x, y) {
            let a = head;
            while (a) {
                if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
                    return true;
                }
                a = a.next;
            }
            return false;
        }

        // Place each circle sequentially.
        for (const b of circles) {

            // Remove circles from the queue that can’t intersect the new circle b.
            while (head && head.x < b.x - radius2) head = head.next;

            // Choose the minimum non-intersecting tangent.
            if (intersects(b.x, b.y = 0)) {
                let a = head;
                b.y = Infinity;
                do {
                    let y = a.y + Math.sqrt(radius2 - (a.x - b.x) ** 2);
                    if (y < b.y && !intersects(b.x, y)) b.y = y;
                    a = a.next;
                } while (a);
            }

            // Add b to the queue.
            b.next = null;
            if (head === null) head = tail = b;
            else tail = tail.next = b;
        }

        return circles;
    };

    svg.append("g")
        .selectAll("circle")
        .data(dodge(data, radius * 2 + padding))
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => height - margin.bottom - radius - padding - d.y)
        .attr("r", radius)
        .append("title")
        .text(d => d.data.name);
}).catch(function (error) {
    if (error) throw error;
});