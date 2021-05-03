import Animator from "@/visualize/Animator";

/**
 * This class is in charge of all the visualizations and the animator.
 */
export default class Visualizer {
    constructor() {
        this.animator = new Animator();
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
}