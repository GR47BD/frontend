const m = require('mithril');

export default class MultiSelectorComponent {


    constructor(main, name) {
        this.main = main;
        this.name = name;
        this.purpose = this.main.dataHandler.getDataOfSelection(this.name);
    }

    oncreate() {
        const selector = document.getElementById(this.name);
        this.purpose.forEach(x => { selector.innerHTML += " <option id='"+this.name+x+"'value='"+x+"'style='background-color:Tomato;'>"+x+"</option>"});
    }

    /* This function is used when the data uploaded changes
    */
    updateData() {
        this.jobTitles = [];
        this.jobTitles = this.main.dataHandler.getJobTitles();
        const selector = document.getElementById("job");
        selector.removeChild(document.getElementById("jobselector"));
        let jobselector = document.createElement("select");
        jobselector.setAttribute("multiple",true);
        jobselector.setAttribute("id","jobselector");
        selector.appendChild(jobselector);
        this.jobTitles.map(x => { jobselector.innerHTML += " <option id='"+x+"'value='"+x+"'style='background-color:Tomato;'>"+x+"</option>"});    
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
        this.updateColors(filters);
        return filters;
    }

    view () {
        return m("select", {id: this.name, multiple: true});
    }
}
