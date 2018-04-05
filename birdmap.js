// Width and height of svg
var width = 960;
var height = 500;
var centered,g;

var projection = d3.geoAlbersUsa()
                .scale([1090]);

var path = d3.geoPath()
              .projection(projection);

var color = d3.scaleLinear()
              .range(["rgb(213,222,217)", "rgb(69,173,168)", "rgb(84,36,55)","rgb(217,91,67"]);

var svg = d3.select("#svg-original")
            .attr("width", width)
            .attr("height", height);

var ordinal = d3.scaleOrdinal()
  .domain(["3", "5", "7", "9", "11", "12", "18"])
  .range([ "rgb(50, 10, 94)", "rgb(97, 19, 110)", "rgb(141, 35, 105)", "rgb(185, 53, 86)", "rgb(222, 82, 56)","rgb(235, 102, 40)","rgb(255, 213, 7)"]);

svg.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(800,300)");

var legendOrdinal = d3.legendColor()
  //d3 symbol creates a path-string, for example
  //"M0,-8.059274488676564L9.306048591020996,
  //8.059274488676564 -9.306048591020996,8.059274488676564Z"
  //.shapePadding(10)
  .title("Continental concern")
  //use cellFilter to hide the "e" cell
  .scale(ordinal);

var legend = svg.select(".legendOrdinal")
  .call(legendOrdinal);


d3.csv("https://gist.githubusercontent.com/soybean/593712725bef0ba149bed914390858ac/raw/e1407252e4e67f019f1ed5c01173bbae858aaf91/birdmap.csv", function(data) {
color.domain([0,1,2,3]);


  d3.json('https://gist.githubusercontent.com/soybean/b0def4d8a0bb267dd3e7fb12387b1e2b/raw/881b01cb5911010a59d8bd47068a93130f724431/gistfile1.txt', function(json) {
      for (var i = 0; i < data.length; i++) {
      
          var state = data[i].state;
          var name = data[i].name; 
	  var concernScore = data[i].concernScore;
          var scientific = data[i].scientificName;
  

          for (var j = 0; j < json.features.length; j++) {
              var jsonState = json.features[j].properties.name;
              if (state == jsonState) {
		  json.features[i].properties.state = state;
                  json.features[i].properties.birdName = name;
		  json.features[i].properties.concernScore = concernScore;
	          json.features[i].properties.scientific = scientific;	
                  break;
              }
          }
      }

      var g = svg.selectAll('path')
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .style("stroke", "#fff")
          .style("stroke-width", "1")
          .style("fill", getColor)
	  .on("click", clicked);

      //randomize state
      for (var i=0; i < 6; i++) {
        var currentState = Math.floor(Math.random()*(50))
        var newState = json.features[currentState];
        console.log(newState.properties.state);
        var currentsvg = '#svg-'+i;
        var actual = d3.select(currentsvg)
            .attr('width', 800)
            .attr('height', 300)
        var y = actual.selectAll('path')
                    .data(json.features)
                    .enter()
                    .filter(function(d) {
                      return d==newState;
                    })
                    .append("path")
                    .attr("d",path)
                    .style('stroke', '#fff')
                    .style("fill", getColor);
        var centroid = path.centroid(newState);
        

          y.attr('transform', "translate(100,150)scale(1.5)translate("+-centroid[0]+','+-centroid[1]+")");
        for (var j = 0; j<3; j++) {
            
        var newRandom = Math.floor(Math.random()*(50))
        while (newRandom == currentState) {
            newRandom = Math.floor(Math.random()*(50))
        }
        console.log("I: " + i + " J: "+j+ json.features[newRandom].properties.state);
        var newNewState = json.features[newRandom];
            
        var newCentroid = path.centroid(newNewState);
        var o = actual.selectAll('path')
                    .data(json.features)
                    .enter()
                    .filter(function(d) {
                      return d==newNewState;
                    })
                    .append("path")
                    .attr("d",path)
                    .style('stroke', '#fff')
                    .style("fill", getColor);
          var width = o.node().getBBox().width;
          var offset = 200+200*j;
          console.log(offset);
        
          o.attr('transform', "translate(" + offset+",150)scale(1.5)translate("+-newCentroid[0]+','+-newCentroid[1]+")");
          console.log(o.node().getBBox().width);
        }
        
      }





function clicked(d) {
    // Zooming in
    if (d && centered !=d) {
        g.style('fill', getColor);
        var oldColor = d3.select(this).style('fill');
        var centroid = path.centroid(d);
        centered = d;

        g.style('fill', '#b9b9b9');
        d3.select(this).style('fill', oldColor);
        document.getElementById("info-box").innerHTML = generateHTML(d);

        legend.transition()
            .duration(100)
            .attr("opacity", 0);
      
        g.transition()
          .duration(750)
          .attr('transform', 'translate(' + width/2 + ',' + height/2+")scale(4)translate("+-centroid[0]+','+-centroid[1]+")");
        

	

    }


    // Zooming out
    else {
        centered = null;
        g.style('fill', getColor);

        g.transition()
            .duration(750)
            .attr('transform','scale(1)');
	var b = d3.select("#info-box");
	b.html(generateGeneric());
        legend.transition()
              .duration(1000)
              .attr('opacity', 1);
	//b.transition()
		//.duration(750)
		//.html('hi')
		//.style('fill', 'red');
    }
  
    
}


function generateHTML(d) {
    var stateName = d.properties.state;
    var birdName = d.properties.birdName;
    var scientificName = d.properties.scientific;
    return "<div class='box-title'>" + stateName + "<div id='bird-name'>" + birdName + "</div><div id='scientific-name'>"+scientificName + "</div><br><audio controls> <source src='audio/Colorado.mp3' type 'audio/mpeg'></audio></div>";
}


function generateGeneric() {
    return "<div class='generic-title'>Click on a state <br> to get started!</div>"
}

});
});


function getColor(d) {
    var popNum = d.properties.concernScore/20;
    if(popNum*20 < 16) {
	return d3.interpolateInferno(popNum*1.1);
    }
    else { 
        return "rgb(255, 213, 7)"
    }
}
