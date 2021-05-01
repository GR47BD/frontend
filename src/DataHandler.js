import jquery from "jquery-csv"
import TimeSpan from "@/visualize/TimeSpan";
import FilterTypes from "@/FilterTypes";

/**
 * This class can return specific things from the given csv data
 */
export default class DataHandler {
    constructor(){
        this.filters = [];
        this.data = [];
        this.filteredData = [];
        this.timedData = [];
        this.timeSpan = new TimeSpan({});
    }

    /**
     * Adds a given dataset to list of data.
     * @param {String} name The name of this dataset
     * @param {string} csvData  A string with the data of a csv file with as first line the expected variable 
     */
    add(name, csvData) {
        const raw = this.csvConverter(csvData)
        this.data.push(...this.formatData(raw, name))

        this.sortDataByDate()
        this.update();
    }

    /**
     * Removes all the data added by the given dataset
     * @param {String} name The name of the dataset
     */
    remove(name) {
        this.data = this.data.filter(item => item.orgin !== name);

        this.update();
    }
    
    /**
     * Updates the data by re-applying the changed filters and selecting the data in the correct time span.
     */
    update() {
        this.updateFiltered();
        this.updatedTimed();
    }

    /**
     * Updates the data by re-applying the filters.
     */
    updateFiltered() {
        this.filteredData = [];
        this.timedData = [];
        this.nextIndex = 0;

        for(const item of this.data) {
            if(!this.meetsFilters(item)) continue;

            this.filteredData.push(item);
        }
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
     */
    updatedTimed() {
        const startIndex = 0;
        const endIndex = 0;

        for(let i = 0; i < this.timedData.length; i++) {
            if(this.timedData[i].data.getTime() >= this.timeSpan.startTime) {
                startIndex = i;

                break;
            }
        }

        this.timedData = this.timedData.slice(startIndex);

        for(let i = this.nextIndex; i < this.filteredData.length; i++) {
            if(this.timedData[i].data.getTime() >= this.timeSpan.endTime) {
                endIndex = i-1;

                break;
            }
        }

        this.timedData.push(...this.filteredData.slice(this.nextIndex, endIndex));
        this.nextIndex = endIndex + 1;
    }

    /**
     * @param {string} csvData A string with the data of a csv file with as first line the expected variable 
     * @returns {array} an array of objects based on the given csv data
     */
     csvConverter(csvData){
        return jquery.toObjects(csvData);
    }   

    /**
     * This functions formats all the data in the proper way, 
     * like converting date string to data object
     * 
     * @param {array} raw  The raw data array
     */
    formatData(raw, origin){
        return raw.map(item => {
            return {
                date: new Date(item.date),
                fromId: parseInt(item.fromId),
                fromEmail: item.fromEmail,
                fromJobtitle: item.fromJobtitle,
                toId: parseInt(item.toId),
                toEmail: item.toEmail,
                toJobtitle: item.toJobtitle,
                messageType: item.messageType,
                sentiment: parseFloat(item.sentiment),
                origin
            }
        });   
    }

    /**
     * Sorts the data, by default in decreasing order
     * @param {boolean} ascending 
     */
    sortDataByDate(ascending = false){
        if(ascending){
            this.sortedDataByDate = this.formattedData.sort((a, b) => b.date - a.date);   
        }else{
            this.sortedDataByDate = this.formattedData.sort((a, b) => a.date - b.date);   
        }
        this.sortedDataByDate.ascending = ascending;
    }

    /**
     * 
     * @returns an array with an object which stores id's, email, and jobTitle of everyone in the company
     *
     */
    getPersons(){
        // If personsData does not exist yet, define it
        if(typeof this.personsData == 'undefined'){

            let persons = [];
            for(let i = 0; i < this.formattedData.length; i++){
                // Checks if this emails fromId was already in the persons array
                if(!persons.some(item => item.id === this.formattedData[i].fromId)){
                    // If not then add that person
                    persons.push({
                        id: this.formattedData[i].fromId,
                        email: this.formattedData[i].fromEmail,
                        jobtitle: this.formattedData[i].fromJobtitle
                    });
                }
                // Checks if this emails toId was already in the persons array
                if(!persons.some(item => item.id === this.formattedData[i].toId)){
                    // If not then add that person
                    persons.push({
                        id: this.formattedData[i].toId,
                        email: this.formattedData[i].toEmail,
                        jobtitle: this.formattedData[i].toJobtitle
                    });
                }                         
            }
            this.personsData = persons;
        }
        return this.personsData;
    }

    /**
     *
    * @returns an array with all job titles
    */
    getJobTitles(){
        const persons = this.getPersons();

        if(typeof this.jobTitles == 'undefined'){
             let duplicateJobTitles = persons.map(item => item.jobtitle);
             this.jobTitles =  duplicateJobTitles.filter((item1, index, array) => array.findIndex(item2 => (item1 == item2)) === index);
        }

        return this.jobTitles;
    }

    getEmails() {
        // If no parameters were used then just use the first and last data    
        return this.sortedDataByDate;
    }

    /**
     * 
     * @returns an array of all emails bounded 
     */
    getEmailsByDate(firstDate, lastDate){
        let firstDateIndex = this.sortedDataByDate.findIndex(item => this.datesAreEqual(item.date, firstDate));
        let lastDateIndex = this.sortedDataByDate.findIndex(item => this.datesAreEqual(item.date, lastDate));

        return this.sortedDataByDate.slice(firstDateIndex, lastDateIndex+1); 
    }

     /**
     * Get all adjacent edges of a node
     * @param {string} id the id of a person
     * @returns {array} an array of all the emails sent from and to a person based on its id
     */
      getEmailsForPerson(id){
        return this.formattedData.filter(item => item.fromId == id || item.toId == id);
    }    


    /**
     * 
     * @returns the date of the first email in the data
     */
    getFirstEmailDate(){
        // the first and last date are based on whether the array is ascending
        return this.sortedDataByDate.ascending ? 
                this.sortedDataByDate[this.sortedDataByDate.length - 1] : this.sortedDataByDate[0];       
    }

    /**
     * @returns the date of the last email in the data
     */
    getLastEmailDate(){
        // the first and last date are based on whether the array is ascending
        return this.sortedDataByDate.ascending ? 
                this.sortedDataByDate[0] : this.sortedDataByDate[this.sortedDataByDate.length - 1];
    }

    /**
     * 
     * @param {float} percentile 
     * @returns an email on the location in the array based on the variable percentile
     */
    getEmailDateByPercentile(percentile, selection = "timed"){
        if(this.sortedDataByDate.ascending){
            return this.sortedDataByDate[
                Math.round((this.sortedDataByDate.length - 1) * (1-percentile))].date;
        }else{
            return this.sortedDataByDate[
                Math.round((this.sortedDataByDate.length - 1) * percentile)].date;

        }        
    }

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
}
