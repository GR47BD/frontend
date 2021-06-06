const m = require('mithril');

export default class MultiSelectorComponent {


    controller(args) {
        this.main = args.main;
    }

    oninit() {
        const selector = document.getElementById(this.main.selectorPurpose);
        this.purpose = this.main.dataHandler.getDataOfSelection(this.main.selectorPurpose);
        this.purpose.forEach(x => { selector.innerHTML += " <option id='"+x+"'value='"+x+"'style='background-color:Tomato;'>"+x+"</option>"});
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
        this.jobTitles.forEach(item => {
            document.getElementById(item).style = "";
        });
        selectedJobs.forEach(item => {
            document.getElementById(item).style = "background-color:Tomato;";
        });

    }


    selectedFilters() {
        const jobselector = document.getElementById("jobselector");
        let filters = [].filter.call(jobselector.options, option => option.selected).map(option => option.text);
        this.updateColors(filters);
        return filters;
    }

    view (vnode) {
        return m("select", {id: this.main.selectorPurpose});
    }
}
