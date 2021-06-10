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
        if(this.main.statistics) this.main.statistics.update();

        for(const visualization of this.visualizations.values()) {
            visualization.update();
        }
    }

    step() {
        if(this.main.timebar) this.main.timebar.update();
        if(this.main.statistics) this.main.statistics.update();

        for(const visualization of this.visualizations.values()) {
            visualization.step();
        }
    }

    changeSelection(){
        for(const visualization of this.visualizations.values()){
            visualization.changeSelection();
        }
    }
}