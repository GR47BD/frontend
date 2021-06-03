import m from "mithril";
import * as d3 from "d3";
import Visualization from "@/visualize/Visualization";
import DataClusterer from "@/DataClusterer";

export default class MassiveSequenceComponent extends Visualization {
    constructor(){
        super();

        this.sizes = {
            personsWidth: 30,
            dateHeight: 40
        }

        this.dateOptions = {
            number: 5
        }

        this.indicatorActive = false;
    }

    oninit(vnode) {
        super.oninit(vnode);
        this.dataClusterer = new DataClusterer(this.main);
    }

    oncreate() {
        this.main.visualizer.addVisualization('MassiveSequenceComponent', this);

        this.canvas = document.getElementById("massive-sequence");
        this.graphics = this.canvas.getContext("2d");
        this.canvas.addEventListener("mouseenter", () => {
            this.hovering = true;
            this.step();
        });
        this.canvas.addEventListener("mouseleave", () => {
            this.hovering = false;
            this.deactivateIndicator();
            this.step();
        });
        this.canvas.addEventListener("mousemove", e => {
            this.handleMouseMove(e.offsetX, e.offsetY);
        })
        
        this.update();
    }

    activateIndicator() {
        document.getElementById("massive-sequence-indicator").classList.remove("inactive");
        this.indicatorActive = true;
    }

    deactivateIndicator() {
        document.getElementById("massive-sequence-indicator").classList.add("inactive");
        this.indicatorActive = false;
    }

    handleMouseMove(x, y) {
        if(x >= this.sizes.personsWidth && !this.indicatorActive) {
            this.activateIndicator();
        }
        else if(x < this.sizes.personsWidth && this.indicatorActive) {
            this.deactivateIndicator();
        }

        if(this.indicatorActive) {
            const start = this.main.dataHandler.timeSpan.startTime;
            const end = this.main.dataHandler.timeSpan.endTime;
            const date = this.dateToString(this.approximateDate(start, end, (x-this.sizes.personsWidth)/(this.width-this.sizes.personsWidth)))

            document.getElementById("massive-sequence-indicator").style.left = `${x}px`;
            document.getElementById("massive-sequence-indicator-date").innerText = date;
        }
    }

    step() {
        const startTime = new Date().getTime();
        const bounds = this.canvas.parentNode.getBoundingClientRect();

        this.width = bounds.width;
        this.height = this.order.size * 2 + this.sizes.dateHeight;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.drawView(this.sizes.personsWidth, 0, this.width - this.sizes.personsWidth, this.height - this.sizes.dateHeight);
        this.drawPersons();
        this.drawDates(this.dateOptions.number);
        
        const endTime = new Date().getTime();
        console.log(`update in ${endTime-startTime}ms`);
    }

    drawPersons() {
        for(const person of this.persons) {
            const y = this.order.get(person.id) * 2;

            this.graphics.fillStyle = this.scale(person.jobtitle);
            this.graphics.fillRect(0, y, this.sizes.personsWidth, 1);
        }
    }

    drawDates(number) {
        const start = this.main.dataHandler.timeSpan.startTime;
        const end = this.main.dataHandler.timeSpan.endTime;

        for(let i = 0; i < number; i++) {
            const x = this.sizes.personsWidth + Math.round((this.width - this.sizes.personsWidth - 10) / (number - 1)) * i;
            const date = this.approximateDate(start, end, i/(number - 1));
            this.graphics.rotate(Math.PI/2);
            this.graphics.fillStyle = this.hovering ? "gray" : "black";
            this.graphics.fillText(this.dateToString(date), this.height - this.sizes.dateHeight, -x);
            this.graphics.rotate(-Math.PI/2);
        }
    }

    drawView(x, y, width, height) {
        const emails = this.main.dataHandler.getEmails();
        const start = this.main.dataHandler.timeSpan.startTime;
        const end = this.main.dataHandler.timeSpan.endTime;

        for(const email of emails) {
            const edgeX = this.approximateX(start, end, email.date.getTime(), width);
            const y1 = Math.round(this.order.get(email.fromId) / this.order.size * height);
            const y2 = Math.round(this.order.get(email.toId) / this.order.size * height);
            
            const edgeY = Math.min(y1, y2);
            const edgeHeight = Math.max(y1, y2) - edgeY;
            const gradient = this.graphics.createLinearGradient(0, edgeY + y, 0, edgeHeight + edgeY + y);

            if(y1 >= y2) {
                gradient.addColorStop(0, "blue");
                gradient.addColorStop(1, "yellow");
            } 
            else {
                gradient.addColorStop(0, "yellow");
                gradient.addColorStop(1, "blue");
            }

            if(edgeX < 0) continue;

            this.graphics.globalAlpha = 0.2;
            this.graphics.fillStyle = gradient;
            this.graphics.fillRect(x + edgeX, y + edgeY, 1, edgeHeight);
            this.graphics.globalAlpha = 1;
        }
    }

    update(){
        super.update();

        this.persons = this.main.dataHandler.getPersons()
        const startTime = new Date().getTime();
        this.order = this.dataClusterer.sortDataByClusters();
        this.jobtitles = this.main.dataHandler.getJobTitles();
        this.scale = d3.scaleOrdinal(d3.schemeCategory10);
        this.scale.domain(this.jobtitles);
        this.step();
    }

    approximateX(start, end, time, width) {
        return Math.round((time - start) / (end - start) * width);
    }

    approximateDate(start, end, percentile) {
        return new Date(Math.round((end - start) * percentile + start));
    }

    dateToString(date) {
        return `${date.getDate()}-${date.getMonth()}-${("" + date.getFullYear()).substring(2,4)}`;
    }

    view() {
        return (
            <div class="massive-sequence-container">
                <canvas id='massive-sequence'></canvas>
                <div class="indicator inactive" id="massive-sequence-indicator">
                    <div class="line"></div>
                    <div class="date" id="massive-sequence-indicator-date">AB-AB-AB</div>
                </div>
            </div>
        );
    }
}