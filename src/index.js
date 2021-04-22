import UIHandler from "@/ui/handler";

class Main {
    constructor() {
        this.ui = new UIHandler(this);
    }

    async start() {
        this.ui.render();
    }
}

const main = new Main();
main.start();