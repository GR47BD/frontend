import m from "mithril";
import * as d3 from "d3";
import Visualization from "@/visualize/Visualization";

export default class NodeLinkDiagramComponent extends Visualization {


    oninit(vnode) {
        super.oninit(vnode)
        this.scale = 3;    
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

        const persons = this.main.dataHandler.getPersons();        
        this.main.visualizer.addVisualization('NodeLinkDiagram', this);

        this.allEmails = this.main.dataHandler.getEmails('filtered');
        // console.log(this.allEmails)

        this.jobtitles = this.main.dataHandler.getJobTitles();
        

        this.nodes = persons.map(function (person) {
            return {
                id: person.id,
                jobtitle: person.jobtitle
            }
        });

        // console.log(this.nodes);
        // console.log(this.edges);

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
        
        this.drawnEdges = this.svg.append('g').selectAll('line');
        this.drawnNodes = this.svg.append('g').selectAll('circle');
            

        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(function (d) {
                return d.id
            }))
            // .force("charge", d3.forceManyBody())
            // .force("center", d3.forceCenter(((this.width * this.scale) / 2), (this.height * this.scale) / 2 ))

        // Set node data
        this.drawnNodes = this.drawnNodes.data(this.nodes);
        // Remove any old nodes that were previously drawn in the DOM
        this.drawnNodes.exit().remove();
        // Create new nodes if needed
        this.drawnNodes = this.drawnNodes.enter().append('circle').merge(this.drawnNodes);

        this.step();
    }

    update(){

        

    }

    step(){

        console.log('step')

        // emails of current timeframe
        const emails = this.main.dataHandler.getEmails();

        let shortData = [];

        // for(let i = 0; i < 100; i++){
        //     shortData.push(emails[i]);
        // }

        this.edges = emails.map(function (email) {
            return {
                source: email.fromId,
                target: email.toId,
                sentiment: email.sentiment,     
                date: email.date
            }
        })

       // this.allEmails also contains x and y display data

        // this.edges = [];

        // Go through all emails, compare to emails in current timeframe, and push the emails that exist in the current timeframe
        // for(const email of emails){
        //     // console.log(email)
        //     let newEmail = this.allEmails.find(item => item.source.id === email.fromId 
        //                         && item.target.id === email.toId 
        //                         && this.main.dataHandler.datesAreEqual(item.date, email.date)
        //                         )
        //         // console.log(newEmail);
        //     if(newEmail !=='undefined') this.edges.push(newEmail);           
            
        // }

        // console.log(this.edges)

        // Set edge data
        this.drawnEdges = this.drawnEdges.data(this.edges);
        // Remove any old edges drawn on the DOM
        this.drawnEdges.exit().remove();
        // Create new edges if needed
        this.drawnEdges = this.drawnEdges.enter().append('line').merge(this.drawnEdges)

        

        // Set all nodes
        this.simulation.nodes(this.nodes)
        // Set edges
        this.simulation.force('link').links(this.edges);
        // this.simulation.force("center", d3.forceCenter(((this.width * this.scale) / 2), (this.height * this.scale) / 2 ));
        this.simulation.on('tick', this.ticked());
        // this.simulation.restart();
              

    }
    

    updateEdges() {            

        this.drawnEdges.attr('x1', (edge) => {
                return edge.source.x * this.scale
            })
            .attr('y1', (edge) => {
                return edge.source.y * this.scale
            })
            .attr('x2', (edge) => {
                return edge.target.x * this.scale
            })
            .attr('y2', (edge) => {
                return edge.target.y * this.scale
            })
            .attr('transform', `translate(${(this.width * this.scale) / 2},${(this.height * this.scale) / 2})`)
            .attr('stroke', function (edge) {
                return '#c0c0c0'
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
            // .attr('stroke-opacity', 0.5)
    }

    updateNodes() {

        this.drawnNodes.attr('r', 5)
            .attr('cx', (d) => {
                return d.x * this.scale
            })
            .attr('cy', (d) => {
                return d.y * this.scale
            })
            .attr('transform', `translate(${(this.width * this.scale) / 2},${(this.height * this.scale) / 2})`)
            .attr('fill', (node) => {
                const scale = d3.scaleOrdinal(d3.schemeCategory10);
                scale.domain(this.jobtitles);
                return scale(node.jobtitle);
            });
    }

    ticked() {
        this.updateEdges()
        this.updateNodes()
    }


    view() {
        return (
            <div id='node_link_diagram'></div>
        );
    }
}