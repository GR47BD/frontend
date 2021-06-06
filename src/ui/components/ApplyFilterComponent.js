import m from "mithril";
import MultiSelectorComponent from "@/ui/components/MultiSelectorComponent";

export default class ApplyFilterComponent {
    oninit(vnode) {
        this.main = vnode.attrs.main;
        this.main.applyFilter = this;
        this.availableFilters = [];
    }

    oncreate(vnode) {
        const filterButton = document.getElementById("filterButton");
        const filterSelector = document.getElementById("filterSelector");
        filterButton.addEventListener("click", () => {
            let filterarray = this.main.dataHandler.filters;
            filterarray.forEach((filter,index) => {if(filter.options) filterarray.splice(index,1)})
            this.pushFilters();
            this.main.dataHandler.update(); 
            this.main.visualizer.update();
        });
        filterSelector.addEventListener("change", () => {
            if(filterSelector.selectedIndex !== 0) {
                this.updateButton();
            } 
        });
    }

    pushFilters() {
        this.main.dataHandler.filters.push({type: 0, value: this.main.jobSelector.selectedFilters(), column: 'fromJobtitle', options: true});
    }

    updateData() {
        document.getElementById("filterSelector").hidden = false;
        document.getElementById("initialText").remove();
    }

    updateButton() {
        document.getElementById("filterButton").hidden = false;
    }

    view() {
        return (
            <div id="baseFilter">
                <span id="initialText">Please upload file to see filters</span>
                <select id="filterSelector" hidden>
                    <option id="default" value="default" selected>-- choose filter --</option> 
                    <option id="fromJobtitle" value="fromJobtitle">From Jobtitle</option>
                    <option id="toJobtitle" value="toJobtitle">To Jobtitle</option>
                    <option id="messageType" value="messageType">Message Type</option>
                </select>
                <button id="filterButton" hidden>Apply Filter</button>
            </div>
        );
    }
}