import jquery from "jquery-csv"
import TimeSpan from "@/visualize/TimeSpan";
import FilterTypes from "@/FilterTypes";

/**
 * This class can return specific things from the given csv data
 */
export default class DataHandler {
    constructor(main){
        this.main = main;

        /**
         * The filters that are currently applied
         */
        this.filters = [];
        /**
         * All the datasets
         */
        this.allDatasets = [];
        /**
         * All the emails
         */
        this.data = [];
        /**
         * The emails after applying the filters
         */
        this.filteredData = [];
        /**
         * The emails after applying the filters and that are in the time span
         */
        this.timedData = [];
        /**
         * The time span that selects the emails
         */
        this.timeSpan = new TimeSpan({
            minTime: undefined,
            maxTime: undefined,
            startTime: undefined,
            endTime: undefined
        });
        /**
         * The sentiment values and 
         */
        this.sentiment = {
            minSentiment: undefined,
            maxSentiment: undefined,
            startSentiment: undefined,
            endSentiment: undefined
        };
        /**
         * The job titles for each list of data
         */
        this.jobTitles = {}
        /**
         * The messagetypes for each list of data
         */
        this.messageType = {}
        /**
         * The persons for each list of data
         */
        this.persons = {}

        this.selectedPersons = new Map();
        this.higlightPerson = undefined;

        // Ratio between 0 and 1 in how much the data has changed since last updateTimed
        this.dataChangedAmount = undefined;

        // Boolean whether or not the data has changed since last iteration
        this.dataChanged = true;

        // name of the selected dataset
        this.selectedDataset = undefined;

        this.emailDataTypes = [
            {key: "sentiment", name: "Sentiment", type: "number"},
            {key: "date", name: "Date", type: "date"}
        ]

        this.personsDataTypes = [
            //{key: "id", name: "Id", type: "unqiue"},
            //{key: "name", name: "Name", type: "unique"},
            {key: "jobtitle", name: "Job title", type: "category"}
        ]
    }

    /**
     * Adds a given dataset to list of data.
     * @param {String} name The name of this dataset
     * @param {string} csvData  A string with the data of a csv file with as first line the expected variable 
     */
    add(name, csvData) {
        const raw = this.csvConverter(csvData);
        this.allDatasets = this.allDatasets.concat(this.formatData(raw, name).sort((a, b) => a.date - b.date));
        this.main.applyFilter.availableData();
        this.chooseDifferentDataset(name);
        this.main.selectDataFile.add(name);
    }

    /**
     * Chooses the dataset to be displayed
     * @param {string} name The name of the dataset you would like to visualize 
     */
    chooseDifferentDataset(name) {
        this.selectedDataset = name;
        this.main.applyFilter.newData();
        this.data = this.allDatasets.filter(item => item.origin === name);
        this.update();
    }

    /**
     * Removes all the data added by the given dataset
     * @param {String} name The name of the dataset
     */
    remove(name) {
        this.allDatasets = this.allDatasets.filter(item => item.origin !== name);
        if (this.allDatasets.length === 0) {
            this.main.applyFilter.availableData(false);
            this.update();
        } else if (this.selectedDataset === name) this.chooseDifferentDataset(this.allDatasets[0].origin);
    }
    
    /**
     * Updates the data by re-applying the changed filters and selecting the data in the correct time span.
     */
    update() {
        this.dataChanged = true;
        this.persons.all = undefined;
        this.jobTitles.all = undefined;
        this.updateFiltered();
        this.updateTimed();
    }

    /**
     * Updates the data by re-applying the filters.
     */
    updateFiltered() {
        this.filteredData = [];
        this.timedData = [];
        this.firstIndex = 0;
        this.lastIndex = 0;
        this.jobTitles.filtered = undefined;
        this.persons.filtered = undefined;
        this.jobTitles.timed = undefined;
        this.persons.timed = undefined;

        for(const item of this.data) {
            if(!this.meetsFilters(item)) continue;

            this.filteredData.push(item);
        }

        const startTime = this.getFirstEmailDate('filtered').date.getTime();
        const endTime = this.getLastEmailDate('filtered').date.getTime();

        if(this.timeSpan.minTime !== startTime) {
            this.timeSpan.startTime = startTime;
        }

        if(this.timeSpan.maxTime !== endTime) {
            this.timeSpan.endTime = endTime;
        }

        this.timeSpan.minTime = startTime;
        this.timeSpan.maxTime = endTime;
    }

    /**
     * Checks if the given item meets the filters that are set.
     * @param {Object} item A data item
     * @returns If the item meets the filters.
     */
    meetsFilters(item) {
        for(const filter of this.filters) {
            if(filter.type === FilterTypes.EQUAL && item[filter.column] !== filter.value) return false;
            if(filter.type === FilterTypes.LESSER && item[filter.column] >= filter.value) return false;
            if(filter.type === FilterTypes.GREATER && item[filter.column] <= filter.value) return false;
            if(filter.type === FilterTypes.INCLUDES && !filter.value.includes(item[filter.column])) return false;
        }

        return true;
    }

    /**
     * Updates the data in timedData to match the timeSpan of this handler.
     * @param {Boolean} timedOnly If the only change to the data was a step.
     */
    updateTimed(timedOnly = false) {
        this.dataChanged = true;

        let newFirstIndex = this.firstIndex;
        let newLastIndex = this.lastIndex;

        if(this.filteredData[this.firstIndex].date.getTime() < this.timeSpan.startTime) {
            for(let i = this.firstIndex; i < this.lastIndex; i++) {
                if(this.filteredData[i].date.getTime() < this.timeSpan.startTime) continue;

                newFirstIndex = i;
                break;
            }

            this.timedData = this.timedData.slice(newFirstIndex-this.firstIndex);
        }
        else if(this.filteredData[this.firstIndex].date.getTime() > this.timeSpan.startTime) {
            for(let i = this.firstIndex; i >= 0; i--) {
                if(this.filteredData[i].date.getTime() >= this.timeSpan.startTime) continue;
                
                newFirstIndex = i+1;
                break;
            }

            const oldData = this.timedData;

            this.timedData = this.filteredData.slice(newFirstIndex, this.firstIndex)
            this.timedData.push(...oldData);
        }

        if(this.filteredData[this.lastIndex].date.getTime() < this.timeSpan.endTime) {
            for(let i = this.lastIndex; i < this.filteredData.length; i++) {
                if(i === this.filteredData.length-1) newLastIndex = i;
                if(this.filteredData[i].date.getTime() <= this.timeSpan.endTime) continue;
                newLastIndex = i-1;
                break;
            }

            const oldData = this.timedData;

            this.timedData = this.filteredData.slice(this.lastIndex+1, newLastIndex+1);
            this.timedData.unshift(...oldData);
        }
        else if(this.filteredData[this.lastIndex].date.getTime() > this.timeSpan.endTime) {
            for(let i = this.lastIndex; i >= this.firstIndex; i--) {
                if(this.filteredData[i].date.getTime() > this.timeSpan.endTime) continue;
                
                newLastIndex = i;
                break;
            }

            this.timedData = this.timedData.slice(0, newLastIndex-this.firstIndex);
        }
   
        this.dataChangedAmount = (Math.abs(newFirstIndex - this.firstIndex) + Math.abs(newLastIndex - this.lastIndex)) / this.data.length;
        
        this.firstIndex = newFirstIndex;
        this.lastIndex = newLastIndex;

        this.jobTitles.timed = undefined;
        
        this.persons.timed = undefined;

        if(timedOnly) {
            this.main.visualizer.step();
        }
    }

    /**
     * @param {string} csvData A string with the data of a csv file with as first line the expected variable 
     * @returns {array} an array of objects based on the given csv data
     */
     csvConverter(csvData){
        const rows = csvData.split("\n");
        const columns = rows[0].split(",");
        const data = [];

        for(let i = 1; i < rows.length; i++) {
            const item = {};
            const row = rows[i].split(",");

            for(let j = 0; j < columns.length; j++) {
                item[columns[j]] = row[j];
            }

            data[i-1] = item;
        }

        return data;
    }   

    /**
     * This functions formats all the data in the proper way, 
     * like converting date string to data object
     * 
     * @param {array} raw  The raw data array
     */
    formatData(raw, origin){
        let idValue = 0;
        return raw.reduce((result, item) => {
            if(item.fromId != item.toId){
                result.push({
                    date: new Date(item.date),
                    fromId: parseInt(item.fromId),
                    fromEmail: item.fromEmail,
                    fromJobtitle: item.fromJobtitle,
                    toId: parseInt(item.toId),
                    toEmail: item.toEmail,
                    toJobtitle: item.toJobtitle,
                    messageType: item.messageType,
                    sentiment: parseFloat(item.sentiment),
                    id: idValue, 
                    origin
                });
                idValue++
            }
            return result
        }, []);   
    }

    /**
     * Sorts the data by date.
     */
    sortByDate(selection = "timed"){
        return this.dataFromSelectionName(selection).sort((a, b) => a.date - b.date);
    }

    /**
     * 
     * @returns an array with an object which stores id's, email, and jobTitle of everyone in the company
     *
     */
    getPersons(selection = "timed"){
        // If personsData does not exist yet, define it
        if(this.persons[selection] === undefined || this.persons[selection].length === 0){
            this.updatePersons(selection);
        }

        return this.persons[selection];
    }

    updatePersons(selection = "timed"){
        const data = this.dataFromSelectionName(selection);

        let persons = new Map();        

        for(let i = 0; i < data.length; i++){

            // Checks if this emails fromId was already in the persons array
            if(!persons.has(data[i].fromId)){
                // If not then add that person
                persons.set(data[i].fromId, {
                    id: data[i].fromId,
                    email: data[i].fromEmail,
                    jobtitle: data[i].fromJobtitle
                });
            } 
            // Checks if this emails toId was already in the persons array
            if(!persons.has(data[i].toId)){
                // If not then add that person
                persons.set(data[i].toId, {
                    id: data[i].toId,
                    email: data[i].toEmail,
                    jobtitle: data[i].toJobtitle
                });
            }
                      
        }
        //convert the map to an array
        this.persons[selection] = [...persons.values()];
    }
    

    /**
     *
    * @returns an array with all job titles
    */
    getJobTitles(selection = "timed"){
        const persons = this.getPersons(selection);

        if(this.jobTitles[selection] === undefined || this.jobTitles[selection].length === 0){
            let jobtitles = new Set();

            persons.forEach(value => {
                jobtitles.add(value.jobtitle);
            });

            this.jobTitles[selection] = [...jobtitles];
        }

        return this.jobTitles[selection];
    }

    /**
     *
    * @returns an array with all messagetypes
    */
    getMessageType(selection = "timed"){
        const emails = this.getEmails(selection);

        if(this.messageType[selection] === undefined || this.messageType[selection].length === 0){
            let messagetypes = new Set();

            emails.forEach(value => {
                messagetypes.add(value.messageType);
            });

            this.messageType[selection] = [...messagetypes];
        }

        return this.messageType[selection];
    }

    getEmails(selection = "timed") {
        return this.dataFromSelectionName(selection);
    }

    /**
     * 
     * @returns an array of all emails bounded 
     */
    getEmailsByDate(firstDate, lastDate, selection = "timed"){
        const data = this.dataFromSelectionName(selection);

        let firstDateIndex = data.findIndex(item => this.datesAreEqual(item.date, firstDate));
        let lastDateIndex = data.findIndex(item => this.datesAreEqual(item.date, lastDate));

        return data.slice(firstDateIndex, lastDateIndex+1); 
    }

     /**
     * Get all adjacent edges of a node
     * @param {string} id the id of a person
     * @returns {array} an array of all the emails sent from and to a person based on its id
     */
    getEmailsForPerson(id, selection = "timed"){
        return this.dataFromSelectionName(selection).filter(item => item.fromId == id || item.toId == id);
    }    


    /**
     * 
     * @returns the date of the first email in the data
     */
    getFirstEmailDate(selection = "timed") {
        return this.dataFromSelectionName(selection)[0];
    }

    /**
     * @returns the date of the last email in the data
     */
    getLastEmailDate(selection = "timed"){
        const data = this.dataFromSelectionName(selection);

        return data[data.length - 1];
    }

    /**
     * 
     * @param {float} percentile 
     * @returns an email on the location in the array based on the variable percentile
     */
    getEmailDateByPercentile(percentile, selection = "timed"){
        const data = this.dataFromSelectionName(selection);

        if(data.ascending){
            return data[Math.round((data.length - 1) * (1-percentile))].date;
        }else{
            return data[Math.round((data.length - 1) * percentile)].date;

        }        
    }

    /**
     * @param {String} name The specified selection
     * @returns The data that matches the specified selection
     */
    dataFromSelectionName(name) {
        if(name === "timed") return this.timedData;
        else if(name === "filtered") return this.filteredData;
        else return this.data;
    }

    /**
     * @param {Date} date1 
     * @param {Date} date2 
     * @returns whether two dates are on the same day
     */
    datesAreEqual(date1, date2){
        return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
    }

    /**
     * @param {} email
     * 
     * @returns name extracted from the email
     */
    emailToName(email_string){
         let res = email_string.split("@")[0].split('.');
         res = res.map(function(word, i){
             if (word != ""){
                 return word[0].toUpperCase() + word.slice(1);
             }
         });
         return res.join(' ');
    }

    /**
     * @param {string, string, string} person This should be an object with the id of the person, the jobtitle, the name of the person the emailsSent and its emailsReceived
     */
    addSelectedPerson(person){
        this.selectedPersons.set(person.id, person);
    }

    /**
     * @param {string, string, string} person This should be an object with the id of the person, the jobtitle and the name of the person
     */
    removeSelectedPerson(person){
        this.selectedPersons.delete(person.id);
    }
    /**
     * This function clears the selected persons hashmap
     */
    clearSelectedPersons(){
        this.selectedPersons = new Map();
    }
    /**
     * @param {string, string, string} person This should be an object with the id of the person, the jobtitle and the name of the person
     * @returns if the person is in the selected persons hashmap
     */
    personIsSelected(person){
        return this.selectedPersons.has(person.id);
    }

    /**
     * 
     * @returns a map with jobtitle: count, summed up for each node in the current selection
     */
    getJobtitleCountOfSelection(){
        let jobtitleCount =  new Map();                  

        for(const person of this.selectedPersons){
            // console.log(person);
            const key = person[1].jobtitle;
            const value = jobtitleCount.get(key);
            if(value === undefined){
                jobtitleCount.set(key, 1);
            }else{
                jobtitleCount.set(key, value+1);
            }
        }
        return jobtitleCount;
    }

    getSelectionEmailsCount(){
        let emails = new Map();
        for(let person of this.selectedPersons.values()){
            for(let email of person.emailsSent && person.emailsReceived){
                emails.set(email.id);
            }
        }
        return emails.size;
    }

    getEmailStatisticsOfSelection(){
        let emails = new Set();
        let outgoingEmails = new Set();
        let incomingEmails = new Set();
        let mutualEmails = new Set();

        for(let person of this.selectedPersons.values()){
            for(let email of person.emailsSent){
                emails.add(email.id);
                if(incomingEmails.has(email.id)){
                    mutualEmails.add(email.id);
                    incomingEmails.delete(email.id);
                } else{
                    outgoingEmails.add(email.id)
                }
            }
            for(let email of person.emailsReceived){
                emails.add(email.id);
                if(outgoingEmails.has(email.id)){
                    mutualEmails.add(email.id);
                    outgoingEmails.delete(email.id);
                }
                else{
                    incomingEmails.add(email.id);
                }
            }
        }

        let statistics = {
            total: emails.size,
            incoming: incomingEmails.size,
            outgoing: outgoingEmails.size,
            mutual: mutualEmails.size
        }

        return statistics;
    }

    /**
     * A new function for the multiselectors
     * This function should allow for future abstraction if needed
     * @params {string} name This should be a string of the data you want
     * 
     */
    getDataOfSelection(name) {
        if(name.indexOf("Jobtitle") !== -1) {
            return this.getJobTitles();
        } else {
            return this.getMessageType();
        }
    }
}
