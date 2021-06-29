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
            highlightedNodeColor: "#4682B4",
            highlightedEdgeColor: "#000000",
            textColor: "#000000",
            textHoverColor: "#808080",
            indicatorColor: "#000000",
            alpha: 0.2
        }

        this.indicatorActive = false;
        this.tooltipActive = false;
        this.hoveredPerson = undefined;
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
            this.deactivateTooltip();
            this.step();
        });
        this.canvas.addEventListener("mousemove", e => {
            this.handleMouseMove(e.offsetX, e.offsetY);
        });
        this.canvas.addEventListener("mousedown", () => {
            if(this.tooltipActive && this.hoveredPerson !== undefined) {
                this.main.dataHandler.highlightPerson = this.hoveredPerson.id;

                if(this.main.dataHandler.selectedPersons.has(this.hoveredPerson.id)) {
                    this.main.dataHandler.selectedPersons.delete(this.hoveredPerson.id);
                }
                else {
                    this.main.dataHandler.selectedPersons.set(this.hoveredPerson.id, this.hoveredPerson);
                }

                this.main.visualizer.step();

                document.getElementById("msv-tooltip").style.textDecoration = "underline";
            }
        });
        this.canvas.addEventListener("mouseup", () => {
            document.getElementById("msv-tooltip").style.textDecoration = "initial";

            if(this.tooltipActive) {
                this.main.dataHandler.highlightPerson = undefined;

                this.main.visualizer.step();
            }
        })
        
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

    activateTooltip() {
        document.getElementById("msv-tooltip").classList.remove("inactive");
        this.tooltipActive = true;
    }

    deactivateTooltip() {
        document.getElementById("msv-tooltip").classList.add("inactive");
        this.tooltipActive = false;
        this.hoveredPerson = undefined;
    }

    // Is called with an x and y if the mouse is moved over the component.
    handleMouseMove(x, y) {
        if(x > this.sizes.personsWidth && !this.indicatorActive) {
            this.activateIndicator();
        }
        else if(x <= this.sizes.personsWidth && this.indicatorActive) {
            this.deactivateIndicator();
        }

        if((x <= this.sizes.personsWidth && y < this.sizes.personHeight*this.order.size) && !this.indicatorActive) {
            this.activateTooltip();
        }
        else if((x > this.sizes.personsWidth || y >= this.sizes.personHeight*this.order.size) && this.indicatorActive) {
            this.deactivateTooltip();
        }

        if(this.tooltipActive) {
            const id = Array.from(this.order.keys()).find(key => this.order.get(key) === Math.floor(y/this.sizes.personHeight));
            const person = this.persons.find(person => person.id === id);

            const tooltip = document.getElementById("msv-tooltip");
            tooltip.innerText = this.main.dataHandler.emailToName(person.email);
            const bounds = tooltip.getBoundingClientRect();
            tooltip.style.left = `0px`;
            tooltip.style.top = `${this.order.get(id) * this.sizes.personHeight + this.sizes.personHeight / 2 - bounds.height / 2}px`;
            tooltip.style.background = this.scale(person.jobtitle);

            if(this.main.dataHandler.selectedPersons.has(id)) tooltip.style.fontWeight = "bold";
            else tooltip.style.fontWeight = "normal";

            this.hoveredPerson = person;
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

    // Draws the persons part of the visualization.
    drawPersons() {
        for(const person of this.persons) {
            const selected = this.main.dataHandler.selectedPersons.has(person.id);
            const y = this.order.get(person.id) * this.sizes.personHeight;

            if(selected) {
                this.graphics.fillStyle = this.styleOptions.highlightedNodeColor;
                this.graphics.fillRect(0, y-1, this.sizes.personsWidth+2, this.sizes.personHeight+1);
            }

            this.graphics.fillStyle = this.scale(person.jobtitle);
            this.graphics.fillRect(1, y, this.sizes.personsWidth, this.sizes.personHeight-1);
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

            if(this.main.dataHandler.highlightPerson === email.fromId || this.main.dataHandler.highlightPerson === email.toId) {
                this.graphics.fillStyle = this.styleOptions.highlightedEdgeColor;
            }
            else if(this.styleOptions.useGradient) {
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
                <div class="msv-tooltip inactive" id="msv-tooltip"></div>
            </div>
        );
    }
}