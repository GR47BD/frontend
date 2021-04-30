import m from "mithril";
import * as d3 from "d3";
import Visualization from "./Visualization";

// TODO: ADD scale

export default class HierarchicalEdgeComponent extends Visualization {

    oninit(vnode){
        super.oninit(vnode);
    }


    createDonut(){

    // Set dimensions
    var width = 600
    height = 600
    margin = 40

    // Set radius
    var radius = Math.min(width, height) / 2 - margin
        
    // Append the svg to 'hiararchical_div'
    var svg = d3.select("#hierarchical_div")
      .append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        
    // Test data
    var data = [
        {"key": "a", "value": 9},
        {"key": "b", "value": 20},
        {"key": "c", "value": 30},
        {"key": "d", "value": 8},
        {"key": "e", "value": 12},
        {"key": "f", "value": 3},
        {"key": "g", "value": 7},
        {"key": "h", "value": 14}]
    
    // Set color scale
    var color = d3.scaleOrdinal()
      .domain(Object.keys(data))
      .range(d3.schemeBlues[8]);
    
    // Compute position of each group on the pie
    var pie = d3.pie()
      .sort(null) // Do not sort by size
      .value(function(d) {return d.value; })
    var data_ready = pie(data)  // Fixed for now...
    
    // The arc generator
    var arc = d3.arc()
      .innerRadius(radius * 0.6)         // This is the size of the donut hole
      .outerRadius(radius * 0.8)
      .cornerRadius(5)
    
    // Another arc that won't be drawn. Just for labels positioning
    var outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9)
    
    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
      .selectAll('allSlices')
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function(d){ return(color(d.data.key)) })
      .attr("stroke", "white")
      .style("stroke-width", "5px") // Padding between slices
      .style("opacity", 0.9)
    
    // Add and position the names in the bars  
    svg
      .selectAll('allLabels')
      .data(data_ready)
      .enter()
      .append('text')
        .text( function(d) { console.log(d.data.key) ; return d.data.key } )
        .attr('transform', function(d) {
             return 'translate(' + arc.centroid(d).join(",") + ')';
        })
        .style('text-anchor', function(d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })
        .style('font-family', 'Helvetica')
        .style('font-weight', 'bold')
        
    }


    view(){
        return (
            <div id="hierarchical_div"></div>
        )
    }

}