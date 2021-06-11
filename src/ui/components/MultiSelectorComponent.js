const m = require('mithril');

export default class MultiSelectorComponent {


    constructor(main, name, index) {
        this.main = main;
        this.name = name;
        this.purpose = this.main.dataHandler.getDataOfSelection(this.name);
        this.index = index;
    }

    oncreate() {
        const selector = document.getElementById(this.name);
        const button = document.getElementById(this.name+"_button");
        const filterSelector = document.getElementById("filterSelector");
        this.purpose.forEach(x => { selector.innerHTML += " <option id='"+this.name+x+"'value='"+x+"'style='background-color:Tomato;'>"+x+"</option>"});
        button.addEventListener("click", () => {
            filterSelector.options[this.index].hidden = false;
            button.parentNode.parentNode
            .removeChild(button.parentNode);
            this.main.applyFilter.removeFilterSelector(this.name);
        });
    }

    updateColors (selectedJobs) {
        this.purpose.forEach(item => {
            document.getElementById(this.name+item).style = "";
        });
        selectedJobs.forEach(item => {
            document.getElementById(this.name+item).style = "background-color:Tomato;";
        });

    }


    selectedFilters() {
        const selector = document.getElementById(this.name);
        let filters = [].filter.call(selector.options, option => option.selected).map(option => option.text);
        if (filters.length !== 0) this.updateColors(filters);
        return filters;
    }

    view () {
        return [m("button", {id: this.name + "_button"},"x"), m("span", this.name), m("select", {id: this.name, multiple: true})];
    }
}
