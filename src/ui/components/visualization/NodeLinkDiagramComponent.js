import m from "mithril";
import * as d3 from "d3";
import Visualization from "./Visualization";

export default class NodeLinkDiagramComponent extends Visualization {

    oninit(vnode) {
        super.oninit(vnode)
        this.scale = 3;
    }

    oncreate(vnode) {

        this.width = 275;
        this.height = 275;


        const persons = vnode.state.dataHandler.getPersons();
        const emails = vnode.state.dataHandler.getEmails();

        let nodes = persons.map(function (d, i) {
            return {
                id: parseInt(d.id)
            }
        });

        let edges = emails.map(function (d) {
            return {
                source: parseInt(d.fromId),
                target: parseInt(d.toId),
                sentiment: parseFloat(d.sentiment)
            }
        })

        let node_link_diagram = d3.select('#node_link_diagram');
        node_link_diagram.append('svg')
            .attr('width', this.width * this.scale)
            .attr('height', this.height * this.scale);

        let simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody)
            .force('center', d3.forceCenter((this.width * this.scale) / 2), (this.height * this.scale) / 2)
            .force('link', d3.forceLink().id(function (d) {
                return d.id
            }).links(edges))
            .on('tick', this.ticked(nodes, edges));
    }

    updateEdges(edges) {
        let svgEdges = d3.select('svg').append('g')
            .selectAll('line')
            .data(edges)
        console.log(this.scale)
        svgEdges.enter()
            .append('line')
            .merge(svgEdges)
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
                if(edge.sentiment < 0){
                    return'rgb(255,0,0)'
                } 
                else if(edge.sentiment > 0){
                    return 'rgb(0,255,0)'
                }
                else if(edge.sentiment == 0){
                    return '#ffffff'
                }
            })
            .attr('stroke-width', function (edge) {
                return Math.abs(edge.sentiment) * 5
            })

        svgEdges.exit().remove()
    }

    updateNodes(nodes) {
        let svgNodes = d3.select('svg').append('g').selectAll('circle').data(nodes)

        svgNodes.enter()
            .append('circle')
            .attr('r', 10)
            .merge(svgNodes)
            .attr('cx', (d) => {
                return d.x * this.scale
            })
            .attr('cy', (d) => {
                return d.y * this.scale
            })
            .attr('transform', `translate(${(this.width * this.scale) / 2},${(this.height * this.scale) / 2})`)

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