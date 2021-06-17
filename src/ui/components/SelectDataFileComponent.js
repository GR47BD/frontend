import m from "mithril";
import DataFileComponent from "@/ui/components/DataFileComponent";

export default class SelectDataFileComponent {
    oninit(vnode) {
        this.main = vnode.attrs.main;
        this.main.selectDataFile = this;
        this.datasets = new Map;
    }


    addDataset(name) {
        const selector = document.getElementById("dataSelector");
        const newDataset = document.createElement("div");
        newDataset.setAttribute("id", name);
        newDataset.hidden = true;
        newDataset.class = "datafile-selector";
        selector.appendChild(newDataset);
        this.datasets.set(name, new DataFileComponent(this.main, name));
        m.mount(newDataset, this.datasets.get(name));
    }



    add(name) {
        this.addDataset(name);
        if(this.datasets.size === 1) return;
        for (let [dataset, object] of this.datasets) {
            if (dataset === name) document.getElementById(dataset).hidden = true;
            else document.getElementById(dataset).hidden = false;
        }
    }

    change(name) {
        for (let [dataset, object] of this.datasets) {
            if (dataset === name) document.getElementById(dataset).hidden = true;
            else document.getElementById(dataset).hidden = false;
        }
    }

    remove(name) {
        this.datasets.delete(name);
    }


    view() {
        return (
            <div id="dataSelector" class="datafile-base"></div>
        );
    }

}