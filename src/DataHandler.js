import jquery from "jquery-csv"

/**
 * This class can return specific things from the given csv data
 */
export default class DataHandler{
    
    /**
     * 
     * @param {string} csvData  A string with the data of a csv file with as first line the expected variable 
     */
    constructor(csvData){
        this.rawData = this.csvConverter(csvData)
    }

    /**
     * 
     * @param {string} csvData A string with the data of a csv file with as first line the expected variable 
     * @returns {array} an array of objects based on the given csv data
     */
    csvConverter(csvData){
        return jquery.toObjects(csvData);
    }

    /**
     * 
     * @returns an array with all id's of everyone in the company
     */
    getPersons(){
        // If personsData does not exist yet, define it
        if(typeof this.personsData == 'undefined'){
            // Get only the fromId from the dataset
            let duplicatePersons = this.rawData.map(item => item.fromId); 
            // Remove the duplicates and save to personsData
            this.personsData = duplicatePersons.filter((item1, index, array) => array.findIndex(item2 => (item1 == item2)) === index); 
        }

        return this.personsData
    }
    
    /**
     * 
     * @returns the rawData array
     */
    getRawData(){
        return this.rawData;
    }

    /**
     * print the rawData array
     */
    printRawData(){
        console.log(this.rawData);
    }

    /**
     * 
     * @returns an array of all emails
     */
    getEmails(){
        return this.rawData;  // rawData already consists all emails
    }

    /**
     * 
     * @param {string} id the id of a person
     * @returns {array} an array of all the emails sent from and to a person based on its id
     */
    getEmailsForPerson(id){
        return this.rawData.filter(item => item.fromId == id || item.toId == id);
    }

}
