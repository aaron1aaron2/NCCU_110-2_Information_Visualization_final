var map2 = L
  .map('map2')
  .setView([25.0531, 121.555252], 11).addLayer(
    new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
  )
  
// Add a svg layer to the map
L.svg().addTo(map2);


d3.csv("dataset/spot_info.csv", function(error, data) {
    
  svg_map2 = d3.select("#map2").select("svg")
  // Select the svg area and add circles:
  svg_map2.selectAll("myCircles")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function(d){ return map2.latLngToLayerPoint([d.lat, d.lng]).x })
      .attr("cy", function(d){ return map2.latLngToLayerPoint([d.lat, d.lng]).y })
      .attr("r", 1)
      .attr("class" , "circle")
      .style("fill", "#884EA0")//"69b3a2"
      .attr("stroke", "#884EA0")//"#402D54", "#D18975", "#8FD175", "#69b3a2"
      .attr("stroke-width", 6)
      .attr("fill-opacity", .4)
      .attr("pointer-events","visible")
    .on('mouseover', function(d){ console.log(d.sna) });

  // If the user change the map (zoom or drag), I update circle position:
  map2.on("moveend", update)

  // When a button change, I run the update function
  d3.selectAll(".checkbox").on("change",update);

  // And I initialize it at the beginning
  update()
});

function mark_click(e) {
  console.log(e);
  console.log(`${e.target.options.sno}, ${e.target.options.sna} has been click`);
}

// Function that update circle position if something change
function update() {
  svg_map2.selectAll("circle")
    .attr("cx", function(d){ return map2.latLngToLayerPoint([d.lat, d.lng]).x })
    .attr("cy", function(d){ return map2.latLngToLayerPoint([d.lat, d.lng]).y })
}