import m from "mithril";
import * as d3 from "d3";
import Visualization from "@/visualize/Visualization";


export default class NodeLinkDiagramComponent extends Visualization {


    oninit(vnode) {
        super.oninit(vnode)
        this.scale = 2;    
        this.width = 500;
        this.height = 500;    
        this.allEmails = [];
        this.filteredEmails = [];
        this.currentEmails = [];
        this.jobtitles = [];
        this.nodes = [];
        this.edges = [];
        this.svg = undefined;
        this.svgEdges = undefined;

        
    }

    oncreate(vnode) {       
        seedrandom('abcd');

        const persons = this.main.dataHandler.getPersons('filtered');       
        
        this.main.visualizer.addVisualization('NodeLinkDiagram', this);

        this.allEmails = this.main.dataHandler.getEmails('filtered');

        this.jobtitles = this.main.dataHandler.getJobTitles();
        

        this.nodes = persons.map( (person) => {
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

        // console.log(this.nodes);
        // console.log(this.edges);

        //Remove edges that go between the same nodes
        // this.filteredEmails = this.emails.filter((item1,index,array)=>array.findIndex(item2=>(item1.fromId === item2.fromId && item1.toId === item2.toId))===index)

        // this.edges = this.allEmails.map(function (email) {
        //     return {
        //         source: email.fromId,
        //         target: email.toId,
        //         sentiment: email.sentiment,     
        //         date: email.date
        //     }
        // })


        this.allEmails = [...this.edges];

        // console.log(this.allEmails)

        // console.log(this.edges);

        let node_link_diagram = d3.select('#node_link_diagram');
        this.svg = node_link_diagram.append('svg')
            .attr('width', this.width * this.scale)
            .attr('height', this.height * this.scale);          
        
        this.drawnEdges = this.svg.append('g').attr("class", "edge").selectAll('line');
        this.drawnNodes = this.svg.append('g').attr("class", "node").selectAll('circle');
            

        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(function (d) {
                return d.id
            }))
            .force('charge', d3.forceManyBody().strength(-20))
            .force("center", d3.forceCenter(((this.width * this.scale) / 4), (this.height * this.scale) / 4).strength(0.8))
            .force('collide', d3.forceCollide(d => 10).strength(0.7).iterations(10))
            .tick(1)

            this.step();

            this.ticked(true);
            
    }
    

    step() {
        console.log('step')
        this.update();
    }

    update(){

        this.drawnEdges = this.svg.select('.edge').selectAll('line');
        this.drawnNodes = this.svg.select('.node').selectAll('circle');


        // emails of current timeframe
        let emails = this.main.dataHandler.getEmails();

        // let shortData = [];

        // for(let i = 0; i < 100; i++){
        //     shortData.push(emails[i]);
        // }

        emails = emails.map(email => {
            return {
                source: email.fromId,
                target: email.toId,
                sentiment: email.sentiment,     
                date: email.date,
                nr: 1
            }
        });

        const mailMap = new Map();
        this.maxNr = 0;

        for(const email of emails) {
            const key = email.source + "." + email.target;
            const mapValue = mailMap.get(key)

            if(mapValue === undefined) {
                mailMap.set(key, email);
                this.maxNr = 1;
            }
            else {
                mapValue.nr += 1;
                this.maxNr = mapValue.nr > this.maxNr ? mapValue.nr : this.maxNr;
            }
        }

        this.edges = Array.from(mailMap.values());

        // Set edge data
        // Remove any old edges drawn on the DOM
        //this.svg.append('g').selectAll('line')
        this.drawnEdges.data(this.edges).exit().remove();
        // Create new edges if needed
        this.drawnEdges.data(this.edges).enter().append('line');

        // Set node data
        // Remove any old nodes that were previously drawn in the DOM
        this.drawnNodes.data(this.nodes).exit().remove();
        // Create new nodes if needed
        this.drawnNodes.data(this.nodes).enter().append('circle');
        
        //this.simulation.restart();

        const linkStrength = 0.9 - (this.edges.length / 3000) * 0.7;
        const centerStrength = 1 - (this.edges.length / 3000) * 0.3;
        // Set all nodes
        this.simulation.nodes(this.nodes)

        this.simulation.force('link').links(this.edges);
        this.simulation.force('link').strength(link => (link.nr/this.maxNr)*.3 + linkStrength);
        console.log(`link (basis): ${linkStrength.toFixed(2)}, center: ${centerStrength.toFixed(2)}`);
        this.simulation.force('center').strength(centerStrength);
        // Set edges
        this.simulation.restart();
        this.simulation.on('tick', this.ticked());
        console.timeEnd('update-node');
    }
    

    updateEdges(firstRun) {
        this.drawnEdges = this.svg.select('.edge').selectAll('line');

        this.drawnEdges.attr('x1', (edge) => {
                //return this.nodes[edge.source-1].x * this.scale
                return edge.source.x * this.scale;
            })
            .attr('y1', (edge) => {
                //return this.nodes[edge.source-1].y * this.scale
                return edge.source.y * this.scale;
            })
            .attr('x2', (edge) => {
                //return this.nodes[edge.target-1].x * this.scale
                return edge.target.x * this.scale
            })
            .attr('y2', (edge) => {
                //return this.nodes[edge.target-1].y * this.scale
                return edge.target.y * this.scale
            })
            .attr('stroke', edge => {
                const alpha = (0.4 * edge.nr / this.maxNr + 0.2).toFixed(2);
                return `rgba(0,0,0,${alpha})`
                // if(edge.sentiment < 0){
                //     return'rgb(255,0,0)'
                // } 
                // else if(edge.sentiment > 0){
                //     return 'rgb(0,255,0)'
                // }
                // else if(edge.sentiment == 0){
                //     return '#000000'
                // }
            })
            .attr('stroke-width', function (edge) {
                return 0.5 // Math.abs(edge.sentiment) * 5
            })

        if(firstRun) this.drawnEdges.attr('transform', `translate(${(this.width * this.scale) / 2},${(this.height * this.scale) / 2})`)
        else this.drawnEdges.attr('transform', `translate(0,0)`)
    }


    updateNodes(firstRun) {

                //Tryin to group the data
        // let coords = {};
        // let groups = []

        // this.drawnNodes.each(node => {
        //     if(groups.indexOf(node.jobtitle) == -1){
        //         groups.push(node.jobtitle);
        //         coords[node.jobtitle] = []
        //     }
        //     coords[node.jobtitle].push({x: node.x, y:node.y});
        // })

        // console.log(groups);
        // console.log(coords)
        // let centroids = {}

        // for(let group in coords){
        //     let groupNodes = coords[group];
        //     let n = groupNodes.length;
        //     let cx = 0;
        //     let tx = 0;
        //     let cy = 0;
        //     let ty = 0;
        //     groupNodes.forEach(node => {
        //         tx += node.x;
        //         ty += node.y;
        //     });

        //     cx = tx / n;
        //     cy = ty / n;

        //     centroids[group] = {x: cx, y: cy}
        // }

        // let minDistance = 10;
        // this.drawnNodes.each(node => {
        //     let cx = centroids[node.jobtitle].x;
        //     let cy = centroids[node.jobtitle].y;
        //     let x = node.x;
        //     let y = node.y;
        //     let dx = cx - x;
        //     let dy = cy - y;

        //     let r = Math.sqrt(dx*dx + dy*dy);

        //     if(r > minDistance){
        //         node.x = x * 0.9 + cx * 0,1;
        //         node.y = y * 0.9 + cy * 0.1;
        //     }
        // }) 
        this.drawnNodes = this.svg.select('.node').selectAll('circle');
        this.drawnNodes.attr('r', 5)
            .attr('cx', (d) => {
                return d.x * this.scale
            })
            .attr('cy', (d) => {
                return d.y * this.scale
            })
            .attr('fill', (node) => {
                if(node.highlighted) return '#000000';
                const scale = d3.scaleOrdinal(d3.schemeCategory10);
                scale.domain(this.jobtitles);
                return scale(node.jobtitle);
            })
            
            .on("mouseover", (d, i) => {
                this.main.visualizer.selectNode(i.id);
                // console.log(i.name)
                // console.log(i)
            })
            .on('mouseout', (d, i) => {
                this.main.visualizer.deselectNode(i.id);
            })

        if(firstRun) this.drawnNodes.attr('transform', `translate(${(this.width * this.scale) / 2},${(this.height * this.scale) / 2})`)
        else this.drawnNodes.attr('transform', `translate(0,0)`)
    }

    selectNode(id){
        //Get the location of the selected person in the nodes array
        let nodeIndex = this.personsIndex.get(id);
        //Set highlighted to true
        this.nodes[nodeIndex].highlighted = true;
        super.selectNode();
    }

    deselectNode(id){
        //Get the location of the selected person in the nodes array
        let nodeIndex = this.personsIndex.get(id);
        //Set highlighted to false
        this.nodes[nodeIndex].highlighted = false;
        super.deselectNode();
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