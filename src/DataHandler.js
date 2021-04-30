import jquery from "jquery-csv"

/**
 * This class can return specific things from the given csv data
 */
export default class DataHandler{
    
    // Stores rawData, formattedData, personsData, emails, sortedDataByDate

    /**
     * @param {string} csvData  A string with the data of a csv file with as first line the expected variable 
     */
    constructor(csvData){
        this.rawData = this.csvConverter(csvData)
        this.formatData(this.rawData)
        this.sortDataByDate()
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
    formatData(raw){
        this.formattedData = raw.map(item =>{
            return{
                date: new Date(item.date),
                fromId: parseInt(item.fromId),
                fromEmail: item.fromEmail,
                fromJobtitle: item.fromJobtitle,
                toId: parseInt(item.toId),
                toEmail: item.toEmail,
                toJobtitle: item.toJobtitle,
                messageType: item.messageType,
                sentiment: parseFloat(item.sentiment)
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
    getEmailDateByPercentile(percentile){
        if(this.sortedDataByDate.ascending){
            return this.sortedDataByDate[
                Math.round((this.sortedDataByDate.length - 1) * (1-percentile))].date;
        }else{
            return this.sortedDataByDate[
                Math.round((this.sortedDataByDate.length - 1) * percentile)].date;

        }        
    }
    
    /**
     * @returns the rawData array
     */
    getRawData(){
        return this.rawData;
    }
    /**
     * @returns the formattedData array
     */
    getFormattedData(){
        return this.formattedData;
    }
    
    /**
     * print the rawData array
     */
    printRawData(){
        console.log(this.rawData);
    }
    /**
     * print the formatted data array
     */
    printFormattedData(){
        console.log(this.formattedData);
    }    

    /**
     * @param {Date} date1 
     * @param {Date} date2 
     * @returns whether two dates are on the same day
     */
    datesAreEqual(date1, date2){
        return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
    }   

}
