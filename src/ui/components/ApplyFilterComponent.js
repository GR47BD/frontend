const m = require("mithril");

export default class ApplyFilterComponent {
    oninit(vnode) {
        this.main = vnode.attrs.main;
        this.main.applyFilter = this;
    }

    oncreate() {
        const filterButton = document.getElementById("filter");
        filterButton.addEventListener("click", (appliedFilters) => {
            appliedFilters = this.main.jobSelector.selectedFilters();
            this.main.dataHandler.filters = [];
            appliedFilters.forEach(item => {
                this.main.dataHandler.filters.push({type: 0, value: item, column: 'fromJobtitle'});
            });
            this.main.dataHandler.update(); // seems like you cannot just call updateFiltered (does not work properly)
            this.main.visualizer.update();
        });
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