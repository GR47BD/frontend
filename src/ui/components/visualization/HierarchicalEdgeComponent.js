import m from "mithril";
import * as d3 from "d3";
import Visualization from "@/visualize/Visualization";

// TODO: ADD scale

export default class HierarchicalEdgeComponent extends Visualization {

    oninit(vnode){
        super.oninit(vnode);
    }

    oncreate(vnode){

        this.createHierarchicalEdgeGraph(vnode);
        
    }

    // A lot to improve on, but it works for now
    createHierarchicalEdgeGraph(vnode){
      console.time('total');
      var diameter = 820,
      radius = diameter / 2,
      innerRadius = radius - 120;
  
      var cluster = d3.cluster()
          .size([360, innerRadius]);

      var line = d3.lineRadial()
          .curve(d3.curveBundle.beta(0.85))   // line tension
          .radius(function(d) { return d.y; })
          .angle(function(d) { return d.x / 180 * 3.1415; });

      var svg = d3.select("#hierarchical_div").append("svg")
          .attr("width", diameter)
          .attr("height", diameter)
          .attr("shape-rendering", "optimizeSpeed") // "optimizeSpeed" shaves off about 100ms per render, but looks worse than "geometricPrecision"
          .attr("image-rendering", "optimizeSpeed")
        .append("g")
          .attr("transform", "translate(" + radius + "," + radius + ")");

      var link = svg.append("g").selectAll("link"),
         node = svg.append("g").selectAll("node");

      const persons = this.main.dataHandler.getPersons();

      // Creating the structure of the hierarchy needed
      var mapping = new Map();
      var holder = this.main.dataHandler;

      for(const person of persons) {
        mapping.set(person.id, {
            "name": "job." + person.jobtitle + "." + holder.emailToName(person.email),
            "size": 1,
            "imports": []
        });
      }

      let email1 = this.main.dataHandler.getEmailDateByPercentile(0.1);
      let email2 = this.main.dataHandler.getEmailDateByPercentile(0.15);
      // Get emails from 10% to 15% of the time
      const emails = this.main.dataHandler.getEmailsByDate(email1, email2);

      // Mapping emails to a more appropriate object
      let emails_sent = emails.map(item => {
        return {
          "source": item.fromId,
          "target_details": "job." + item.toJobtitle + "." + holder.emailToName(item.toEmail)
        }
      });

      // Create appropriate data type, so that we can create a heirarchy out of it
      // Push all emails sent by a person into the list of imports(emails sent) for this person
      /*for (var person in mapping){
        for (var email in emails_sent){
          if (mapping[person].name.substring(mapping[person].name.lastIndexOf('.')+1) == emails_sent[email].source){
            mapping[person].imports.push(emails_sent[email].target_details);
          }
        }
      }*/
      for(var email of emails_sent) {
          const person = mapping.get(email.source);
          if(person === undefined) break;
          person.imports.push(email.target_details);
      }
      
      var classes = Array.from(mapping.values());
      
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
          .attr("class", "hier-stroke");
      
      // Create the nodes     
      node = node
        .data(root.leaves())
        .enter().append("text")
          .attr("dy", "0.31em")
          .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
          .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
          .text(function(d) { return d.data.key; })
          .style("font-size", diameter/65 + "px")
          .style("font-family", "Helvetica");
          //.attr("class", "hier-node");

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