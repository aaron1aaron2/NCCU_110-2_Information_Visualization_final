var map1 = L.map('map1').setView([24.9980177, 121.5727856], 14)

// set icon
var myIcon = L.icon({
    iconUrl: './static/img/maps-and-flags.png',
    iconSize: [25, 40],
    popupAnchor: [-3, -76],
});


L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoiem92anNyYSIsImEiOiJja283MzYwdTgxNGV6Mm9zN2Nnd3U1NjRzIn0.c2pLwdmzD19cTv4nm9ocTw'
}).addTo(map1);


// Read markers data from data.csv
$.get('./dataset/spot_info.csv', function (csvString) {

    // Use PapaParse to convert string to array of objects
    var data = Papa.parse(csvString, { header: true, dynamicTyping: true }).data;

    // For each row in data, create a marker and add it to the map
    for (var i in data) {
        var row = data[i];

        var pop_content = `站點編號：${row.sno} \
                            <br>
                            站點名稱：${row.sna}`;

        var marker = L.marker([row.lat, row.lng], {
            opacity: 1,
            icon: myIcon,
            sno: row.sno,
            sna: row.sna
        }).bindPopup(pop_content);

        marker.addTo(map1).on('click', spot_timeseries_click);
        marker.addTo(map1).on('click', heatmap_return_click);
        marker.addTo(map1).on('click', heatmap_rent_click);

    }

});

// TimeSeries --------------------------------------------------------
var ts_count = 1; 
function spot_timeseries_click(e) {
  console.log(e);
  console.log(`${e.target.options.sno}, ${e.target.options.sna} has been click`);
  
  d3v6.json("./dataset/spot_timeseries.json")
    .then(function(data){
    //console.log(`${e.target.options.sno}`)
    // d3v6.select('.timeseries.svg').remove();
    chart = LineChart(data[`${e.target.options.sno}`], {
      x: d => new Date(d.datetime),
      y: d => d.count,
      z: d => d.division,
      yLabel: `${e.target.options.sna}`,
      // width: 500,
      height: 200,
      color: "steelblue",
      //,  voronoi // if true, show Voronoi overlay 
      select_text: '#ts1'
    })
    if (ts_count<3) {
      ts_count += 1;
    } else {
      $('#ts1 svg').first().remove();
      $('#ts1 text').first().remove();
      // $('#ts1 svg').last().remove();
    }
  })
}
d3v6.json("./dataset/spot_timeseries.json")
  .then(function(data){
    chart = LineChart(data[136], {
      x: d => new Date(d.datetime),
      y: d => d.count,
      z: d => d.division,
      yLabel: '文山行政中心',
      // width: 500,
      height: 200,
      color: "steelblue",
      //,  voronoi // if true, show Voronoi overlay 
      select_text: '#ts1'
    })
})

// heatmap --------------------------------------------------------
function heatmap_rent_click(e) {
  $("#heatmap_rent div").first().remove();
  $("#heatmap_rent svg").first().remove();
  $("#heatmap_rent text").first().remove();
  station_name=e.target.options.sna.toString();
  chart = heatmap_rent(`./dataset/trip_time/rent_sno_${e.target.options.sno}.csv`,station_name);
  }   

heatmap_rent('./dataset/trip_time/rent_sno_141.csv','文山行政中心')


function heatmap_return_click(e) {
  $("#heatmap_return div").first().remove();
  $("#heatmap_return svg").first().remove();
  $("#heatmap_return text").first().remove();
  station_name=e.target.options.sna.toString();
  chart = heatmap_return(`./dataset/trip_time/return_sno_${e.target.options.sno}.csv`,station_name);
  }   

heatmap_return('./dataset/trip_time/return_sno_141.csv','文山行政中心')

// 其他 function -------------------------------------------------------


// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/multi-line-chart
function LineChart(data, {
  x = ([x]) => x, // given d in data, returns the (temporal) x-value
  y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
  z = () => 1, // given d in data, returns the (categorical) z-value
  title, // given d in data, returns the title text
  defined, // for gaps in data
  curve = d3v6.curveLinear, // method of interpolation between points
  marginTop = 20, // top margin, in pixels
  marginRight = 30, // right margin, in pixels
  marginBottom = 30, // bottom margin, in pixels
  marginLeft = 40, // left margin, in pixels
  width = 640, // outer width, in pixels
  height = 400, // outer height, in pixels
  xType = d3v6.scaleUtc, // type of x-scale
  xDomain, // [xmin, xmax]
  xRange = [marginLeft, width - marginRight], // [left, right]
  yType = d3v6.scaleLinear, // type of y-scale
  yDomain, // [ymin, ymax]
  yRange = [height - marginBottom, marginTop], // [bottom, top]
  yFormat, // a format specifier string for the y-axis
  yLabel, // a label for the y-axis
  zDomain, // array of z-values
  color = "currentColor", // stroke color of line, as a constant or a function of *z*
  strokeLinecap, // stroke line cap of line
  strokeLinejoin, // stroke line join of line
  strokeWidth = 1.5, // stroke width of line
  strokeOpacity, // stroke opacity of line
  mixBlendMode = "multiply", // blend mode of lines
  voronoi, // show a Voronoi overlay? (for debugging)
  select_text
} = {}) {
  // Compute values.
  const X = d3v6.map(data, x);
  const Y = d3v6.map(data, y);
  const Z = d3v6.map(data, z);
  const O = d3v6.map(data, d => d);
  if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
  const D = d3v6.map(data, defined);

  // Compute default domains, and unique the z-domain.
  if (xDomain === undefined) xDomain = d3v6.extent(X);
  if (yDomain === undefined) yDomain = [0, d3v6.max(Y, d => typeof d === "string" ? +d : d)];
  if (zDomain === undefined) zDomain = Z;
  zDomain = new d3v6.InternSet(zDomain);

  // Omit any data not present in the z-domain.
  const I = d3v6.range(X.length).filter(i => zDomain.has(Z[i]));

  // Construct scales and axes.
  const xScale = xType(xDomain, xRange);
  const yScale = yType(yDomain, yRange);
  const xAxis = d3v6.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
  const yAxis = d3v6.axisLeft(yScale).ticks(height / 60, yFormat);

  // Compute titles.
  const T = title === undefined ? Z : title === null ? null : d3v6.map(data, title);

  // Construct a line generator.
  const line = d3v6.line()
      .defined(i => D[i])
      .curve(curve)
      .x(i => xScale(X[i]))
      .y(i => yScale(Y[i]));

  const svg = d3v6.select(select_text)
      .append("text")
        .text(yLabel)
      .append('svg')
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .style("-webkit-tap-highlight-color", "transparent")
      .on("pointerenter", pointerentered)
      .on("pointermove", pointermoved)
      .on("pointerleave", pointerleft)
      .on("touchstart", event => event.preventDefault());

  // An optional Voronoi display (for fun).
  if (voronoi) svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("d", d3v6.Delaunay
        .from(I, i => xScale(X[i]), i => yScale(Y[i]))
        .voronoi([0, 0, width, height])
        .render());

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis);

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove())
      .call(voronoi ? () => {} : g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      // .call(g => g.append("text")
      //     .attr("x", -marginLeft)
      //     .attr("y", 10)
      //     .attr("fill", "currentColor")
      //     .attr("text-anchor", "start")
      //     .attr("font-size", "20px")
      //     .text(yLabel));

  const path = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", typeof color === "string" ? color : null)
      .attr("stroke-linecap", strokeLinecap)
      .attr("stroke-linejoin", strokeLinejoin)
      .attr("stroke-width", strokeWidth)
      .attr("stroke-opacity", strokeOpacity)
    .selectAll("path")
    .data(d3v6.group(I, i => Z[i]))
    .join("path")
      .style("mix-blend-mode", mixBlendMode)
      .attr("stroke", typeof color === "function" ? ([z]) => color(z) : null)
      .attr("d", ([, I]) => line(I));

  const dot = svg.append("g")
      .attr("display", "none");

  dot.append("circle")
      .attr("r", 2.5);

  dot.append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 30)
      .attr("text-anchor", "middle")
      .attr("y", -8);

  function pointermoved(event) {
    const [xm, ym] = d3v6.pointer(event);
    const i = d3v6.least(I, i => Math.hypot(xScale(X[i]) - xm, yScale(Y[i]) - ym)); // closest point
    path.style("stroke", ([z]) => Z[i] === z ? null : "#ddd").filter(([z]) => Z[i] === z).raise();
    dot.attr("transform", `translate(${xScale(X[i])},${yScale(Y[i])})`);
    if (T) dot.select("text").text(T[i]);
    svg.property("value", O[i]).dispatch("input", {bubbles: true});
  }

  function pointerentered() {
    path.style("mix-blend-mode", null).style("stroke", "#ddd");
    dot.attr("display", null);
  }

  function pointerleft() {
    path.style("mix-blend-mode", "multiply").style("stroke", null);
    dot.attr("display", "none");
    svg.node().value = null;
    svg.dispatch("input", {bubbles: true});
  }

  return Object.assign(svg.node(), {value: null});
}

function heatmap_rent(datapath,station_name) {

  let margin = {top: 10, right: 50, bottom: 60, left: 40},
  width = $("#heatmap_rent").width() - margin.left - margin.right,
  height = 260 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3v6.select("#heatmap_rent")
  .append("text")
    .text(`${station_name} is Start point`)
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //Read the data
  d3v6.csv(datapath).then(function(data) {
    // console.log(data)
    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    const myGroups = Array.from(new Set(data.map(d => d.date)))
    const myVars = Array.from(new Set(data.map(d => d.Val_cat)))
    console.log(myVars)
    // Build X scales and axis:
    const x = d3v6.scaleBand()
    .range([ 0, width ])
    .domain(myGroups)   
    .padding(0.05)   
    // .selectAll("text")  
    // .attr("transform", "rotate(-65)")
    
    svg.append("g")
    .style("font-size", 10)
    .attr("transform", `translate(0, ${height})`)
    .call(d3v6.axisBottom(x).tickSize(0))
    .selectAll("text")  .attr("transform", "rotate(-65)")
    .attr('dy', '-0.2em')
    .attr('dx',"-3em")
    .select(".domain").remove()

    // Build Y scales and axis:
    const y = d3v6.scaleBand()
    .range([ height, 0 ])
    .domain(myVars)
    .padding(0.05);
    svg.append("g")
    .style("font-size", 10)
    .call(d3v6.axisLeft(y).tickSize(0))
        .selectAll("text")  .attr("transform", "rotate(-40)")
    .attr('dy', '-0.5em')
    .attr('dx',"0em")
    .select(".domain").remove()


    // Build color scale
    //   const myColor = d3.scaleSequential()
    //     .interpolator(d3.interpolateWarm)
    //     .domain([1,100])
    const myColor = d3v6.scaleLinear()
    .range(["white", "#804600"])
    .domain([1,100])

    // create a tooltip
    const tooltip = d3v6.select("#heatmap_rent")
    .append("div")
    .style("opacity", 0)
    // .style("position", "absolute")
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "3px")
    .style("padding", "3px")
    // .style("width","300px")
    // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function(event,d) {
      tooltip.style("opacity", 1)
      d3v6.select(this)
          .style("stroke", "black")
          .style("opacity", 0.5)
    }
    let  mousemove = function(event,d) {
      tooltip.html("This cell value is: " + d.value)
          // .style("left", (event.x)/2  + "px")
          // .style("top", (event.y)/2 + "px");
          .style("left", (event.x)+ "px")
          .style("top", (event.y)+ "px");
    }
    let mouseleave = function(event,d) {
      tooltip.style("opacity", 0)
      d3v6.select(this)
          .style("stroke", "none")
          .style("opacity", 0.8);
    }

    // add the squares
    svg.selectAll()
    .data(data, function(d) {return d.date+':'+d.Val_cat;})
    .join("rect")
        .attr("x", function(d) { return x(d.date) })
        .attr("y", function(d) { return y(d.Val_cat) })
    //   .attr("rx", 4)
    //   .attr("ry", 4)
        .attr("width", x.bandwidth() )
    //   .attr("padding",20)
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return myColor(d.value)} )
        .style("stroke-width",4)
        .style("stroke", "none")
        .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

  })    

  
}


function heatmap_return(datapath,station_name) {

  let margin = {top: 10, right: 50, bottom: 60, left: 40},
  width = $("#heatmap_return").width() - margin.left - margin.right,
  height = 260 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3v6.select("#heatmap_return")
  .append("text")
    .text(`${station_name} is destination`)
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //Read the data
  d3v6.csv(datapath).then(function(data) {
    // console.log(data)
    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    const myGroups = Array.from(new Set(data.map(d => d.date)))
    const myVars = Array.from(new Set(data.map(d => d.Val_cat)))
    console.log(myVars)
    // Build X scales and axis:
    const x = d3v6.scaleBand()
    .range([ 0, width ])
    .domain(myGroups)   
    .padding(0.05)   
    // .selectAll("text")  
    // .attr("transform", "rotate(-65)")
    
    svg.append("g")
    .style("font-size", 10)
    .attr("transform", `translate(0, ${height})`)
    .call(d3v6.axisBottom(x).tickSize(0))
    .selectAll("text")  .attr("transform", "rotate(-65)")
    .attr('dy', '-0.2em')
    .attr('dx',"-3em")
    .select(".domain").remove()

    // Build Y scales and axis:
    const y = d3v6.scaleBand()
    .range([ height, 0 ])
    .domain(myVars)
    .padding(0.05);
    svg.append("g")
    .style("font-size", 10)
    .call(d3v6.axisLeft(y).tickSize(0))
        .selectAll("text")  .attr("transform", "rotate(-40)")
    .attr('dy', '-0.5em')
    .attr('dx',"0em")
    .select(".domain").remove()


    // Build color scale
    //   const myColor = d3.scaleSequential()
    //     .interpolator(d3.interpolateWarm)
    //     .domain([1,100])
    let myColor = d3v6.scaleLinear()
    .range(["white", "#4A2163"])
    .domain([1,100])

    // create a tooltip
    let tooltip = d3v6.select("#heatmap_return")
    .append("div")
    .style("opacity", 0)
    // .style("position", "absolute")
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "3px")
    .style("padding", "3px")

    // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function(event,d) {
    tooltip.style("opacity", 1)
    d3v6.select(this)
        .style("stroke", "black")
        .style("opacity", 0.5)
    }
    const mousemove = function(event,d) {
    tooltip.html("The cell value is: " + d.value)
        .style("left", (event.x)/2 + "px")
        .style("top", (event.y)/2+ "px")
    //   .style("left", (event.x)/2 + "px")
    //   .style("top", (event.y)/2 + "px")
    }
    let mouseleave = function(event,d) {
    tooltip.style("opacity", 0)
    d3v6.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }

    // add the squares
    svg.selectAll()
    .data(data, function(d) {return d.date+':'+d.Val_cat;})
    .join("rect")
        .attr("x", function(d) { return x(d.date) })
        .attr("y", function(d) { return y(d.Val_cat) })
    //   .attr("rx", 4)
    //   .attr("ry", 4)
        .attr("width", x.bandwidth() )
    //   .attr("padding",20)
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return myColor(d.value)} )
        .style("stroke-width",4)
        .style("stroke", "none")
        .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
  })    

  
}

