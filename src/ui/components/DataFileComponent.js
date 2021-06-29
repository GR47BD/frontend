import m from "mithril";

export default class DataFileComponent {
    
    constructor(main, name){
        this.name = name;
        this.main = main;
    }

    oncreate() {
        const selector = document.getElementById(this.name+"selector");
        const remover = document.getElementById(this.name+"remover");
        selector.addEventListener("click", () => {
            const customTxt = document.getElementById("custom-text");
            customTxt.innerHTML = this.name;
            this.main.selectDataFile.change(this.name);
            this.main.dataHandler.chooseDifferentDataset(this.name);
            this.main.visualizer.update();

        });
        remover.addEventListener("click", () => {
            this.main.selectDataFile.remove(this.name);
            this.main.dataHandler.remove(this.name);
            remover.parentNode.parentNode.removeChild(remover.parentNode);
        });
    }


    view() {
        return [m("span", {id: this.name+"selector", className: "datafile-button"}, this.name), m("span", {id: this.name+"remover", className: "datafile-button"}, "x")];
    }

}