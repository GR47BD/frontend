import m from "mithril";
import * as d3 from "d3";
import Visualization from "@/visualize/Visualization";

// TODO: ADD scale

export default class HierarchicalEdgeComponent extends Visualization {
	oninit(vnode) {
		super.oninit(vnode);

		this.options = {
			diameter: 500,
			nameWidth: 80
		}

		this.lineOptions = {
			tension: 0.85,
			basis: 0.15,
			amountBonus: 0.7,
			highlightBonus: 0.3
		}

		this.styleOptions = {
			textColor: "black",
			lineColor: "#4682b4",
			lineHighlightInColor: "#1eb64c",
			lineHighlightOutColor: "#ff4500"
		}
	}

	oncreate(vnode) {
		this.createHierarchicalEdgeGraph(vnode);
	}

	// A lot to improve on, but it works for now
	createHierarchicalEdgeGraph(vnode) {
		if (!this.main.visualizer.getVisualization('HierarchicalEdgeComponent')) {
			this.main.visualizer.addVisualization('HierarchicalEdgeComponent', this);
		}

		if (this.main.dataHandler.data.length === 0) return;

		this.highlighted = new Map();
		this.redNodes = new Map();
		this.greenNodes = new Map();
		this.jobtitles = this.main.dataHandler.getJobTitles();

		const radius = this.options.diameter / 2;
		const innerRadius = radius - this.options.nameWidth;

		this.cluster = d3.cluster()
			.size([360, innerRadius]);

		this.line = d3.lineRadial()
			.curve(d3.curveBundle.beta(this.lineOptions.tension))   // line tension
			.radius(d => d.y)
			.angle(d => d.x / 180 * Math.PI);

		let svg_container = d3.select("#hierarchical_div");
		svg_container.attr('class', 'svg-container');

		this.svg = svg_container.append("svg")
			.attr('viewBox', '0 0 ' + this.options.diameter + ' ' + this.options.diameter)
			.attr('preserveAspectRatio', 'xMidYMid meet')
			.attr('class', 'svg-content')
			.attr("shape-rendering", "optimizeSpeed")
			.attr("image-rendering", "optimizeSpeed")
			// .attr('padding', '100px')
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
			.attr("transform", d => `rotate(${d.x - 90})translate(${d.y + 20},0)${d.x < 180 ? "" : "rotate(180)"}`)//90
			.attr("text-anchor", d => d.x < 180 ? "start" : "end")
			.text(d => d.data.key)
			.style("font-size", this.options.diameter / 65 + "px")
			.attr("class", "hier-node")
			.attr("fill", this.styleOptions.textColor)
			.on('mouseup', (event, node) => {
				this.mouseOutNode(node);
			})
			.on('mousedown', (event, node) => {
				this.mouseDownNode(event, node);
			});

		//#region 
		const persons = this.main.dataHandler.getPersons('all');
		var jobMapping = {};
		//
		for (const person of persons) {
			// Creating mapping of type: job title -> # people with this job title
			const jobtitle_ = jobMapping[person.jobtitle];
			if (jobtitle_ === undefined) {
				jobMapping[person.jobtitle] = 1;
			}
			else {
				jobMapping[person.jobtitle] = jobtitle_ + 1;
			}
		}

		//// Donut chart
		const color = d3.scaleOrdinal()
			.domain(Object.keys(jobMapping))
			.range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]);
		// this is category10, not working tho

		for (const title in jobMapping) {
			jobMapping[title] += 1;
		}

		const pie = d3.pie()
			.sort(null)
			.value(d => d[1])
		const data_ready = pie(Object.entries(jobMapping));

		const arc = d3.arc()
			.innerRadius(this.options.diameter * 0.34)
			.outerRadius(this.options.diameter * 0.375)

		this.svg.append('g')
			.attr('class', 'pie')
			.selectAll('.arc')
			.data(data_ready)
			.enter()
			.append('path')
			.attr('d', arc)
			.classed('arc', true)
			//.attr("id", function(d,i) { return "warped_" + i;})
			.attr('fill', d => color(d.data[0]))
			.attr("stroke", "#24252a")
			.style("stroke-width", "0px") // Padding between slices
			.style("opacity", 1);

		//this.svg
		//	.selectAll('arc')
		//	.data(data_ready)
		//	.enter()
		//	.append('text')
		//	.text( function(d) { if (d.data[1] >= 7) {return d.data[0] }} )
		//	.attr('transform', function(d) {
		//	  return 'translate(' + arc.centroid(d).join(",") + ')';
		//	})
		//	.style('text-anchor', function(d) {
		//	  var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
		//	  return (midangle < Math.PI ? 'start' : 'end')
		//	})
		//	.attr("class", "hier-arc-text")	
		//.append("textPath")
		//.attr("xlink:href", function(d,i) {return "#warped_" + i;})
	}

	update() {
		if (this.main.dataHandler.data.length === 0) return;
		if (this.cluster === undefined) return this.oncreate();

		
		this.line = d3.lineRadial()
			.curve(d3.curveBundle.beta(this.lineOptions.tension))   // line tension
			.radius(d => d.y)
			.angle(d => d.x / 180 * Math.PI);

		//Only update the data is the dataset is changed
		if (this.main.dataHandler.dataChanged) {
		    this.updateData();
		}


		// Create the graph
		const root = this.packageHierarchy(this.classes)
			.sum(d => d.size);
		this.cluster(root);


		if (this.main.dataHandler.highlightPerson !== undefined) {
			const person = this.persons.find(person => person.id === this.main.dataHandler.highlightPerson);

			this.highlighted.set(`job.${person.jobtitle}.${this.main.dataHandler.emailToName(person.email)}`, true);
		}
		else {
			this.highlighted = new Map();
		}

		// Create the links
		this.svg.selectAll(".hier-stroke").remove();
		this.svg.selectAll("path").data(this.packageImports(root.leaves()))
			.enter().append("path")
			.each(d => {
				d.source = d[0],
					d.target = d[d.length - 1]
			})
			.attr("d", this.line)
			.attr("class", "hier-stroke")
			.attr("stroke", link => {
				const highlightedOut = this.highlighted.get(link.target.data.name);
				const highlightedIn = this.highlighted.get(link.source.data.name);

				if (highlightedIn) {
					this.greenNodes.set(link.target.data.name, true);
					//d3.select(link).raise();
					return this.styleOptions.lineHighlightInColor;
				}
				else if (highlightedOut) {
					this.redNodes.set(link.source.data.name, true);
					//d3.select(link).raise();
					return this.styleOptions.lineHighlightOutColor;
				}
				else {
					return this.styleOptions.lineColor;
				}
			})
			.attr("opacity", (link, value) => {
				const highlighted = this.highlighted.get(link.target.data.name) || this.highlighted.get(link.source.data.name);
				const opacity = this.lineOptions.basis + this.lineOptions.amountBonus * (this.emails[value].nr / this.maxNr) + (highlighted ? this.lineOptions.highlightBonus : 0);

				return opacity > 1 ? 1 : opacity;
			});

		this.updateNodes();

		return root;
	}

	step() {
		this.update();
	}

	updateData() {
		this.persons = this.main.dataHandler.getPersons('all');
		const mapping = new Map();
		const holder = this.main.dataHandler;

		for (const person of this.persons) {
			mapping.set(person.id, {
				"name": "job." + person.jobtitle + "." + holder.emailToName(person.email),
				"size": 1,
				"imports": [],
				"id": person.id
			});
		}

		// Get emails from 10% to 15% of the time
		this.emails = this.main.dataHandler.getEmails();

		const mailMap = new Map();
		this.maxNr = 0;

		for (const email of this.emails) {
			const key = email.fromId + "." + email.toId;
			const mapValue = mailMap.get(key)

			if (mapValue === undefined) {
				email.nr = 1;
				mailMap.set(key, email);
				if (this.maxNr === 0) this.maxNr = 1;
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

		for (var email of emails_sent) {
			const person = mapping.get(email.source);
			if (person === undefined) break;
			person.imports.push(email.target_details);
		}

		this.classes = Array.from(mapping.values());


	}

	updateNodes() {
		this.node = this.node
			.attr("class", node => {
				const selected = this.highlighted.get(node.data.name);
				const selectedSource = this.greenNodes.get(node.data.name);
				const selectedTarget = this.redNodes.get(node.data.name);

				if (selected) {
					this.greenNodes.set(node.data.name, false);
					return "hier-node selected";
				}
				else if (selectedSource && selectedTarget) {
					this.redNodes.set(node.data.name, false);
					this.greenNodes.set(node.data.name, false);
					return "hier-node both";
				}
				else if (selectedTarget) {
					this.redNodes.set(node.data.name, false);
					return "hier-node target";
				}
				else if (selectedSource) {
					this.greenNodes.set(node.data.name, false);
					return "hier-node source";
				}
				else {
					return "hier-node";
				}

			})
			.attr("fill", node => {
				if (this.main.dataHandler.personIsSelected(node.data)) {
					return "steelblue";
				}
				return this.styleOptions.textColor;
			});
	}

	mouseDownNode(event, node) {
		if (!this.main.dataHandler.personIsSelected(node.data)) {
			this.main.dataHandler.addSelectedPerson(this.formatNodeForSelection(node.data));
		}
		else {
			this.main.dataHandler.removeSelectedPerson(node.data);
		}
		this.highlighted.set(node.data.name, true);
		this.main.dataHandler.highlightPerson = node.data.id;
		//this.update();
		this.main.visualizer.changeSelection();
		this.main.statistics.update();

	}

	mouseOutNode(node) {
		this.highlighted.set(node.data.name, false);
		this.main.dataHandler.highlightPerson = undefined;
		this.main.visualizer.changeSelection();
		this.main.statistics.update();
	}

	changeSelection() {
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
			node = map[name] = data || { name: name, children: [] };

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

	view() {
		return (
			<div id="hierarchical_div"></div>
		);
	}
}