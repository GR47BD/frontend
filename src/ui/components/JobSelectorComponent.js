const m = require('mithril');

export default class JobSelectorComponent {
    constructor() {
        this.jobTitles = [];
    }

    oninit(vnode) {
        this.main = vnode.attrs.main;
        this.main.jobSelector = this;
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
        let filters =  [].filter.call(jobselector.options, option => option.selected).map(option => option.text);
        this.updateColors(filters);
        return filters;
    }

    view () {
        return (
            <div id="job"> 
                <span id="jobselector">Upload File</span>
            </div>
        );
    }
}
