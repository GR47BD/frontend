import Visualization from "@/visualize/Visualization";
import m from "mithril";
import * as d3 from "d3";
import d3_voronoi from 'd3-voronoi';

export default class TestComponent extends Visualization{
    view() {
        return (
            <div id='node_link_diagram'></div>
        );
    }

    oncreate(){

    const emails = this.main.dataHandler.getEmails('filtered');
    const persons = this.main.dataHandler.getPersons();   
    
    const jobtitles = this.main.dataHandler.getJobTitles();
        
    this.graph = {
        nodes: persons.map(function (person) {
            return {
                id: person.id,
                group: jobtitles.indexOf(person.jobtitle)
            }
        }),
        links: emails.map(function (email) {
            return {
                source: email.fromId,
                target: email.toId,
                sentiment: email.sentiment,     
                date: email.date
                
            }
        })
    }
    console.log(this.graph)

    var width = 960;
    var height = 600;

    var node_link_diagram = d3.select("#node_link_diagram")
    var svg = node_link_diagram.append('svg').attr('width', width)
    .attr('height', height);

    var color = d3.scaleOrdinal(d3.schemeCategory10);



    // var voronoi = d3_voronoi.voronoi()
    //     .x(function(d) { return d.x; })
    //     .y(function(d) { return d.y; })
    //     .extent([[-1, -1], [width + 1, height + 1]]);


    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }).strength(function(link) {   
        if (link.source.group == link.target.group) {
            return 0.5;
        }
        else {
            return 0.1
        }	  
        })
        )
        .force("charge", d3.forceManyBody().strength(-40))
        .force("center", d3.forceCenter(width / 2, height / 2));
        
    this.groupSimulation = d3.forceSimulation() 
	.force("link", d3.forceLink().id(function(d) { return d.id; }).strength(function(link) {
		return Math.abs(link.sentiment) * 2;
	}))
    .force("charge", d3.forceManyBody().strength(-10))
    .force("center", d3.forceCenter(width / 2, height / 2));


    var groups = [];
  
  this.graph.nodes.forEach(function(d) {
	if (groups.indexOf(d.group) == -1) groups.push({id:d.group});
  })
  
  var groupLinks = {};
  
  var map = new Map();

  this.graph.nodes.forEach(node => {
      map.set(node.id, node)
  })
	console.log(map);

  this.graph.links.forEach((d) => {
	var nodes = this.graph.nodes;
	
	// var map = new Map(nodes);


	
	var target = d.target;
	var source = d.source;
	// ensure links targets and sources are ordered the same way:
	if (map.get(target).group > map.get(source).group) {
		var groupTarget = map.get(target).group;
		var groupSource = map.get(source).group;
	}
	else {
		var groupTarget = map.get(source).group;
		var groupSource = map.get(target).group;	
	}
	
	// get the links between each group:
	if (groupTarget != groupSource) {
		var property = "_"+groupSource+"-"+groupTarget;
		
		if(groupLinks[property]) {
			groupLinks[property]++;
		}
		else {
			groupLinks[property] = 1;
		}	
	}
  })

  var groupGraph = {};
  
  groupGraph.nodes = groups;
  groupGraph.links = [];
  
  for (var link in groupLinks) {
  	var parts = link.substring(1).split("-");
	var source = parts[0];
	var target = parts[1];
	var value = groupLinks[link];
	
	groupGraph.links.push({source:source,target:target})
  }
  
  // start the group simulation
  this.groupSimulation 
    .nodes(groupGraph.nodes);

  // append links:
  this.link = svg.append("g")
    // .attr("class", "links")
    .selectAll("line")
    .data(this.graph.links)
    .enter().append("line")
    .attr("stroke-width", 1)
    .attr('transform', `translate(${(width) / 2},${(height) / 2})`)
    this.link = this.link.merge(this.link)
  // append nodes:
  this.node = svg.append("g")
    // .attr("class", "nodes")
    .selectAll("circle")
    .data(this.graph.nodes)
    .enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) { return color(d.group); })
      .attr('transform', `translate(${(width) / 2},${(height) / 2})`)
    //   .call(d3.drag()
    //       .on("start", dragstarted)
    //       .on("drag", dragged)
    //       .on("end", dragended));
    this.node = this.node.merge(this.node);

  this.node.append("title")
      .text(function(d) { return d.id; });

  // main simulation:
  simulation
      .nodes(this.graph.nodes)
      .on("tick", this.ticked());

  simulation.force("link")
      .links(this.graph.links);

      var delaunay = d3.Delaunay.from(simulation.nodes());
      var voronoi = delaunay.voronoi([-1, -1, width + 1, height + 1]);
	  
  // set up the voronoi: 
  var cells = 
    svg.selectAll()
   .data(simulation.nodes())
   .enter().append("g")
   .attr("fill",function(d) { return color(d.group); })
   .attr("class",function(d) { return d.group })

  this.cell = cells.append("path").data(voronoi.cellPolygon) 
    }


    ticked(){
        // var alpha = this.alpha();
	var nodes = this.graph.nodes;
  
	var coords ={};
	var groups = [];
	
	var centroids = {};

	// get the centroid of each group based on the groupSimulation
	this.groupSimulation.nodes().forEach(function(d) {
		var cx = d.x;
		var cy = d.y;
		centroids[d.id] = {x: cx, y: cy};	
	})
	
	// minimum distance to apply a correction:
	var minDistance = 50;
	// if (alpha < 0.2) {
	// 	minDistance = 50 + (1000 * (0.1-alpha))
	// }
	
	// apply a minor correction to each node if needed:
	this.node.each(function(d) {
		var cx = centroids[d.group].x;
		var cy = centroids[d.group].y;
		var x = d.x;
		var y = d.y;
		var dx = cx - x;
		var dy = cy - y;	
			
		var r = Math.sqrt(dx*dx+dy*dy)
			
		if (r>minDistance) {
			d.x = x * 0.95 + cx * 0.05;
			d.y = y * 0.95 + cy * 0.05;		
		}
	})

	// update voronoi:
    // this.cell = this.cell.data(voronoi.polygons(simulation.nodes())).attr("d", renderCell);
  
    // update links:
    this.link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

	// update nodes:
    this.node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    }

    // dragstarted(d) {
    //     if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    //     d.fx = d.x;
    //     d.fy = d.y;
    //   }
      
    //   dragged(d) {
    //     d.fx = d3.event.x;
    //     d.fy = d3.event.y;
    //   }
      
    //   dragended(d) {
    //     if (!d3.event.active) simulation.alphaTarget(0);
    //     d.fx = null;
    //     d.fy = null;
    //   }
      
      
      renderCell(d) {
        return d == null ? null : "M" + d.join("L") + "Z";
      }
}