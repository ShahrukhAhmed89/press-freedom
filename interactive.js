
var margin = {top:100, bottom:0, left:0, right:30},
	width = (screen.width < 768 ) ? 600 : 1300,//window.innerWidth,
	height = (screen.width < 768 ) ? 600 : 650,
  viewBox = (screen.width < 768 ) ? '0 0 1700 100' : '0 0 1300 650',
  preserverAspectRatio = 'xMinYmin';;//(screen.width < 768 ? screen.height/2 : screen.height);

var data = d3.map();
var rank = d3.map();

var color = d3.scaleQuantile()
    .domain(d3.range(0, 91))
    .range(d3.schemeReds[9]);

var x = d3.scaleLinear()
    .domain([0, 91])
    .rangeRound([600, 860]);

var svg = d3.select('#graph1')//.attr('width',width)
						//.attr('height',height)
            .attr('viewBox', viewBox)
            .attr('preserverAspectRatio', preserverAspectRatio)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top +')')
            .classed("svg-content-responsive", true);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,450)");


g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

var div = d3.select('#tooltip').style('opacity', 0)

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Score");

g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickFormat(function(x, i) { return i ? x : x ; })
    .tickValues(d3.range(0, 91, 10)))
  .select(".domain")
    .remove();

var selected = {
	"Andhra Pradesh":1, "Arunachal Pradesh":1, "Assam":1, "Bihar":1,"Chhattisgarh":1,"Goa":1,
  "Gujarat":1  ,  "Haryana":1  ,  "Himachal Pradesh":1  ,  "Jammu And Kashmir":1  ,  "Jharkhand":1  ,
  "Karnataka":1  ,  "Kerala":1  ,  "Madhya Pradesh":1  ,  "Maharashtra":1  ,  "Manipur":1  ,
  "Meghalaya":1  ,  "Mizoram":1  ,  "Nagaland":1  ,  "Orissa":1  ,  "Punjab":1  ,  "Rajasthan":1  ,
  "Sikkim":1  ,  "Tamil Nadu":1  ,  "Telangana":1  ,  "Tripura":1  ,  "Uttar Pradesh":1  ,  "Uttarakhand":1  ,
  "West Bengal":1
}
queue()
	.defer(d3.json, "world.json")
	.defer(d3.json, 'indiawhole.json')
	.defer(d3.csv, "data.csv", function(d) {data.set(d.id, +d.score), rank.set(d.id, d.Rank); })
	.await(MyMap);

function MyMap(error, world, india) {
  	if (error) return console.error(error);


  	var subunits = topojson.feature(world, world.objects.countries);
  			
  	var projection = d3.geoMercator()
									    .translate([width / 2, height / 2]);

		var path = d3.geoPath().projection(projection);


		var states = topojson.feature(india, india.objects.subunit),
		 selection = {type: "FeatureCollection", features: states.features.filter(function(d) { return d.id in selected; })};



		svg.selectAll(".subunit")
      .data(subunits.features)
    .enter().append("path")
      .attr("class", function(d) { return "subunit " + d.id; })
      .attr("d", path)
      .attr("fill", function(d) { 
           var c = rank.get(d.id);
            if(c===undefined){return  c = '#696969'}
            else{return color(data.get(d.id));}
       })
      .attr("d", path)
      .style('stroke', '#222')
      .on('mousemove', function(d){
      	var c = rank.get(d.id)
      	if( c === undefined){var c = "Not Surveyed"}
      	
      	div.transition().duration(0).style("opacity", .9);		
      	
      	div.html(
      					"<p>"+d.properties.name+"</p>"
      					+"<hr class='separator'>"
      					+"<p>Rank: "+c+"</p>"


      		).style("left", (d3.event.pageX + 10) + "px")		
           .style("top", (d3.event.pageY) + "px");	
      })
      .on('mouseout', function(d){
      	div.transition().duration(200).style("opacity", 0);	
      });


  	var subunits1 = topojson.feature(india, india.objects.subunit);
  			
  	var projection = d3.geoMercator()
									    .translate([width / 2, height / 2]);

		var path = d3.geoPath().projection(projection);  


		svg.append("path")
      .datum(topojson.feature(india, india.objects.subunit))
      .attr("d", path)
      .attr('class', 'state')


    svg.append("path")
      .datum(topojson.mesh(india, india.objects.subunit, function(a, b) { return a !== b; }))
      .attr("class", "state-boundary")
      .attr("d", path);

     svg.append("path")
      .datum(selection)
      .attr("class", "state selected-boundary")
      .attr("d", path);

  	svg.append("path")
      .datum(selection)
      .attr("class", "state selected")
      .attr("d", path)
      .attr("fill", function(d) { return color(data.get('IND')); })
      .on('mousemove', function(d){
       	div.transition().duration(0).style("opacity", .9);	

      	div.html(
      					"<p>India</p>"
      					+"<hr class='separator'>"
      					+"<p>Rank: "+rank.get('IND')+"</p>"


      		).style("left", (d3.event.pageX + 10) + "px")		
           .style("top", (d3.event.pageY ) + "px");	
      }).on('mouseout', function(d){
      	div.transition().duration(200).style("opacity", 0);	
      });;

};
