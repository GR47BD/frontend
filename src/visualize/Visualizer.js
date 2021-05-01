import Animator from "@/visualize/Animator";

export default class Visualizer {
    constructor() {
        this.animator = new Animator();
        this.visualizations = new Map();
    }

    addVisualization(name, component) {
        this.visualizations.set(name, component);
    }

    getVisualization(name) {
        return this.visualizations.get(name);
    }

    deleteVisualization(name) {
        this.visualizations.delete(name);
    }
}