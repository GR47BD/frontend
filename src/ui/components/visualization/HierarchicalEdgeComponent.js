import m from "mithril";
import * as d3 from "d3";
import Visualization from "@/visualize/Visualization";

// TODO: ADD scale

export default class HierarchicalEdgeComponent extends Visualization {
    oninit(vnode){
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
    }

    oncreate(vnode){
        this.createHierarchicalEdgeGraph(vnode);
    }

    // A lot to improve on, but it works for now
    createHierarchicalEdgeGraph(vnode){   
		if(!this.main.visualizer.getVisualization('HierarchicalEdgeComponent')) {
			this.main.visualizer.addVisualization('HierarchicalEdgeComponent', this);
		}

		if(this.main.dataHandler.data.length === 0) return;

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
			})
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
		for (const person of persons){
			// Creating mapping of type: job title -> # people with this job title
			const jobtitle_ = jobMapping[person.jobtitle];
			if (jobtitle_ === undefined){
				jobMapping[person.jobtitle] = 1;
			}
			else{
				jobMapping[person.jobtitle] = jobtitle_ + 1;
			}
		}
//
		//console.log(jobMapping);
		//
		//// Donut chart
		const color = d3.scaleOrdinal()
			.domain(Object.keys(jobMapping))
			.range(d3.schemeCategory10);
//
		const pie = d3.pie()
			.sort(null)
			.value(d => d[1])
		const data_ready = pie(Object.entries(jobMapping));
//
		const arc = d3.arc()
			.innerRadius(this.options.diameter * 0.25)
			.outerRadius(this.options.diameter * 0.4)
				
		this.svg.append('g')
			.attr('class', 'pie')
			.selectAll('.arc')
			.data(data_ready)
			.enter()
			.append('path')
			.attr('d', arc)
			.classed('arc', true)
			.attr('fill', d => color(d.data[1]))
//
		//var second_svg = d3.select("#hierarchical_div")
		//	.append("svg")
		//	  .attr("width", 150)
		//	  .attr("height", 250)
		//	.append("g")
		//	  .attr("transform", "translate(" + 150 / 2 + "," + 250 / 2 + ")");		
//
		//second_svg
		//	.selectAll('allSlices')
		//	.data(data_ready)
		//	.enter()
		//	.append('path')
		//	.attr('d', arc)
		//	.attr('fill', function(d){ return(color(d.data.key)) })
		//	.attr("stroke", "white")
		//	.style("stroke-width", "5px") // Padding between slices
		//	.style("opacity", 0.9);		
		//#endregion	

	}

	update() {
		if(this.main.dataHandler.data.length === 0) return;
        if(this.cluster === undefined) return this.oncreate();

		//#region 
		const persons = this.main.dataHandler.getPersons('all');
		const mapping = new Map();
		const holder = this.main.dataHandler;

		for(const person of persons) {
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

		for(const email of this.emails) {
			const key = email.fromId + "." + email.toId;
			const mapValue = mailMap.get(key)

			if(mapValue === undefined) {
				email.nr = 1;
				mailMap.set(key, email);
				if(this.maxNr === 0) this.maxNr = 1;
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

		//#endregion

		// Create the links
		this.svg.selectAll(".hier-stroke").remove();
		this.svg.selectAll("path").data(this.packageImports(root.leaves()))
			.enter().append("path")
			.each(d => {
				d.source = d[0], 
				d.target = d[d.length - 1]
			})
			.attr("d", this.line)
			.attr("class", link => {
				const highlightedOut = this.highlighted.get(link.target.data.name);
				const highlightedIn = this.highlighted.get(link.source.data.name);

				if (highlightedIn){
					this.greenNodes.set(link.target.data.name, true);
					return "hier-stroke highlightedIn";
				}
				else if(highlightedOut){
					this.redNodes.set(link.source.data.name, true);
					return "hier-stroke highlightedOut";
				}
				else{
					return "hier-stroke";}
			})
			.attr("opacity", (link, value) => {
			const highlighted = this.highlighted.get(link.target.data.name) || this.highlighted.get(link.source.data.name);
			const opacity = this.lineOptions.basis + this.lineOptions.amountBonus * (this.emails[value].nr/this.maxNr) + (highlighted ? this.lineOptions.highlightBonus : 0);
			
			return opacity > 1 ? 1 : opacity});

			this.updateNodes();

		return root;
	}

	step() {
		this.update();
	}

	updateNodes() {
		this.node = this.node
			.attr("class", node =>{
				const selected = this.highlighted.get(node.data.name);
				const selectedSource = this.greenNodes.get(node.data.name);
				const selectedTarget = this.redNodes.get(node.data.name);

				if (selected) {
					this.greenNodes.set(node.data.name, false);
					return "hier-node selected";
				}
				else if (selectedSource && selectedTarget){
					this.redNodes.set(node.data.name, false);
					this.greenNodes.set(node.data.name, false);
					return "hier-node both";
				}
				else if(selectedTarget){
					this.redNodes.set(node.data.name, false);
					return "hier-node target";
				}
				else if(selectedSource){
					this.greenNodes.set(node.data.name, false);
					return "hier-node source";
				}
				else {
					return "hier-node";
				}

			})
			.attr("fill", node => {
				if (this.main.dataHandler.personIsSelected(node.data)){
					return "steelblue";
				}
				return;
			});
	}

	mouseDownNode(event, node){
		if(!this.main.dataHandler.personIsSelected(node.data)){
			this.main.dataHandler.addSelectedPerson(node.data);
		}
		this.highlighted.set(node.data.name, true)
		//this.update();
		this.main.visualizer.changeSelection();
	}

	mouseOutNode(node){
		this.main.dataHandler.removeSelectedPerson(node.data);
		this.highlighted.set(node.data.name, false)
		this.update();
	}

	changeSelection(){
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