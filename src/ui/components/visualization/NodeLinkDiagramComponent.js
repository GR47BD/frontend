import m from "mithril";
import * as d3 from "d3";
import Visualization from "@/visualize/Visualization";
import { svg } from "d3";

export default class NodeLinkDiagramComponent extends Visualization {

    

    oninit(vnode) {
        super.oninit(vnode)
        this.scale = 3;        
    }

    oncreate(vnode) {

        this.width = 275;
        this.height = 275;        

        const persons = this.main.dataHandler.getPersons();        
        

        let email1 = this.main.dataHandler.getEmailDateByPercentile(0.1);
        let email2 = this.main.dataHandler.getEmailDateByPercentile(0.9);
        // Gets emails from 10% to 30% of the time

        const emails = this.main.dataHandler.getEmailsByDate(email1, email2);
        // console.log(emails)

        this.jobtitles = this.main.dataHandler.getJobTitles();
        

        let nodes = persons.map(function (person) {
            return {
                id: person.id,
                jobtitle: person.jobtitle
            }
        });

        console.log(nodes);

        let filteredEmails = emails.filter((item1,index,array)=>array.findIndex(item2=>(item1.fromId === item2.fromId && item1.toId === item2.toId))===index)



        let edges = filteredEmails.map(function (email) {
            return {
                source: email.fromId,
                target: email.toId,
                sentiment: email.sentiment            }
        })


        console.log(edges);

        let node_link_diagram = d3.select('#node_link_diagram');
        this.svg = node_link_diagram.append('svg')
            .attr('width', this.width * this.scale)
            .attr('height', this.height * this.scale)
            .call(d3.zoom().extent([[0, 0], [this.width, this.height]])
            .scaleExtent([1, 8]).on('zoom', ({transform}) => {
                this.svg.attr('transform', transform)
        }));
            
        this.svgEdges = d3.select('svg').append('g')
            .selectAll('line').data(edges)
            

        let simulation = d3.forceSimulation(nodes)
            // .force('charge', d3.forceManyBody())
            // .force('center', d3.forceCenter((this.width * this.scale) / 2), (this.height * this.scale) / 2)
            .force('link', d3.forceLink().id(function (d) {
                return d.id
            }).links(edges))
            .on('tick', this.ticked(nodes, edges));
    }

    

    updateEdges(edges) {
        
        this.svgEdges.enter()
            .append('line')
            .merge(this.svgEdges)
            .attr('x1', (edge) => {
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

        this.svgEdges.exit().remove()
    }

    updateNodes(nodes) {
        let svgNodes = d3.select('svg').append('g').selectAll('circle').data(nodes)

        svgNodes.enter()
            .append('circle')
            .attr('r', 5)
            .merge(svgNodes)
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

        svgNodes.exit().remove()
    }

    ticked(nodes, edges) {
        this.updateEdges(edges)
        this.updateNodes(nodes)
    }


    view() {
        return (
            <div id='node_link_diagram'></div>
        );
    }
}