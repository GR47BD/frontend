import UIHandler from "@/ui/UIHandler";
import Visualizer from "@/visualize/Visualizer";
import DataHandler from "@/DataHandler";
import csvData from "@/data/enron-v1.js";

class Main {
    constructor() {
        // We create the ui handler class and add it to the main class.
        this.ui = new UIHandler(this);
        this.visualizer = new Visualizer(this);
        this.dataHandler = new DataHandler(this);
    }

    start() {
        //this.dataHandler.add("enron-v1", csvData);
        
        // We start rendering the ui.
        this.ui.render();
    }
}

const main = new Main();
main.start();

global.main = main;