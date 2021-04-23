import jquery from "jquery-csv"
/**
 * 
 * @param {string} csvData A string with the data of a csv file with as first line the expected variable 
 * names and from the second line till the end the data seperated by a comma on each line.
 * @returns array of objects based on the given csv data
 */
export default function csvConverter(csvData){
    return jquery.toObjects(csvData);
}