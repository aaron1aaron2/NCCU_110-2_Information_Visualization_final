var map2 = L
  .map('map2')
  .setView([24.994, 121.555252], 14).addLayer(
    new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
  )
  
// Add a svg layer to the map
L.svg().addTo(map2);

var time = ['早上', '早上-午午', '午後', '下午', '晚上', '半夜-清晨'];

var select_time = d3.select('#select_list_time')
  .append('select')
    .attr('class','select_time')
    .on('change', onchange2)

var options_time = select_time
  .selectAll('option')
  .data(time).enter()
  .append('option')
  .text(function (d) { return d});

function onchange2(e) {
  selectValue = d3.select('.select_time').property('value')
  document.getElementById('select_result').innerHTML = ' 當前選擇:' + selectValue;
  document.getElementById('trips_info_rent').innerHTML = '請將滑鼠移到線條上...';
  document.getElementById('trips_info_return').innerHTML = '請將滑鼠移到線條上...';
  document.getElementById('trips_info_count').innerHTML = '';
  console.log(selectValue)
  d3.queue()
    .defer(d3.csv, `dataset/trips/${selectValue}.csv`)
    .defer(d3.csv, "dataset/spot_info.csv")
    .defer(d3.csv, `dataset/trips/${selectValue}_coor.csv`)
    .await(ready);
};

var weekday = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saterday','Sunday'];

var select_weekday = d3.select('#select_list_weekday')
  .append('select')
    .attr('class','select_weekday')
    .on('change', onchange)

var options_weekday = select_weekday
  .selectAll('option')
  .data(weekday).enter()
  .append('option')
  .text(function (d) { return d});

function onchange(e) {
  selectValue = d3.select('.select_weekday').property('value')
  document.getElementById('select_result').innerHTML = ' 當前選擇:' + selectValue;
  document.getElementById('trips_info_rent').innerHTML = '請將滑鼠移到線條上...';
  document.getElementById('trips_info_return').innerHTML = '請將滑鼠移到線條上...';
  document.getElementById('trips_info_count').innerHTML = '';
  d3.queue()
    .defer(d3.csv, `dataset/trips/${selectValue}.csv`)
    .defer(d3.csv, "dataset/spot_info.csv")
    .defer(d3.csv, `dataset/trips/${selectValue}_coor.csv`)
    .await(ready);
};
onchange() 


function ready(error, trip_data, spot_data, trip_coor_data) {
  if (error) throw error;

  svg_map2 = d3.select("#map2").select("svg")
  svg_map2.selectAll("line").remove()
  svg_map2.selectAll("circle").remove()

  // Add the path
  svg_map2.selectAll("myPath")
    .data(trip_data)
    .enter()
    .append("line")
      .attr('x1', function(d){ return map2.latLngToLayerPoint([d.rent_lat, d.rent_lng]).x})
      .attr('y1', function(d){ return map2.latLngToLayerPoint([d.rent_lat, d.rent_lng]).y})
      .attr('x2', function(d){ return map2.latLngToLayerPoint([d.return_lat, d.return_lng]).x})
      .attr('y2', function(d){ return map2.latLngToLayerPoint([d.return_lat, d.return_lng]).y})
      .attr('shareid', function(d){`${d.rent_sna}-${d.return_sna}`})
      .style("opacity", 0.5)
      .style("fill", "none")
      .style("stroke", "#a0c7bd")
      .style("stroke-width", function(d){ return Math.log(d.count)*8})
      .attr("pointer-events","visible")
      .on("mouseover", function(d) {
        d3.select(this)
          .style("opacity", 1)
          .style("stroke", "#69b3a2")
        document.getElementById('trips_info_rent').innerHTML = d.rent_sna;
        document.getElementById('trips_info_return').innerHTML = d.return_sna;
        document.getElementById('trips_info_count').innerHTML = d.count;
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .style("opacity", 0.5)
          .style("stroke", "#a0c7bd")
      })

  // Select the svg area and add circles:
  svg_map2.selectAll("myCircles")
    .data(spot_data)
    .enter()
    .append("circle")
      .attr("cx", function(d){ return map2.latLngToLayerPoint([d.lat, d.lng]).x })
      .attr("cy", function(d){ return map2.latLngToLayerPoint([d.lat, d.lng]).y })
      .attr("r", 1)
      .attr("class" , "circle")
      .attr("stroke", "#1f2c24")//"#402D54", "#D18975", "#8FD175", "#69b3a2"
      .attr("stroke-width", 6)
      .attr("fill-opacity", 0.4)
      .attr("pointer-events","visible")

  // Create the svg area
  var svg_coor = d3.select("#coor_plot").append("svg")
                    .attr("width", "100%").attr("height", 200)
  
  svg_coor.selectAll("myCircles")
    .data(trip_coor_data)
    .enter()
    .append('circle')
      .attr('cx', function(d){ return 50 + d.index*100})
      .attr('cy',  50)
      .attr('r', function(d){ return d.count_nor*40 + 10}) //50-10
      .attr('stroke', 'black')
      .attr('fill', '#69a3b2')
      .attr('shareid', function(d){`${d.rent_sna}-${d.return_sna}`})
      .style("opacity", 0.5)
      .on("mouseover", function(d) {
        d3.select(this)
          .style("opacity", 1)
          .style("stroke", "#69b3a2")
        document.getElementById('trips_info_rent').innerHTML = d.rent_sna;
        document.getElementById('trips_info_return').innerHTML = d.return_sna;
        document.getElementById('trips_info_count').innerHTML = d.count;

        svg_map2.selectAll("line")
          .style("opacity", function(d){
            if ((d.rent_sna == document.getElementById('trips_info_rent').innerHTML) && (d.return_sna == document.getElementById('trips_info_return').innerHTML)) {
              return 1
            } else {
              return 0.5
            }
          })
          .style("stroke",  function(d){
            if ((d.rent_sna == document.getElementById('trips_info_rent').innerHTML) && (d.return_sna == document.getElementById('trips_info_return').innerHTML)) {
              return "#69b3a2"
            } else {
              return "#a0c7bd"
            }
          })
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .style("opacity", 0.5)
          .style("stroke", "#a0c7bd")
        svg_map2.selectAll("line")
          .style("opacity", 0.5)
          .style("stroke", "#a0c7bd")
      })

  // If the user change the map (zoom or drag), I update circle position:
  map2.on("moveend", update)

  // And I initialize it at the beginning
  update()
}


function update() {
  svg_map2 = d3.select("#map2").select("svg")

  svg_map2.selectAll("line")
    .attr('x1', function(d){ return map2.latLngToLayerPoint([d.rent_lat, d.rent_lng]).x})
    .attr('y1', function(d){ return map2.latLngToLayerPoint([d.rent_lat, d.rent_lng]).y})
    .attr('x2', function(d){ return map2.latLngToLayerPoint([d.return_lat, d.return_lng]).x})
    .attr('y2', function(d){ return map2.latLngToLayerPoint([d.return_lat, d.return_lng]).y})

  svg_map2.selectAll("circle")
    .attr("cx", function(d){ return map2.latLngToLayerPoint([d.lat, d.lng]).x })
    .attr("cy", function(d){ return map2.latLngToLayerPoint([d.lat, d.lng]).y })
}
