import m from "mithril";
import * as d3 from "d3";
import dataCSV from "@/data/enron-v1.js";
import DataHandler from "@/DataHandler.js"

export default class TestComponent {
    
    oncreate(vnode){
       
        let dataHandler = new DataHandler(dataCSV);
        let personsData = dataHandler.getPersons();
        console.log(personsData);
        console.log(dataHandler.getEmailsForPerson(personsData[0]))

        let test_data = [10,20,30,40];
        let width = 1000;
        const scaleFactor = 10;
        const barHeight = 20;

        let graph = d3.select('#histogram')
        .append('svg')
        .attr('width', width)
        .attr("height", barHeight * test_data.length);

        let bar = graph.selectAll('g')
        .data(test_data)
        .enter()
        .append('g')
        .attr("transform", function(d, i) {
            return "translate(0," + i * barHeight + ")";
        });

        bar.append('rect')
        .attr("width", function(d) {
            return d * scaleFactor;
        })
        .attr("height", barHeight - 1)
        .attr('class', 'bar');

        bar.append("text")
        .attr("x", function(d) { return (d*scaleFactor); })
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function(d) { return d; })
        .attr('class', 'bartext');
    }
    constructor(){

    }

    view() {
        return (
            <div id='histogram'></div>
        );
    }
}

