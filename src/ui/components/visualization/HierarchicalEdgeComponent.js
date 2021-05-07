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

    update() {
      console.time('update-hier');
      const persons = this.main.dataHandler.getPersons();

      var mapping = new Map();
      var holder = this.main.dataHandler;

      for(const person of persons) {
        mapping.set(person.id, {
            "name": "job." + person.jobtitle + "." + holder.emailToName(person.email),
            "size": 1,
            "imports": []
        });
      }

       // Get emails from 10% to 15% of the time
       this.emails = this.main.dataHandler.getEmails();

      const mailMap = new Map();
        this.maxNr = 0;

        for(const email of this.emails) {
            const key = email.fromId + "." + email.toId;
            const mapValue = mailMap.get(key)

            if(mapValue === undefined) {
                email.nr = 1;
                mailMap.set(key, email);
                this.maxNr = 1;
            }
            else {
                mapValue.nr += 1;
                this.maxNr = mapValue.nr > this.maxNr ? mapValue.nr : this.maxNr;
            }
        }

        this.emails = Array.from(mailMap.values());

       // Mapping emails to a more appropriate object
       let emails_sent = this.emails.map(item => {
         return {
           "source": item.fromId,
           "target_details": "job." + item.toJobtitle + "." + holder.emailToName(item.toEmail)
         }
       });
 
       for(var email of emails_sent) {
           const person = mapping.get(email.source);
           if(person === undefined) break;
           person.imports.push(email.target_details);
       }

       var classes = Array.from(mapping.values());
      
      // Create the graph
      var root = this.packageHierarchy(classes)
          .sum(function(d) { return d.size; });
      this.cluster(root);

      // Create the links
      this.svg.selectAll("path").remove();
      this.svg.selectAll("path").data(this.packageImports(root.leaves()))
        .enter().append("path")
          .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
          .attr("d", this.line)
          .attr("class", "hier-stroke")
          .attr("opacity", (link, value) => 0.15 + .7 * (this.emails[value].nr/this.maxNr));
      console.timeEnd('update-hier');
    }

    step() {
      this.update();
    }

    // A lot to improve on, but it works for now
    createHierarchicalEdgeGraph(vnode){     
      this.jobtitles = this.main.dataHandler.getJobTitles();
      this.main.visualizer.addVisualization('HierarchicalEdgeComponent', this);
      console.time('total');
      const diameter = 820,
          radius = diameter / 2,
          innerRadius = radius - 120;
  
      this.cluster = d3.cluster()
          .size([360, innerRadius]);

      this.line = d3.lineRadial()
          .curve(d3.curveBundle.beta(0.85))   // line tension
          .radius(function(d) { return d.y; })
          .angle(function(d) { return d.x / 180 * Math.PI; });

      this.svg = d3.select("#hierarchical_div").append("svg")
          .attr("width", diameter)
          .attr("height", diameter)
          .attr("shape-rendering", "optimizeSpeed") // "optimizeSpeed" shaves off about 100ms per render, but looks worse than "geometricPrecision"
          .attr("image-rendering", "optimizeSpeed")
        .append("g")
          .attr("transform", "translate(" + radius + "," + radius + ")");

      this.link = this.svg.append("g").selectAll("link"),
      this.node = this.svg.append("g").selectAll("node");

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

      // Get emails from 10% to 15% of the time
      this.emails = this.main.dataHandler.getEmails();

      const mailMap = new Map();
        this.maxNr = 0;

        for(const email of this.emails) {
            const key = email.fromId + "." + email.toId;
            const mapValue = mailMap.get(key)

            if(mapValue === undefined) {
                email.nr = 1;
                mailMap.set(key, email);
                this.maxNr = 1;
            }
            else {
                mapValue.nr += 1;
                this.maxNr = mapValue.nr > this.maxNr ? mapValue.nr : this.maxNr;
            }
        }

        this.emails = Array.from(mailMap.values());

      // Mapping emails to a more appropriate object
      let emails_sent = this.emails.map(item => {
        return {
          "source": item.fromId,
          "target_details": "job." + item.toJobtitle + "." + holder.emailToName(item.toEmail),
          "nr": item.nr
        }
      });

      for(var email of emails_sent) {
          const person = mapping.get(email.source);
          if(person === undefined) break;
          person.imports.push(email.target_details);
      }
      
      var classes = Array.from(mapping.values());
      
      // Create the graph
      var root = this.packageHierarchy(classes)
          .sum(function(d) { return d.size; });
      this.cluster(root);

      // Create the links
      this.link = this.link
        .data(this.packageImports(root.leaves()))
        .enter().append("path")
          .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
          .attr("d", this.line)
          .attr("class", "hier-stroke")
          .attr("opacity", (link, value) => 0.15 + .7 * (this.emails[value].nr/this.maxNr));
      
      // Create the nodes     
      this.node = this.node
        .data(root.leaves())
        .enter().append("text")
          .attr("dy", "0.31em")
          .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
          .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
          .text(function(d) { return d.data.key; })
          .style("font-size", diameter/65 + "px")
          .attr("class", "hier-node")
          .attr('fill', (node) => {
            const scale = d3.scaleOrdinal(d3.schemeCategory10);
            scale.domain(this.jobtitles);
            console.log(node.data.parent.key);
            return scale(node.data.parent.key);
          });

    }

    updateEdges(){
      
    }

    // Create the hierarchy from node names
    packageHierarchy(classes) {
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
    packageImports(nodes) {
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


    view(){
        return (
            <div id="hierarchical_div"></div>
        );
    }

}