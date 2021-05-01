import UIHandler from "@/ui/UIHandler";
import Visualizer from "@/visualize/Visualizer";
import DataHandler from "@/DataHandler";

class Main {
    constructor() {
        // We create the ui handler class and add it to the main class.
        this.ui = new UIHandler(this);
        this.visualizer = new Visualizer();
        this.dataHandler = new DataHandler();
    }

    start() {
        // We start rendering the ui.
        this.ui.render();
    }
}

const main = new Main();
main.start();