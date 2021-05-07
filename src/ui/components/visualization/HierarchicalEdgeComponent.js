import m from "mithril";
import * as d3 from "d3";
import Visualization from "@/visualize/Visualization";

// TODO: ADD scale

export default class HierarchicalEdgeComponent extends Visualization {
    oninit(vnode){
        super.oninit(vnode);

		this.options = {
			diameter: 820,
			nameWidth: 120
		}

		this.lineOptions = {
			tension: 0.85,
			basis: 0.15,
			amountBonus: 0.7
		}
    }

    oncreate(vnode){
        this.createHierarchicalEdgeGraph(vnode);
    }

    // A lot to improve on, but it works for now
    createHierarchicalEdgeGraph(vnode){     
		this.main.visualizer.addVisualization('HierarchicalEdgeComponent', this);

		this.jobtitles = this.main.dataHandler.getJobTitles();
		const radius = this.options.diameter / 2;
		const innerRadius = radius - this.options.nameWidth;
		
    	this.cluster = d3.cluster()
        	.size([360, innerRadius]);

		this.line = d3.lineRadial()
			.curve(d3.curveBundle.beta(this.lineOptions.tension))   // line tension
			.radius(d => d.y)
			.angle(d => d.x / 180 * Math.PI);

		this.svg = d3.select("#hierarchical_div").append("svg")
			.attr("width", this.options.diameter)
			.attr("height", this.options.diameter)
			.attr("shape-rendering", "optimizeSpeed")
			.attr("image-rendering", "optimizeSpeed")
			.append("g")
			.attr("transform", "translate(" + radius + "," + radius + ")");

		this.link = this.svg.append("g").selectAll("link"),
		this.node = this.svg.append("g").selectAll("node");

		const root = this.update();

	// Create the nodes     
	this.node = this.node
		.data(root.leaves())
		.enter().append("text")
		.attr("dy", "0.31em")
		.attr("transform", d => `rotate(${d.x - 90})translate(${d.y + 8},0)${d.x < 180 ? "" : "rotate(180)"}`)
		.attr("text-anchor", d => d.x < 180 ? "start" : "end")
		.text(d => d.data.key)
		.style("font-size", this.options.diameter/65 + "px")
		.attr("class", "hier-node")
		.attr('fill', node => {
			const scale = d3.scaleOrdinal(d3.schemeCategory10);
			scale.domain(this.jobtitles);
			return scale(node.data.parent.key);
		});

	}

	update() {
		const persons = this.main.dataHandler.getPersons('all');
		const mapping = new Map();
		const holder = this.main.dataHandler;

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

		const classes = Array.from(mapping.values());

		// Create the graph
		const root = this.packageHierarchy(classes)
			.sum(d => d.size);
		this.cluster(root);

		// Create the links
		this.svg.selectAll("path").remove();
		this.svg.selectAll("path").data(this.packageImports(root.leaves()))
			.enter().append("path")
			.each(d => {
				d.source = d[0], 
				d.target = d[d.length - 1]
			})
			.attr("d", this.line)
			.attr("class", "hier-stroke")
			.attr("opacity", (link, value) => this.lineOptions.basis + this.lineOptions.amountBonus * (this.emails[value].nr/this.maxNr));

		return root;
	}

	step() {
		this.update();
	}

	// Create the hierarchy from node names
	packageHierarchy(classes) {
		let map = {};

		classes.forEach(d => {
			this.find(d.name, d, map);
		});

		return d3.hierarchy(map[""]);
	}

	find(name, data, map) {
		let node = map[name];
		let i;

		if (!node) {
			node = map[name] = data || {name: name, children: []};

			if (name.length) {
				node.parent = this.find(name.substring(0, i = name.lastIndexOf(".")), undefined, map);
				node.parent.children.push(node);
				node.key = name.substring(i + 1);
			}
		}
		
		return node;
	}

	// Return a list of imports for the given array of nodes.
	packageImports(nodes) {
		let map = {};
		let imports = [];

		// Compute a map from name to node.
		nodes.forEach(d => map[d.data.name] = d);

		// For each import, construct a link from the source to target node.
		nodes.forEach(d => {
			if (!d.data.imports) return;
			
			d.data.imports.forEach(i => imports.push(map[d.data.name].path(map[i])));
		});

		return imports;
	}

	view(){
		return (
			<div id="hierarchical_div"></div>
		);
	}
}