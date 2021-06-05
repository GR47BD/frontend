const m = require("mithril");

export default class ApplyFilterComponent {
    oninit(vnode) {
        this.main = vnode.attrs.main;
        this.main.applyFilter = this;
    }

    oncreate() {
        const filterButton = document.getElementById("filter");
        filterButton.addEventListener("click", () => {
            let filterarray = this.main.dataHandler.filters;
            filterarray.forEach((filter,index) => {if(filter.options) filterarray.splice(index,1)})
            this.pushFilters();
            this.main.dataHandler.update(); // seems like you cannot just call updateFiltered (does not work properly)
            this.main.visualizer.update();
        });
    }

    pushFilters() {
        this.main.dataHandler.filters.push({type: 0, value: this.main.jobSelector.selectedFilters(), column: 'fromJobtitle', options: true});
    }

    updateData() {
        const filterButton = document.getElementById("filter");
        filterButton.hidden = false;
    }

    view() {
        return (
            <div class="button">
                <button id="filter" hidden>Apply Filter</button>
            </div>
        );
    }
}