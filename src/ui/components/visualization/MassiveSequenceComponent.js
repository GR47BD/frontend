import m from "mithril";
import * as d3 from "d3";
import Visualization from "@/visualize/Visualization";
import DataClusterer from "@/DataClusterer";

export default class MassiveSequenceComponent extends Visualization {
    constructor(){
        super();

        this.sizes = {
            personsWidth: 30,
            dateHeight: 40,
            personHeight: 2
        }

        this.dateOptions = {
            number: 5
        }

        this.styleOptions = {
            useGradient: false,
            gradientColor1: "#0000FF",
            gradientColor2: "#FFA500",
            gradientColor3: "#FFFF00",
            color: "#4682B4",
            textColor: "#000000",
            textHoverColor: "#808080",
            indicatorColor: "#000000",
            alpha: 0.2
        }

        this.indicatorActive = false;
    }

    // Is called when this component is initialized.
    oninit(vnode) {
        super.oninit(vnode);
        this.dataClusterer = new DataClusterer(this.main);
    }

    // Is called when the component is created.
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
        });
        
        new ResizeObserver(() => this.step()).observe(this.canvas.parentElement.parentElement.parentElement.parentElement);
        
        this.update();
    }

    resize() {
        this.step();
    }

    // Actives the mouse indicator.
    activateIndicator() {
        document.getElementById("massive-sequence-indicator").classList.remove("inactive");
        this.indicatorActive = true;
    }

    // Deactivates the mouse indicator.
    deactivateIndicator() {
        document.getElementById("massive-sequence-indicator").classList.add("inactive");
        this.indicatorActive = false;
    }

    // Is called with an x and y if the mouse is moved over the component.
    handleMouseMove(x, y) {
        if(x >= this.sizes.personsWidth && !this.indicatorActive) {
            this.activateIndicator();
        }
        else if(x < this.sizes.personsWidth && this.indicatorActive) {
            this.deactivateIndicator();
        }

        // Change mouse indicator position when the indicator is active.
        if(this.indicatorActive) {
            const start = this.main.dataHandler.timeSpan.startTime;
            const end = this.main.dataHandler.timeSpan.endTime;
            const date = this.dateToString(this.approximateDate(start, end, (x-this.sizes.personsWidth)/(this.width-this.sizes.personsWidth)));

            document.getElementById("massive-sequence-indicator").style.left = `${x}px`;
            document.getElementById("massive-sequence-indicator-line").style.background = this.styleOptions.indicatorColor;
            document.getElementById("massive-sequence-indicator-date").innerText = date;
        }
    }

    // Is called by the visualizer when the data is stepped.
    step() {
        const startTime = new Date().getTime();
        const bounds = this.canvas.parentNode.parentNode.parentNode.parentNode.getBoundingClientRect();

        this.width = bounds.width - 40;
        this.height = this.order.size * this.sizes.personHeight + this.sizes.dateHeight;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.drawView(this.sizes.personsWidth, 0, this.width - this.sizes.personsWidth, this.height - this.sizes.dateHeight);
        this.drawPersons();
        this.drawDates(this.dateOptions.number);
        
        const endTime = new Date().getTime();
        console.log(`update in ${endTime-startTime}ms`);
    }

    // Draws the persons part of the visualization.
    drawPersons() {
        for(const person of this.persons) {
            const y = this.order.get(person.id) * this.sizes.personHeight;

            this.graphics.fillStyle = this.scale(person.jobtitle);
            this.graphics.fillRect(0, y, this.sizes.personsWidth, this.sizes.personHeight-1);
        }
    }

    // Draws the dates part of the visualization
    drawDates(number) {
        const start = this.main.dataHandler.timeSpan.startTime;
        const end = this.main.dataHandler.timeSpan.endTime;

        for(let i = 0; i < number; i++) {
            const x = this.sizes.personsWidth + Math.round((this.width - this.sizes.personsWidth - 10) / (number - 1)) * i;
            const date = this.approximateDate(start, end, i/(number - 1));
            this.graphics.rotate(Math.PI/2);
            this.graphics.fillStyle = this.hovering ? this.styleOptions.textHoverColor : this.styleOptions.textColor;
            this.graphics.fillText(this.dateToString(date), this.height - this.sizes.dateHeight, -x);
            this.graphics.rotate(-Math.PI/2);
        }
    }

    // Draws the view part of the visualization.
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

            if(edgeX < 0) continue;

            this.graphics.globalAlpha = this.styleOptions.alpha;

            if(this.styleOptions.useGradient) {
                const gradient = this.graphics.createLinearGradient(0, edgeY + y, 0, edgeHeight + edgeY + y);

                if(y1 >= y2) {
                    gradient.addColorStop(0, this.styleOptions.gradientColor1);
                    gradient.addColorStop(0.5, this.styleOptions.gradientColor2);
                    gradient.addColorStop(1, this.styleOptions.gradientColor3);
                } 
                else {
                    gradient.addColorStop(0, this.styleOptions.gradientColor3);
                    gradient.addColorStop(0.5, this.styleOptions.gradientColor2);
                    gradient.addColorStop(1, this.styleOptions.gradientColor1);
                }
                this.graphics.fillStyle = gradient;
            }
            else {
                this.graphics.fillStyle = this.styleOptions.color;
            }
            
            this.graphics.fillRect(x + edgeX, y + edgeY, 1, edgeHeight);
            this.graphics.globalAlpha = 1;
        }
    }

    // Is called by the visualizer when the data is updated.
    update(){
        super.update();

        this.persons = this.main.dataHandler.getPersons();
        this.order = this.dataClusterer.sortDataByClusters();
        this.jobtitles = this.main.dataHandler.getJobTitles();
        this.scale = d3.scaleOrdinal(d3.schemeCategory10);
        this.scale.domain(this.jobtitles);
        this.step();
    }

    // Approximates the x value of the given date between a specified start and end date for a given width.
    approximateX(start, end, time, width) {
        return Math.round((time - start) / (end - start) * width);
    }

    // Approximates the date value by interpolating the start and end date by the given percentile.
    approximateDate(start, end, percentile) {
        return new Date(Math.round((end - start) * percentile + start));
    }

    // Converts a given date into a string.
    dateToString(date) {
        return `${date.getDate()}-${date.getMonth()}-${("" + date.getFullYear()).substring(2,4)}`;
    }

    // Returns the html code for this component.
    view() {
        return (
            <div class="massive-sequence-container">
                <canvas id='massive-sequence'></canvas>
                <div class="indicator inactive" id="massive-sequence-indicator">
                    <div class="line" id="massive-sequence-indicator-line"></div>
                    <div class="date" id="massive-sequence-indicator-date">AB-AB-AB</div>
                </div>
            </div>
        );
    }
}