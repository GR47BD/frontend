import m from "mithril";
import * as d3 from "d3";
import Visualization from "@/visualize/Visualization";

// TODO: ADD scale

export default class HierarchicalEdgeComponent extends Visualization {

    oninit(vnode){
        super.oninit(vnode);
    }

    oncreate(vnode){

        //this.createDonutGraph(vnode);
        this.createHierarchicalEdgeGraph(vnode);
        
    }

    createDonutGraph(vnode) {

      const jobs = this.main.dataHandler.getJobTitles();
      const persons = this.main.dataHandler.getPersons();

      // Turning the jobs into appropriate objects
      var mapping = jobs.map(item => {
        return {
          "key": item,
          "value": 0
        }});
      // Counting number of people with each job title
      for (var person in persons){
        for (var job in jobs){
            if (persons[person].jobtitle == mapping[job].key){
              mapping[job].value++;
            }
        }
      }  

      // Set dimensions
      this.width = 600
      this.height = 600
      this.margin = 40

      // Set radius
      var radius = Math.min(this.width, this.height) / 2 - this.margin;

      // Append the svg to 'hiararchical_div'
      var svg = d3.select("#hierarchical_div")
        .append("svg")
          .attr("width", this.width)
          .attr("height", this.height)
        .append("g")
          .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

      const data = mapping;
      // Set color scale
      var color = d3.scaleOrdinal()
        .domain(Object.keys(data))
        .range(d3.schemeBlues[8]);
      
      // Compute position of each group on the pie
      var pie = d3.pie()
        .sort(null) // Do not sort by size
        .value(function(d) {return d.value; });
      var data_ready = pie(data);  // Fixed for now...
      
      // The arc generator
      var arc = d3.arc()
        .innerRadius(radius * 0.6)         // This is the size of the donut hole
        .outerRadius(radius * 0.8)
        .cornerRadius(5);
      
      // Another arc that won't be drawn. Just for labels positioning
      var outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);
      
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
        .style("opacity", 0.9);
      
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
          .style('font-weight', 'bold');
    }

    // A lot to improve on, but it works for now
    createHierarchicalEdgeGraph(vnode){
      var diameter = 820,
      radius = diameter / 2,
      innerRadius = radius - 120;
  
      var cluster = d3.cluster()
          .size([360, innerRadius]);

      var line = d3.radialLine()
          .curve(d3.curveBundle.beta(0.85))
          .radius(function(d) { return d.y; })
          .angle(function(d) { return d.x / 180 * Math.PI; });

      var svg = d3.select("#hierarchical_div").append("svg")
          .attr("width", diameter)
          .attr("height", diameter)
        .append("g")
          .attr("transform", "translate(" + radius + "," + radius + ")");

      var link = svg.append("g").selectAll("link"),
         node = svg.append("g").selectAll("node");

      const persons = this.main.dataHandler.getPersons();

      // Creating the structure of the hierarchy needed
      var mapping = persons.map(item =>{
        return {
            "name": "job." + item.jobtitle + "." + item.id,
            "size": 1,
            "imports": []
        }
      });

      let email1 = this.main.dataHandler.getEmailDateByPercentile(0.1);
      let email2 = this.main.dataHandler.getEmailDateByPercentile(0.105);
      // Get emails from 10% to 10.5% of the time
      const emails = this.main.dataHandler.getEmailsByDate(email1, email2);
      // Mapping emails to a more appropriate object
      let emails_sent = emails.map(item => {
        return {
          "source": item.fromId,
          "target_details": "job." + item.toJobtitle + "." + item.toId
        }
      });

      // Create appropriate data type, so that we can create a heirarchy out of it
      // Push all emails sent by a person into the list of imports(emails sent) for this person
      for (var person in mapping){
        for (var email in emails_sent){
          if (mapping[person].name.substring(mapping[person].name.lastIndexOf('.')+1) == emails_sent[email].source){
            mapping[person].imports.push(emails_sent[email].target_details);
          }
        }
      }
      
      var classes = mapping;
      
      // Create the graph
      var root = packageHierarchy(classes)
          .sum(function(d) { return d.size; });
      cluster(root);

      // Create the links
      link = link
        .data(packageImports(root.leaves()))
        .enter().append("path")
          .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
          .attr("d", line)
          .style('stroke', 'steelblue')
          .style('stroke-opacity', 0.5)
          .style('fill', 'none')
          .style('pointer-events', 'none');
      
      // Create the nodes     
      node = node
        .data(root.leaves())
        .enter().append("text")
          .attr("dy", "0.31em")
          .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
          .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
          .text(function(d) { return d.data.key; })
          .style('font', 8 + " px")
          .style('font-family', 'Helvetica');

      // Create the hierarchy from node names
      function packageHierarchy(classes) {
        var map = {};
      
        function find(name, data) {
          var node = map[name], i;
          if (!node) {
            node = map[name] = data || {name: name, children: []};
            if (name.length) {
              node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
              node.parent.children.push(node);
              node.key = name.substring(i + 1);
            }
          }
          return node;
        }
      
        classes.forEach(function(d) {
          find(d.name, d);
        });
      
        return d3.hierarchy(map[""]);
      }

      // Return a list of imports for the given array of nodes.
      function packageImports(nodes) {
        var map = {},
            imports = [];
      
        // Compute a map from name to node.
        nodes.forEach(function(d) {
          map[d.data.name] = d;
        });
      
        // For each import, construct a link from the source to target node.
        nodes.forEach(function(d) {
          if (d.data.imports) d.data.imports.forEach(function(i) {
            imports.push(map[d.data.name].path(map[i]));
          });
        });
      
        return imports;
      }

    }


    view(){
        return (
            <div id="hierarchical_div"></div>
        );
    }

}