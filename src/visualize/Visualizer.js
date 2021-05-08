import Animator from "@/visualize/Animator";

/**
 * This class is in charge of all the visualizations and the animator.
 */
export default class Visualizer {
    constructor(main) {
        this.main = main;
        this.animator = new Animator(main, {speed: 5});
        this.visualizations = new Map();
    }

    /**
     * @param {String} name The name of the component
     * @param {Component} component The visualization component
     */
    addVisualization(name, component) {
        this.visualizations.set(name, component);
    }

    /**
     * @param {String} name The name of the component
     * @returns The component with the given name
     */
    getVisualization(name) {
        return this.visualizations.get(name);
    }

    /**
     * @param {String} name The name of the component
     */
    deleteVisualization(name) {
        this.visualizations.delete(name);
    }

    update() {
        if(this.main.timebar) this.main.timebar.update();

        for(const visualization of this.visualizations.values()) {
            visualization.update();
        }
    }

    step() {
        if(this.main.timebar) this.main.timebar.update();

        for(const visualization of this.visualizations.values()) {
            visualization.step();
        }
    }

    mouseOverNode(id){
        for(const visualization of this.visualizations.values()){
            visualization.mouseOverNode(id);
        }
    }
    mouseOutNode(id){
        for(const visualization of this.visualizations.values()){
            visualization.mouseOutNode(id);
        }
    }

    mouseDownNode(id){
        for(const visualization of this.visualizations.values()){
            visualization.mouseDownNode(id);
        }
    }
    mouseUpNode(id){
        for(const visualization of this.visualizations.values()){
            visualization.mouseUpNode(id);
        }
    }
}