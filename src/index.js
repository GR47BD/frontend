import UIHandler from "@/ui/handler";

class Main {
    constructor() {
        // We create the ui handler class and add it to the main class.
        this.ui = new UIHandler(this);
    }

    start() {
        // We start rendering the ui.
        this.ui.render();
    }
}

const main = new Main();
main.start();