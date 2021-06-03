const r = require("reorder.js");

export default class DataClusterer {

    constructor(main) {
        this.main = main;
    }

    sortDataByClusters() {
        this.persons = this.main.dataHandler.getPersons();
        this.matrix = [];
        let i = 0;
        this.idMap = new Map();

        for(const person of this.persons) { // make a map that points id to index in matrix
            let key = person.id;
            if (!this.idMap.has(key) && i < 10) {
                this.idMap.set(key, i);
                this.matrix[i] = [];
                i++;
            } 
        }

        for (let k = 0; k < this.idMap.size; k++) { // set entire matrix to 0
            for (let h = 0; h < this.idMap.size; h++ ) {
                this.matrix[k][h] = 0;
            }
        }

        this.emails = this.main.dataHandler.getEmails();

        for (const email of this.emails) {
            if (!this.idMap.has(email.fromId) || this.idMap.has(email.toId)) continue;
            this.matrix[this.idMap.get(email.fromId)][this.idMap.get(email.toId)]++;
            this.matrix[this.idMap.get(email.toId)][this.idMap.get(email.fromId)]++;
        }

        var leafOrder = reorder.optimal_leaf_order()
    	    .distance(reorder.distance.manhattan);
        
        var perm = leafOrder(this.matrix);


        return perm.isArray();
    }


}