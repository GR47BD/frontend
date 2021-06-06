import m from "mithril";
import MultiSelectorComponent from "@/ui/components/MultiSelectorComponent";

export default class ApplyFilterComponent {
    oninit(vnode) {
        this.main = vnode.attrs.main;
        this.main.applyFilter = this;
        this.availableFilters = new Map;
    }

    oncreate(vnode) {
        const filterButton = document.getElementById("filterButton");
        const filterSelector = document.getElementById("filterSelector");
        filterButton.addEventListener("click", () => {

            this.pushFilters();
            this.main.dataHandler.update(); 
            this.main.visualizer.update();
        });
        filterSelector.addEventListener("change", () => {
            let indexOf = filterSelector.selectedIndex;
            if(indexOf !== 0) {
                this.addNewComponent(indexOf);
                this.hideOption(indexOf);
                this.updateButton();
            } 
        });
    }

    pushFilters() {
        let filterarray = this.main.dataHandler.filters;
        filterarray.forEach((filter,index) => {if(filter.options) filterarray.splice(index,1)});
        for (let [key,value] of this.availableFilters) {
            filterarray.push({type: 0, value: value.selectedFilters(), column: key, options: true});
        }

    }

    updateData() {
        document.getElementById("filterSelector").hidden = false;
        document.getElementById("initialText").remove();
    }

    updateButton() {
        document.getElementById("filterButton").hidden = false;
    }

    addNewComponent(indexOf) {
        let value = filterSelector.options[indexOf].value;
        let newDiv = document.createElement("div");
        newDiv.setAttribute("id", "base" + value);
        document.getElementById("baseFilter").appendChild(newDiv);
        this.availableFilters.set(value, new MultiSelectorComponent(this.main, value));
        m.mount(newDiv, this.availableFilters.get(value));
    }

    hideOption(indexOf) {
        filterSelector.options.selectedIndex = 0;
        filterSelector.options[indexOf].setAttribute("hidden", true);

    }

    view() {
        return (
            <div id="baseFilter">
                <span id="initialText">Please upload file to see filters</span>
                <select id="filterSelector" hidden>
                    <option id="default" value="default" selected>-- choose filter --</option> 
                    <option id="fromJobtitle1" value="fromJobtitle">From Jobtitle</option>
                    <option id="toJobtitle1" value="toJobtitle">To Jobtitle</option>
                    <option id="messageType1" value="messageType">Message Type</option>
                </select>
                <button id="filterButton" hidden>Apply Filter</button>
            </div>
        );
    }
}