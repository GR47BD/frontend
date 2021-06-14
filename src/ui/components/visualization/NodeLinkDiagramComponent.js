import m from "mithril";
import * as d3 from "d3";
import Visualization from "@/visualize/Visualization";
import { group, select } from "d3";


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
            minRadius: 18,
            maxRadius: 45,
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
            amountBonus: 0.4,
            defaultStroke: (alpha) => `rgba(70,130,180,${alpha})`,
            highlightedStroke: (alpha) => `rgba(255,100,0,${alpha})`
        }

        this.nodeOptions = {
            minRadius: 5,
            maxRadius: 35,
            selectedFill: '#000000'
        }

        this.simulationSettings = {
            startAlpha: 1,
            alphaTarget: 0.01,
            alphaDecay: 0.05,
            finalPositionThreshold: 0.001,            


        
            maxAlpha: 0.7,
            resetSimulationThreshold: 0.01            
        }       

        this.maxNrNodes = 0;
        this.maxNrEdges = 0;

        this.nodes = [];
        this.edges = [];

        this.edgesToHighlight = []
        this.jobtitles = [];

        this.usingBrushTool = false;

        this.groupOnJobtitle = true;
        this.startGrouponJobtitle = false;

        this.previousNodes = [];

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

        let node_link_diagram = d3.select('#node_link_diagram');
        node_link_diagram.attr('class', 'svg-container');
        this.svg = node_link_diagram.append('svg')
            .attr('viewBox', '0 0 ' + this.dimensions.width + ' ' + this.dimensions.height) 
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr('class', 'svg-content')
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
        // this.svg.attr('margin', 'auto');

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
            .force('link', d3.forceLink().id(node => {return node.id}))
            .force("center", d3.forceCenter(this.centerForce.x, this.centerForce.y).strength(this.centerForce.strength))
            .tick(this.forces.ticks);

        this.simulation.alphaTarget(this.simulationSettings.alphaTarget).alphaDecay(this.simulationSettings.alphaDecay).velocityDecay(0.5);        

        this.drawnEdges = this.svg.select('.edge').selectAll('line');
        this.drawnNodes = this.svg.select('.node').selectAll('circle');

        // this.update(true);
    }

    step(firstRun = false) {
        this.update(firstRun);
    } 

    /**
     * This function updates the visualization.
     * @param {boolean} recalculateForces defines if the simulation needs to be calculated fully again. Defaults to false.
     */
    update(recalculateForces = false){
		if(this.main.dataHandler.data.length === 0) return;
        if(this.simulation === undefined) return this.oncreate();
        
        //If recalculate forces is equal to true then the datachangedAmunt should be 1 else it will be based on the datahandler.
        let dataChangedAmount = recalculateForces ? 1 : this.main.dataHandler.dataChangedAmount;          

        //If the data has changed in the datahandler the data should be updated
        if(this.main.dataHandler.dataChanged){
            console.log('dataChanged')
            this.updateData(dataChangedAmount);
        }  

        console.log(this.nodes);

        this.updateSimulation(dataChangedAmount);    
        this.updateForces();
        super.update();
    }

    changeSelection(){
        this.update();
    }

    /**
     * This function updates the simulation with the correct new data
     * @param {float} dataChangedAmount a value between 0 and 1 of how much the data has changed in the new update.
     */
    updateSimulation(dataChangedAmount){
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

        this.drawnNodes = this.svg.select('.node').selectAll('circle');
        this.drawnEdges = this.svg.select('.edge').selectAll('line');

        //The events and classes only need to be set once hence we do it here instead of in updateDrawnNodes() or updateDrawnEdges
        this.drawnNodes.on("mouseover", (event, node) => {
                this.mouseOverNode(node);
            })
            .on('mouseout', (event, node) => {
                this.mouseOutNode(node);
            })
            .on('mouseup', (event, node) => {
                this.mouseUpNode(node)
            })
            .on('mousedown', (event, node) => {
                this.mouseDownNode(event, node);
            })
            .attr('class', 'node')

        this.drawnEdges.attr('class', '.edge');
   

        // if(this.main.dataHandler.dataChanged){            
        //     let newAlpha = (dataChangedAmount * (0.7 - this.simulationSettings.alphaTarget)) + this.simulationSettings.alphaTarget + this.simulationSettings.finalPositionThreshold;
        //     let resetSimulationThreshold = 0.01;
        //     if(this.simulationSettings.alphaTarget - newAlpha > resetSimulationThreshold){
        //         console.log('newAlpha = ' + newAlpha);
        //         this.simulation.alpha(newAlpha);
                
        //     }
        //     // this.simulation.restart();        
        // } 

        this.simulation.on('tick', () => {
           

            this.updateDrawnNodes();
            this.updateDrawnEdges();
        });
    }

    /**
     * This function updates all forces for the simulation that are based on changing variables.
     */
    updateForces(){
        const linkStrength = this.linkForce.basis - (this.edges.length / this.linkForce.divider) * this.linkForce.penalty;
        const centerStrength = this.centerForce.basis - (this.edges.length / this.centerForce.divider) * this.centerForce.penalty;

        this.simulation.force('link').links(this.edges); 


        let weightScale = d3.scaleLinear().domain(d3.extent(this.edges, (edge) => this.maxNrEdges - edge.nr)).range([.1, 2])
        this.simulation.force('link').strength(edge => weightScale(edge.nr));

        this.simulation.force('center').strength(centerStrength)
        this.simulation.force('collide', d3.forceCollide(node => {
                    if(node.nodes === undefined) return this.collideForce.minRadius;
                    else return this.normalizeValue(node.nodes.length, this.maxNrNodes, this.collideForce.minRadius, this.collideForce.maxRadius);
                })
                .strength(this.collideForce.strength)
                .iterations(this.collideForce.iterations));

    }

    /**
     *  This function updates the data used by this visualization
     */
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
        
        console.log('inside updateData'+ this.simulation.alpha());
           
        let newAlpha = (dataChangedAmount * (0.7 - this.simulationSettings.alphaTarget)) + this.simulationSettings.alphaTarget + this.simulationSettings.finalPositionThreshold;
        let resetSimulationThreshold = 0.001;
        // console.log(newAlpha + ', ' + (resetSimulationThreshold + this.simulationSettings.alphaTarget));
        if(newAlpha > resetSimulationThreshold + this.simulationSettings.alphaTarget){
            // console.log(' updateData ' + newAlpha);
            
            this.simulation.alpha(newAlpha);
            
        }
     
        // let newAlpha = (dataChangedAmount * (0.5 - this.simulationSettings.alphaTarget)) + this.simulationSettings.alphaTarget;
        this.simulation.alpha(newAlpha);
    }

    /**
     * This function updates the data of the nodes by getting the new data from the datahandler class and comparing it to the 
     * data already available in the visualization. It then uses union and intersection to get an array with the data that 
     * needs to be kept and the data that needs to be added.
     */
    updateNodes(){

        // if(this.simulation.alpha() <= this.simulationSettings.alphaTarget + this.simulationSettings.finalPositionThreshold){
        //     this.nodes = [...this.previousNodes];
        // }


        const persons = this.main.dataHandler.getPersons();
        
        let newNodes = [];

        this.nodes = this.compareLists(this.nodes, persons, true);
        newNodes = this.compareLists(persons, this.nodes);

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

        console.log(this.previousNodes);
        this.personsIndex = new Map();
        for(let i = 0; i < this.nodes.length; i++){
            this.personsIndex.set(this.nodes[i].id, i);
        }

        this.previousNodes = [...this.nodes];
    }

    /**
     * This function updates the data of the edges by getting new data from the datahandler and mapping it to the right data structure
     */
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
        this.mailMap = new Map();
        this.maxNrEdges = 0;
        
        for(const email of this.edges) {
            const key = email.source + "." + email.target;
            const mapValue = this.mailMap.get(key)

            if(mapValue === undefined) {
                this.mailMap.set(key, email);
                this.maxNrEdges = 1;
            }
            else {
                mapValue.nr += 1;
                this.maxNrEdges = mapValue.nr > this.maxNrEdges ? mapValue.nr : this.maxNrEdges;
            }
        }

        this.edges = Array.from(this.mailMap.values());
    }

    /**
     * loops through all nodes to check if they need to be added from a group or removed from a group
     */
    createNodesGroup(){
        let groupedNodes = new Map();
        this.maxNrNodes = 0;

        for(let node of this.nodes){
            if(this.groupedJobtitles.has(node.jobtitle)){
                this.addNodeToGroup(node, groupedNodes);
            } 
            else {
                this.removeNodeFromGroup(node, groupedNodes);
            }            
        }   

        this.nodes = Array.from(groupedNodes.values())
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

            groupedNodes.set(node.jobtitle, 
                {
                    id: node.jobtitle, 
                    jobtitle: node.jobtitle, 
                    x: this.dimensions.width / 2,  
                    y: this.dimensions.height / 2, 
                    groupIsSelected: false,  
                    nodes: new Array(node)
                })
        }  
        // If there is no group but there are nodes in node.nodes, the group of this jobtitle needs to 
        // be added with as nodes the given node.nodes.
        else if(group === undefined){

            groupedNodes.set(node.jobtitle, {id: node.jobtitle, jobtitle: node.jobtitle, x: node.x, y: node.y, groupIsSelected: node.groupIsSelected, nodes: node.nodes})
            this.maxNrNodes = this.maxNrNodes > node.nodes.length ? this.maxNrNodes : node.nodes.length;
        }
        // If node.nodes is undefined but there is a group, this node needs to be pushed to the group. 
        else if(node.nodes === undefined) {
                group.nodes.push(node)
                this.maxNrNodes = this.maxNrNodes > group.nodes.length ? this.maxNrNodes : group.nodes.length;
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
        this.maxNrEdges = 0;
        for(const edge of this.edges){
            this.checkEdgeForGroup(edge);
        }
        this.edges = Array.from(this.groupedEdges.values());
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
                nr: edge.nr,
                highlighted: false,
            });                
        }    
        // If there is an edge with the given source and target in the groupedEdges map and no edges array on the current edge,
        // the current edge needs to be added to the group in the map and the number of edges in that group increase.
        else if(edge.edges === undefined) {
            mapValue.edges.push(edge)
            mapValue.nr += 1;
            this.maxNrEdges = mapValue.nr > this.maxNrEdges ? mapValue.nr : this.maxNrEdges;                    
        }
        // If edge.edges is defined it is already a group, so each value of the group needs to be checked again and added to
        // the right group with the function checkEdgeForGroup so there happens recursion here. 
        else{
            for(let groupedEdge of edge.edges){
                this.checkEdgeForGroup(groupedEdge);
            }
        }            
    }     

    /**
     * This function updates the values of the displayed nodes in the visualization.
     */
    updateDrawnNodes() {
        this.drawnNodes.attr('r', (node) => node.nodes === undefined ? 
                    this.nodeOptions.minRadius : this.normalizeValue(node.nodes.length, this.maxNrNodes, this.nodeOptions.minRadius, this.nodeOptions.maxRadius)) 
            .attr('cx', (d) => {
                return d.x 
            })
            .attr('cy', (d) => {
                return d.y 
            })
            .attr('fill', (node) => {
                let selected = node.nodes === undefined ? this.main.dataHandler.personIsSelected(node) : this.isGroupSelected(node);
                return selected ? this.nodeOptions.selectedFill : this.scale(node.jobtitle);
            })
    }    

    /**
     * This function updates the values of the displayed edges in the visualization
     */
    updateDrawnEdges() {

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
                const alpha = (this.edgeOptions.amountBonus * edge.nr / this.maxNrEdges + this.edgeOptions.basis).toFixed(2);
                return edge.highlighted ? this.edgeOptions.highlightedStroke(alpha) : this.edgeOptions.defaultStroke(alpha);

            })
            .attr('stroke-width', edge => {
                return edge.highlighted ? this.edgeOptions.highlightedStrokeWidth : this.edgeOptions.strokeWidth;
            })
    }

    /**
     * Checks if all the nodes in the given node group are selected, if so node.groupIsSelected will be set true and the return will be true 
     * else the return will be false.
     * @param {*} node 
     * @returns if the group of nodes in node is selected or not.
    */  
    isGroupSelected(node){
        let  selected = true;
        for(let groupedNode of node.nodes){
            if(!this.main.dataHandler.personIsSelected(groupedNode)){
                selected = false;
                break;
            }
        }
        node.groupIsSelected = selected;
        return selected;        
    }

    mouseOverNode(node){
        //Nothing needs to happen right now
    }

    mouseOutNode(node){
        this.deselectEdges();
    }

    mouseDownNode(event, node){
        if(event.shiftKey && this.groupOnJobtitle){
            this.groupNode(node);
        }
        else{
            this.toggleNodeSelection(node);
        }        
    }

    mouseUpNode(node){
        this.deselectEdges();
    }

    groupNode(node){
        if(this.groupedJobtitles.has(node.jobtitle)){
            this.groupedJobtitles.delete(node.jobtitle);
        } 
        else{
            this.groupedJobtitles.add(node.jobtitle);
        }
        this.createNodesGroup();
        this.createEdgesGroup();
        this.update(false, true);
    }

    toggleNodeSelection(node){
        if(node.nodes === undefined){
            if(!this.main.dataHandler.personIsSelected(node)) this.addSelectedNode(node);
            else this.removeSelectedNode(node);
        }
        else{            
            for(let singleNode of node.nodes){
                if(node.groupIsSelected) this.removeSelectedNode(singleNode);
                else if(!this.main.dataHandler.personIsSelected(singleNode)) this.addSelectedNode(singleNode)
            }

            node.groupIsSelected = !node.groupIsSelected;
        }

        this.selectEdges(node);
        
        this.main.visualizer.changeSelection();
    }

    addSelectedNode(node){
        this.main.dataHandler.addSelectedPerson(node);
        this.clickedNodes.set(node.id, node);
    }

    removeSelectedNode(node){
        this.main.dataHandler.removeSelectedPerson(node);
        this.clickedNodes.delete(node.id) 
    }

    selectEdges(node){
        let adjacentEdges = this.edges.filter(edge => edge.source.id === node.id || edge.target.id === node.id);

        for(let edge of adjacentEdges){
            this.edgesToHighlight.push(edge.source.id + '.' + edge.target.id);       
            this.groupedEdges.get(edge.source.id + '.' + edge.target.id).highlighted = true;
        }
    }
    
    deselectEdges(){
        for(let i = 0; i < this.edgesToHighlight.length; i++){
            let edge = this.groupedEdges.get(this.edgesToHighlight[i]);
            edge.highlighted = false;
        }

        this.edgesToHighlight = [];
    }

    brushed({selection}){
        this.usingBrushTool = true
        if(selection) this.searchNodesInRectangle(selection);
        else {
            console.log("selection empty")
        }
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

    //This function can be used to get the union or the intersection between two arrays
    compareLists = (list1, list2, isUnion = false) => list1.filter((set => a => isUnion === set.has(a.id))(new Set(list2.map(b => b.id))));

    //This function can be used to normalize a value
    normalizeValue = (amount, maxAmount, minValue, maxValue) => (amount) / (maxAmount) * (maxValue - minValue) + minValue;


    view() {
        return (
            <div id='node_link_diagram' ></div>
        );
    }

}