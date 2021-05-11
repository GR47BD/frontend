import m from "mithril";
import * as d3 from "d3";
import Visualization from "@/visualize/Visualization";
import { thresholdFreedmanDiaconis } from "d3";


export default class NodeLinkDiagramComponent extends Visualization {
    oninit(vnode) {
        super.oninit(vnode);

        this.dimensions = {
            scale: 2,
            width: 500,
            height: 500
        }

        this.centerForce = {
            x: (this.dimensions.width * this.dimensions.scale) / 4,
            y: (this.dimensions.height * this.dimensions.scale) / 4,
            basis: 1,
            divider: 3000,
            penalty: 0.3
        }

        this.linkForce = {
            basis: 0.9,
            divider: 3000,
            penalty: 0.7,
            amountBonus: 0.3
        }

        this.collideForce = {
            radius: 10,
            strength: 0.7,
            iterations: 10
        }

        this.forces = {
            alpha: 1,
            ticks: 1
        }

        this.edgeOptions = {
            strokeWidth: 0.5,
            highlightedStrokeWidth: 2,
            basis: 0.2,
            amountBonus: 0.4
        }

        this.nodeOptions = {
            radius: 5
        }

        this.edgesToHighlight = []
    }

    oncreate() {
        this.main.visualizer.addVisualization('NodeLinkDiagram', this);

        this.draw();
    }

    async draw(){

        const persons = this.main.dataHandler.getPersons('filtered');

        this.jobtitles = this.main.dataHandler.getJobTitles();
        this.nodes = persons.map(person => {
            return {
                id: person.id,
                jobtitle: person.jobtitle,
                name: this.main.dataHandler.emailToName(person.email),
                highlighted: false
            }
        });


        // Create a map that maps from node id to index in the nodes array
        this.personsIndex = new Map();
        for(let i = 0; i < this.nodes.length; i++){
            this.personsIndex.set(this.nodes[i].id, i);
        }

        let node_link_diagram = d3.select('#node_link_diagram');
        this.svg = node_link_diagram.append('svg')
            .attr('width', this.dimensions.width * this.dimensions.scale)
            .attr('height', this.dimensions.height * this.dimensions.scale)  
            .attr("shape-rendering", "optimizeSpeed")
			.attr("image-rendering", "optimizeSpeed");
        
        this.drawnEdges = this.svg.append('g').attr("class", "edge").selectAll('line');
        this.drawnNodes = this.svg.append('g').attr("class", "node").selectAll('circle');

        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(function (d) {
                return d.id
            }))
            .force("center", d3.forceCenter(this.centerForce.x, this.centerForce.y).strength(this.centerForce.strength))
            .force('collide', d3.forceCollide(d => this.collideForce.radius)
                .strength(this.collideForce.strength)
                .iterations(this.collideForce.iterations))
            .tick(this.forces.ticks);

        
            this.step(true);

            // Make sure the graph is in the middle the first time
            this.ticked(true);


            // after 5 seconds the visualization can be drawn correctly for some reason, so we wait 5 seconds to redraw it.
            // A very bad solution for the problem which needs to be changed later.
            await this.sleep(5000);
            this.ticked();

    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    

    step(firstRun = false) {
        console.log('step')
        this.update(firstRun);
    }

    update(firstRun = false){
        if(firstRun){
            this.drawnEdges = this.svg.select('.edge').selectAll('line');
            this.drawnNodes = this.svg.select('.node').selectAll('circle');
        }
        

        // emails of current timeframe
        let emails = this.main.dataHandler.getEmails();

        emails = emails.map(email => {
            return {
                source: email.fromId,
                target: email.toId,
                sentiment: email.sentiment,     
                date: email.date,
                nr: 1,
                highlighted: false
            }
        });

        this.mailMap = new Map();
        this.maxNr = 0;

        
        for(const email of emails) {
            const key = email.source + "." + email.target;
            const mapValue = this.mailMap.get(key)

            if(mapValue === undefined) {
                this.mailMap.set(key, email);
                this.maxNr = 1;
            }
            else {
                mapValue.nr += 1;
                this.maxNr = mapValue.nr > this.maxNr ? mapValue.nr : this.maxNr;
            }
        }

        // Make sure all edges that should be highlighted get highlighted
        for(let i = 0; i < this.edgesToHighlight.length; i++){
            let edge =this.mailMap.get(this.edgesToHighlight[i]);
            edge.highlighted = true;
        }

        this.edges = Array.from(this.mailMap.values());


        // Set edge data
        // Remove any old edges drawn on the DOM
        this.drawnEdges.data(this.edges).exit().remove();
        // Create new edges if needed
        this.drawnEdges.data(this.edges).enter().append('line');

        // Set node data
        // Remove any old nodes that were previously drawn in the DOM
        this.drawnNodes.data(this.nodes).exit().remove();
        // Create new nodes if needed
        this.drawnNodes.data(this.nodes).enter().append('circle');

        const linkStrength = this.linkForce.basis - (this.edges.length / this.linkForce.divider) * this.linkForce.penalty;
        const centerStrength = this.centerForce.basis - (this.edges.length / this.centerForce.divider) * this.centerForce.penalty;
        // Set all nodes
        this.simulation.nodes(this.nodes)

        this.simulation.force('link').links(this.edges);
        // Change the strength of a link relative to the number of emails in that link
        this.simulation.force('link').strength(link => (link.nr/this.maxNr)*this.linkForce.amountBonus + linkStrength);
        
        this.simulation.force('center').strength(centerStrength);
        // Set edges
        this.simulation.restart();
        this.simulation.on('tick', this.ticked());
    }

    updateEdges(firstRun) {
        this.drawnEdges = this.svg.select('.edge').selectAll('line');

        this.drawnEdges.attr('x1', (edge) => {
                return edge.source.x * this.dimensions.scale;
            })
            .attr('y1', (edge) => {
                return edge.source.y * this.dimensions.scale;
            })
            .attr('x2', (edge) => {
                return edge.target.x * this.dimensions.scale
            })
            .attr('y2', (edge) => {
                return edge.target.y * this.dimensions.scale
            })
            .attr('stroke', edge => {
                const alpha = (this.edgeOptions.amountBonus * edge.nr / this.maxNr + this.edgeOptions.basis).toFixed(2);
                if(edge.highlighted){
                    return `rgba(200,100,0,${alpha})`;
                }
                return `rgba(0,0,0,${alpha})`;
            })
            .attr('stroke-width', edge => {
                if(edge.highlighted) return this.edgeOptions.highlightedStrokeWidth;
                else return this.edgeOptions.strokeWidth;
            })
            .attr('class', '.edge');

        if(firstRun) this.drawnEdges.attr('transform', `translate(${(this.dimensions.width * this.dimensions.scale) / 2},${(this.dimensions.height * this.dimensions.scale) / 2})`)
        else this.drawnEdges.attr('transform', `translate(0,0)`)
    }

    updateNodes(firstRun) {
        this.drawnNodes = this.svg.select('.node').selectAll('circle');
        this.drawnNodes.attr('r', this.nodeOptions.radius)
            .attr('cx', (d) => {
                return d.x * this.dimensions.scale
            })
            .attr('cy', (d) => {
                return d.y * this.dimensions.scale
            })
            .attr('fill', (node) => {
                if(node.highlighted) return '#000000';
                const scale = d3.scaleOrdinal(d3.schemeCategory10);
                scale.domain(this.jobtitles);
                return scale(node.jobtitle);
            })
            
            .on("mouseover", (d, i) => {
                this.main.visualizer.mouseOverNode(i.id);
            })
            .on('mouseout', (d, i) => {
                this.main.visualizer.mouseOutNode(i.id);
            })
            .on('mouseup', (d, i) => {

                return this.main.visualizer.mouseUpNode(i.id)
            })
            .on('mousedown', (d, i) => {
                // console.log("mousedown" + i)
                return this.main.visualizer.mouseDownNode(i.id)
            })
            .attr('class', '.node');

        if(firstRun) this.drawnNodes.attr('transform', `translate(${(this.dimensions.width * this.dimensions.scale) / 2},${(this.dimensions.height * this.dimensions.scale) / 2})`)
        else this.drawnNodes.attr('transform', `translate(0,0)`)
    }

    mouseOverNode(id){
        //Get the location of the selected person in the nodes array
        let nodeIndex = this.personsIndex.get(id);
        //Set highlighted to true
        this.nodes[nodeIndex].highlighted = true;

        super.mouseOverNode();
    }

    mouseOutNode(id){
        //Get the location of the selected person in the nodes array
        let nodeIndex = this.personsIndex.get(id);
        //Set highlighted to false
        this.nodes[nodeIndex].highlighted = false;

        super.mouseOutNode();
    }

    mouseDownNode(id){
        // get all connected edges
        // getEmailsForPerson might not be very efficient 
        let adjacentEmails = this.main.dataHandler.getEmailsForPerson(id);
        // console.log('mousedown function')
        for(let i = 0; i < adjacentEmails.length; i++){
            this.edgesToHighlight.push(adjacentEmails[i].fromId + '.' + adjacentEmails[i].toId);       
        }
        super.mouseDownNode();
    }

    mouseUpNode(id){
        // For now just emptying the array works just fine, however in the future this might not be the best  idea
        this.edgesToHighlight = [];
        super.mouseUpNode();
    }

    ticked(firstRun = false) {
        this.updateEdges(firstRun)
        this.updateNodes(firstRun)
    }

    view() {
        return (
            <div id='node_link_diagram'></div>
        );
    }
}