import m from "mithril";
import * as d3 from "d3";
import Visualization from "@/visualize/Visualization";


export default class NodeLinkDiagramComponent extends Visualization {
    
    constructor(){
        super();
        this.dimensions = {
            width: 600,
            height: 600
        }

        this.centerForce = {
            x: this.dimensions.width / 2,
            y: this.dimensions.height / 2,
            basis: 1,
            divider: 4000,
            penalty: 0.3
        }

        this.linkForce = {
            basis: 0.9,
            divider: 3000,
            penalty: 0.7,
            amountBonus: 0.3
        }

        this.collideForce = {
            radius: 20,
            strength: 0.9,
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
            minRadius: 5,
            maxRadius: 30
        }

        this.simulationSettings = {
            startAlpha: 1,
            alphaTarget: 0.01,
            alphaDecay: 0.05            
        }

        this.maxNodes = 0;

        this.edgesToHighlight = []
        this.jobtitles = [];

        this.usingBrushTool = false;

        this.groupOnJobtitle = true;
        this.startGrouponJobtitle = false;

        this.clickedNodes = new Map();

        this.groupedJobtitles = new Set();
        this.groupedEdges = new Map();
    }

    oninit(vnode) {
        super.oninit(vnode);       
    }

    oncreate() {
        if(!this.main.visualizer.getVisualization('NodeLinkDiagram')) {
			this.main.visualizer.addVisualization('NodeLinkDiagram', this);
		}

		if(this.main.dataHandler.data.length === 0) return;

        let node_link_diagram = d3.select('#node_link_diagram');
        this.svg = node_link_diagram.append('svg')
            .attr('width', this.dimensions.width)
            .attr('height', this.dimensions.height)  
            .attr("shape-rendering", "optimizeSpeed")
			.attr("image-rendering", "optimizeSpeed");

        this.jobtitles = this.main.dataHandler.getJobTitles()
     
        const brush = d3.brush().on('start', (selection) => this.brushed(selection))
        .on('brush', (selection) => this.brushed(selection))
        .filter((event) => {
            return event.ctrlKey;
        });

        this.scale = d3.scaleOrdinal(d3.schemeCategory10);
        this.scale.domain(this.jobtitles);        

        this.svg.append('g').attr("class", "brush end").call(brush).attr("class");   

        this.drawnEdges = this.svg.append('g').attr("class", "edge").selectAll('line');
        this.drawnNodes = this.svg.append('g').attr("class", "node").selectAll('circle').on('mousedown', (event) => {
            if(!event.ctrlKey){

                    console.log(event)
                    this.main.dataHandler.clearSelectedPersons();
                    for(let node in this.clickedNodes){
                        this.main.dataHandler.addSelectedPerson(super.nodeToPersonObject(node));
                    }
                }
        }); 



        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(function (node) {
                if(node.nodes === undefined) return node.id;
                else return node.jobtitle;
            }))
            .force("center", d3.forceCenter(this.centerForce.x, this.centerForce.y).strength(this.centerForce.strength))
            .force('collide', d3.forceCollide(d => this.collideForce.radius)
                .strength(this.collideForce.strength)
                .iterations(this.collideForce.iterations))
                .tick(this.forces.ticks);

        this.simulation.alphaTarget(this.simulationSettings.alphaTarget).alphaDecay(this.simulationSettings.alphaDecay);
        

        this.update(true);
    }

    brushed({selection}){
        this.usingBrushTool = true
        if(selection) this.searchNodesInRectangle(selection);
        else {
            console.log("selection empty")
        }
    }

    step(firstRun = false) {
        this.update(firstRun);
    } 

    update(firstRun = false){
		if(this.main.dataHandler.data.length === 0) return;
        if(!firstRun && this.nodes === undefined) return this.oncreate();

        let dataChangedAmount = this.main.dataHandler.dataChangedAmount;

        if(firstRun){
            this.drawnEdges = this.svg.select('.edge').selectAll('line');
            this.drawnNodes = this.svg.select('.node').selectAll('circle');
            dataChangedAmount = 1;
            const persons = this.main.dataHandler.getPersons();

            this.nodes = persons.map(person => {
                return {
                    id: person.id,
                    jobtitle: person.jobtitle,
                    name: this.main.dataHandler.emailToName(person.email),
                    highlighted: false
                }
            });
        }

        

        if(this.main.dataHandler.dataChanged){
            this.updateData(dataChangedAmount);
        }  

        // Make sure all edges that should be highlighted get highlighted
        // for(let i = 0; i < this.edgesToHighlight.length; i++){
        //     let edge = this.mailMap.get(this.edgesToHighlight[i]);
        //     edge.highlighted = true;
        // }

        // Set edge data
        // Remove any old edges drawn on the DOMvc
        this.drawnEdges.data(this.edges).exit().remove();
        // Create new edges if needed
        this.drawnEdges.data(this.edges).enter().append('line');

        // Set node data

        this.simulation.nodes(this.nodes);
        // Remove any old nodes that were previously drawn in the DOM
        this.drawnNodes.data(this.nodes).exit().remove();
        // Create new nodes if needed
        this.drawnNodes.data(this.nodes).enter().append('circle');

        const linkStrength = this.linkForce.basis - (this.edges.length / this.linkForce.divider) * this.linkForce.penalty;
        const centerStrength = this.centerForce.basis - (this.edges.length / this.centerForce.divider) * this.centerForce.penalty;

        this.simulation.force('link').links(this.edges); 


        let weightScale = d3.scaleLinear().domain(d3.extent(this.edges, (edge) => this.maxNr - edge.nr)).range([.1, 2])
        this.simulation.force('link')
        // .strength(link => (link.nr/this.maxNr)*this.linkForce.amountBonus + linkStrength);
        .strength(edge => weightScale(edge.nr));

        console.log('edges:', this.edges)

        // Change the strength of a link relative to the number of emails in that link

        
        this.simulation.force('center').strength(centerStrength);
                
        if(this.main.dataHandler.dataChanged){
            
            let newAlpha = (dataChangedAmount * (0.7 - this.simulationSettings.alphaTarget)) + this.simulationSettings.alphaTarget;
            let resetSimulationThreshold = 0.01;
            if(this.simulationSettings.alphaTarget - newAlpha > resetSimulationThreshold){
                this.simulation.alpha(newAlpha);
            }           

        }        

        this.simulation.on('tick', () => {
            this.updateDrawnNodes(this.main.dataHandler.dataChanged);
            this.updateDrawnEdges(this.main.dataHandler.dataChanged);
        });
        
        super.update();
    }

    updateData(dataChangedAmount){
        this.updateNodes(true);
        this.updateEdges();  

        if(this.groupOnJobtitle){
            if(this.startGrouponJobtitle){
                this.groupedJobtitles = new Set(this.jobtitles);
            }
            this.createNodesGroup();
            this.createEdgesGroup();
        }

        let newAlpha = (dataChangedAmount * (0.5 - this.simulationSettings.alphaTarget)) + this.simulationSettings.alphaTarget;
        this.simulation.alpha(newAlpha);
    }

    compareLists(list1, list2, isUnion = false){
        return list1.filter((set => a => isUnion === set.has(a.id))(new Set(list2.map(b => b.id))));
    }

    updateNodes(fromDatahandler){

        if(fromDatahandler){
            const persons = this.main.dataHandler.getPersons();

            this.nodes = this.compareLists(this.nodes, persons, true);
            let newNodes = this.compareLists(persons, this.nodes);
    
            newNodes = newNodes.map(node => {
                return {
                    id: node.id,
                    jobtitle: node.jobtitle,
                    name: persons.find(person => person.email === node.email),
                    highlighted: false,
                    x: this.dimensions.width / 2,
                    y: this.dimensions.height / 2
                }
            })
    
            this.nodes.push(...newNodes);            
    
            this.personsIndex = new Map();
            for(let i = 0; i < this.nodes.length; i++){
                this.personsIndex.set(this.nodes[i].id, i);
            }
        }

    }

    updateEdges(){
        // emails of current timeframe
        let emails = this.main.dataHandler.getEmails();

        this.edges = emails.map(email => {
            return {
                source: email.fromId,
                target: email.toId,
                jobtitles: {
                    source: email.fromJobtitle,
                    target: email.toJobtitle,
                },
                ids: {
                    source: email.fromId,
                    target: email.toId,
                },
                sentiment: email.sentiment,     
                date: email.date,
                nr: 1,
                highlighted: false
            }
        });


        // this.removeDuplicateEdges

    }

    /**
     * This function will reduce the amount of edges from the start but then the edges will also be deleted.
        By not using this there will be less better performance but all the edges will still be saved and grouped in this.edges.
        When performance becomes a problem this can be used to remove all edges between the same nodes so there is only one edge left between each node.
     **/    
    removeDuplicateEdges(){
        // this.mailMap = new Map();
        // this.maxNr = 0;
        
        // for(const email of this.edges) {
        //     const key = email.source + "." + email.target;
        //     const mapValue = this.mailMap.get(key)

        //     if(mapValue === undefined) {
        //         this.mailMap.set(key, email);
        //         this.maxNr = 1;
        //     }
        //     else {
        //         mapValue.nr += 1;
        //         this.maxNr = mapValue.nr > this.maxNr ? mapValue.nr : this.maxNr;
        //     }
        // }

        // this.edges = Array.from(this.mailMap.values());
    }

    /**
     * loops through all nodes to check if they need to be added from a group or removed from a group
     */
    createNodesGroup(){
        let groupedNodes = new Map();
        this.maxNodes = 0;

        for(let node of this.nodes){
            if(this.groupedJobtitles.has(node.jobtitle)){
                this.addNodeToGroup(node, groupedNodes);
            } 
            else {
                this.removeNodeFromGroup(node, groupedNodes);
            }            
        }   

        this.nodes = Array.from(groupedNodes.values())
        console.log('this.nodes:', groupedNodes);

        console.log('this.nodes:', this.nodes);

    }

    /**
     * adds the given node to the given groupedNodes map. 
     * @param {*} node 
     * @param {Map} groupedNodes 
     */
    addNodeToGroup(node, groupedNodes){
        const group = groupedNodes.get(node.jobtitle);

        // If there is no group in the groupedNodes with the jobtitle of the node yet, 
        // there needs to be added a group of this jobtitle with as nodes an array with the current node.
        if(group === undefined && node.nodes === undefined){
            groupedNodes.set(node.jobtitle, {jobtitle: node.jobtitle, nodes: new Array(node)})
            this.maxNodes = 1;
        }  
        // If there is no group but there are nodes in node.nodes, the group of this jobtitle needs to 
        // be added with as nodes the given node.nodes.
        else if(group === undefined){
            groupedNodes.set(node.jobtitle, {jobtitle: node.jobtitle, nodes: node.nodes})
            this.maxNodes = this.maxNodes > node.nodes.length ? this.maxNodes : node.nodes.length;
        }
        // If node.nodes is undefined but there is a group, this node needs to be pushed to the group. 
        else if(node.nodes === undefined) {
                group.nodes.push(node)
                this.maxNodes = this.maxNodes > group.nodes.length ? this.maxNodes : group.nodes.length;
        }
    }
    /**
     * adds the given node as a single node to the groupedNodes array if node.nodes is empty, else it adds every 
     * node in node.nodes as a single node. So it removes the given node form its group and adds it as a single node.
     * @param {*} node 
     * @param {*} groupedNodes 
     */
    removeNodeFromGroup(node, groupedNodes){
        if(node.nodes === undefined){
            groupedNodes.set(node.id, node);
        }
        else {
            for(let groupNode of node.nodes){
                groupedNodes.set(groupNode.id, groupNode);
            }
        }
    }

    /**
     * loops through all edges to check in wich group they need to be
     */
    createEdgesGroup(){
        this.groupedEdges = new Map();
        this.maxNr = 0;
        for(const edge of this.edges){
            this.checkEdgeForGroup(edge);
        }
        this.edges = Array.from(this.groupedEdges.values());
        console.log('this.edges: ', this.edges)
    }

    /**
     * checks what the source and target of each edge needs to be, and than add the edge to its group. 
     * When the sources jobtitle is in this.groupedjobtitles the source is the jobtitle, else the source is the target.
     * The same goes for the target. 
     * @param {*} edge 
     */
    checkEdgeForGroup(edge){
        const source = this.groupedJobtitles.has(edge.jobtitles.source) ? edge.jobtitles.source : edge.ids.source;
        const target = this.groupedJobtitles.has(edge.jobtitles.target) ? edge.jobtitles.target : edge.ids.target;
        this.addEdgeToGroup(edge, source, target);
    }
    
    /**
     * Adds the given edge to its right place in the groupededges map based on the given source and target. 
     * @param {*} edge 
     * @param {string} source 
     * @param {string} target 
     */
    addEdgeToGroup(edge, source, target){
        const key = source + '.' + target;
        const mapValue = this.groupedEdges.get(key);

        // If there is no edge with the given source and target in the groupedEdges map and also no edges array on the edge,
        // the edge gets added to the grouped edges map with the value for edges an array with only this edge.
        if(mapValue === undefined && edge.edges === undefined){     
            this.groupedEdges.set(key, 
                {
                jobtitles: edge.jobtitles,
                ids: edge.ids,
                edges: new Array(edge),
                source: source,
                target: target,
                nr: edge.nr
            });                
        }    
        // If there is an edge with the given source and target in the groupedEdges map and no edges array on the current edge,
        // the current edge needs to be added to the group in the map and the number of edges in that group increase.
        else if(edge.edges === undefined) {
            mapValue.edges.push(edge)
            mapValue.nr += 1;
            this.maxNr = mapValue.nr > this.maxNr ? mapValue.nr : this.maxNr;                    
        }
        // If edge.edges is defined it is already a group, so each value of the group needs to be checked again and added to
        // the right group with the function checkEdgeForGroup so there happens recursion here. 
        else{
            for(let groupedEdge of edge.edges){
                this.checkEdgeForGroup(groupedEdge);
            }
        }            
    }     

    updateDrawnEdges(firstRun) {
        this.drawnEdges = this.svg.select('.edge').selectAll('line');

        this.drawnEdges.attr('x1', (edge) => {
                return edge.source.x;
            })
            .attr('y1', (edge) => {
                return edge.source.y;
            })
            .attr('x2', (edge) => {
                return edge.target.x;
            })
            .attr('y2', (edge) => {
                return edge.target.y;
            })
            .attr('stroke', edge => {
                const alpha = (this.edgeOptions.amountBonus * edge.nr / this.maxNr + this.edgeOptions.basis).toFixed(2);
                // const alpha = 1;
                if(edge.highlighted){
                    return `rgba(255,100,0,${alpha})`;
                }
                return `rgba(0,0,0,${alpha})`;
            })
            .attr('stroke-width', edge => {
                if(edge.highlighted) return this.edgeOptions.highlightedStrokeWidth;
                else return this.edgeOptions.strokeWidth;
            })
            .attr('class', '.edge');

        if (firstRun) this.drawnEdges.attr('transform', `translate(${(this.dimensions.width) / 2},${(this.dimensions.height) / 2})`)
        else this.drawnEdges.attr('transform', `translate(0,0)`)
    }

    updateDrawnNodes(firstRun) {
        this.drawnNodes = this.svg.select('.node').selectAll('circle');
        this.drawnNodes.attr('r', (node) => {
            if(node.nodes === undefined) return this.nodeOptions.minRadius;
            const normalized = (node.nodes.length) / (this.maxNodes)
            return normalized * (this.nodeOptions.maxRadius - this.nodeOptions.minRadius) + this.nodeOptions.minRadius;

        })
            .attr('cx', (d) => {
                return d.x 
            })
            .attr('cy', (d) => {
                return d.y 
            })
            .attr('fill', (node) => {
                if(this.main.dataHandler.personIsSelected(super.nodeToPersonObject(node))){
                    return '#000000';
                }                
                else if(node.nodes != undefined){
                    if(this.main.dataHandler.personIsSelected(node.nodes[0])){
                        return '#000000';
                    }
                }

                return this.scale(node.jobtitle);
            })
            
            // .on("mouseover", (d, i) => {
            //     this.main.visualizer.mouseOverNode(i.id);
            // })
            // .on('mouseout', (d, i) => {
            //     this.main.visualizer.mouseOutNode(i.id);
            // })
            .on('mouseup', (event, node) => {
                this.mouseOutNode(node)
            })
            .on('mousedown', (event, node) => {
                this.mouseDownNode(event, node);
            })
            .attr('class', 'node')
            .attr('stroke-width', (node) => {
                if(node.nodes === undefined) return 1;

                return node.nodes.length
            });

        if(firstRun) this.drawnNodes.attr('transform', `translate(${(this.dimensions.width) / 2},${(this.dimensions.height) / 2})`)
        else this.drawnNodes.attr('transform', `translate(0,0)`)
    }

    changeSelection(){
        this.update();
    }

    mouseOverNode(person){
        // //Get the location of the selected person in the nodes array
        // let nodeIndex = this.personsIndex.get(id);
        // //Set highlighted to true
        // this.nodes[nodeIndex].highlighted = true;

        super.mouseOverNode();
    }

    mouseOutNode(person){
        //Get the location of the selected person in the nodes array
        // let nodeIndex = this.personsIndex.get(id);
        // //Set highlighted to false
        // this.nodes[nodeIndex].highlighted = false;
        
        for(let i = 0; i < this.edgesToHighlight.length; i++){
            let edge = this.mailMap.get(this.edgesToHighlight[i]);
            edge.highlighted = false;
        }

        this.edgesToHighlight = [];
    }

    mouseDownNode(event, node){
        if(event.shiftKey && this.groupOnJobtitle){
            if(this.groupedJobtitles.has(node.jobtitle)){
                console.log('delete jobtitle: ', node.jobtitle)
                this.groupedJobtitles.delete(node.jobtitle);
            } else{
                console.log('add jobtitle: ', node.jobtitle)

                this.groupedJobtitles.add(node.jobtitle);
            }
            console.log(this.groupedJobtitles);
            this.createNodesGroup();
            this.createEdgesGroup();
            this.update();
            return;
        }
        

        if(node.nodes === undefined){
            this.addSelectedNode(node)
        }
        else{
            for(let singleNode of node.nodes){
                this.addSelectedNode(singleNode)
            }
        } 
        this.main.visualizer.changeSelection();
    }

    addSelectedNode(node){
        if(!this.main.dataHandler.personIsSelected(node)){
            this.main.dataHandler.addSelectedPerson(node);
            this.clickedNodes.set(node.id, node);
            let adjacentEmails = this.main.dataHandler.getEmailsForPerson(node.id);

            for(let i = 0; i < adjacentEmails.length; i++){
                this.edgesToHighlight.push(adjacentEmails[i].fromId + '.' + adjacentEmails[i].toId);       
            }
        } 
        else {
            this.main.dataHandler.removeSelectedPerson(node);
            this.clickedNodes.delete(node.id) 
        }     
    }

    mouseUpNode(person){
        // For now just emptying the array works just fine, however in the future this might not be the best  idea

        for(let i = 0; i < this.edgesToHighlight.length; i++){
            let edge = this.mailMap.get(this.edgesToHighlight[i]);
            edge.highlighted = false;
        }

        this.edgesToHighlight = [];
        super.mouseUpNode();
    }

    // Finds node within x and y coordinates
    searchNodesInRectangle([[x0, y0], [x1, y1]]){
        for (let i = 0; i < this.nodes.length; i++){
            const node = this.nodes[i];
            if (node.x <= x1 && node.y <= y1 && node.x >= x0 && node.y >= y0){
                if(this.main.dataHandler.personIsSelected(super.nodeToPersonObject(node))) continue;
                this.main.dataHandler.addSelectedPerson(super.nodeToPersonObject(node));
            }
            else {
                if(!this.main.dataHandler.personIsSelected(super.nodeToPersonObject(node)) || this.clickedNodes.has(node.id)) continue;
                this.main.dataHandler.removeSelectedPerson(super.nodeToPersonObject(node));
            }
        }
        this.main.visualizer.changeSelection();
     }

    addClickedNodes(){
        for(let node in this.clickedNodes){
            this.main.dataHandler.addSelectedPerson(super.nodeToPersonObject(node));
        }
    }

    view() {
        return (
            <div id='node_link_diagram'></div>
        );
    }

}