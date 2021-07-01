import m from "mithril";
import MultiSelectorComponent from "@/ui/components/MultiSelectorComponent";
import SliderComponent from "@/ui/components/SliderComponent";

export default class ApplyFilterComponent {
    oninit(vnode) {
        this.main = vnode.attrs.main;
        this.main.applyFilter = this;
        this.availableFilters = new Map;
        this.indexOfSliders = [4];
    }

    oncreate(vnode) {
        const filterButton = document.getElementById("filterButton");
        const filterSelector = document.getElementById("filterSelector");
        filterButton.addEventListener("click", () => {
            this.pushFilters();
            this.updateVizualisation();
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
        this.main.dataHandler.filters = filterarray.filter((filter) => {return !filter.options});
        for (let [key,value] of this.availableFilters) {
            if (key === 'sentiment') {
                this.main.dataHandler.filters.push({type: 2, value: value.getMin(), column: key, options: true});
                this.main.dataHandler.filters.push({type: 1, value: value.getMax(), column: key, options: true});
                continue;
            }
            if(value.selectedFilters().length === 0) continue;
            this.main.dataHandler.filters.push({type: 3, value: value.selectedFilters(), column: key, options: true});
        }

    }

    removeFilterSelector(name) {
        this.availableFilters.delete(name);
        this.pushFilters();
        this.hideButton();
        this.updateVizualisation();
    }

    availableData() {
        document.getElementById("filterSelector").hidden = false;
        document.getElementById("initialText").hidden = true;
    }

    newData() {
        for(let [key,value] of this.availableFilters) {
            document.getElementById("base"+key).remove();
            document.getElementById(key+"1").hidden = false;
        }
        this.availableFilters.clear();
        this.hideButton();
        this.pushFilters();
    }

    hideButton() {
        if (this.availableFilters.size === 0) document.getElementById("filterButton").hidden = true;
    }

    updateButton() {
        document.getElementById("filterButton").hidden = false;
    }

    updateVizualisation() {
        this.main.dataHandler.update(); 
        this.main.visualizer.update();
    }

    addNewComponent(indexOf) {
        let value = filterSelector.options[indexOf].value;
        let newDiv = document.createElement("div");
        newDiv.setAttribute("id", "base" + value);
        newDiv.classList.add("filter-item");
        document.getElementById("baseFilter").appendChild(newDiv);
        if (this.indexOfSliders.includes(indexOf)) this.availableFilters.set(value, new SliderComponent(this.main, value, indexOf));
        else this.availableFilters.set(value, new MultiSelectorComponent(this.main, value, indexOf));
        m.mount(newDiv, this.availableFilters.get(value));
    }

    hideOption(indexOf) {
        const filterSelector = document.getElementById("filterSelector");
        filterSelector.options.selectedIndex = 0;
        filterSelector.options[indexOf].setAttribute("hidden", true);
    }

    view() {
        return (
            <div class="filter" id="baseFilter">
                <div class="filter-top">
                    <span class="filter-text" id="initialText">Please upload file to see filters</span>
                    <select id="filterSelector" hidden>
                        <option id="default" value="default" selected>-- choose filter --</option> 
                        <option id="fromJobtitle1" value="fromJobtitle">From Jobtitle</option>
                        <option id="toJobtitle1" value="toJobtitle">To Jobtitle</option>
                        <option id="messageType1" value="messageType">Message Type</option>
                        <option id="sentiment1" value="sentiment">Sentiment</option>
                    </select>
                    <button id="filterButton" hidden>Apply Filter</button>
                </div>
            </div>
        );
    }
}