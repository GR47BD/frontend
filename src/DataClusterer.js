const r = require("reorder.js");

export default class DataClusterer {
    constructor(main) {
        this.main = main;

        this.options = {
            distance: "braycurtis",
            permute: true
        }
    }

    sortDataByClusters() {
        this.persons = this.main.dataHandler.getPersons();
        this.matrix = [];
        let i = 0;
        this.idMap = new Map();

        if(this.persons.length === 0) return this.idMap;

        for(const person of this.persons) { // make a map that points id to index in matrix
            let key = person.id;
            if (!this.idMap.has(key)) {
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
            this.matrix[this.idMap.get(email.fromId)][this.idMap.get(email.toId)]++;
            this.matrix[this.idMap.get(email.toId)][this.idMap.get(email.fromId)]++;
        }

        var leafOrder = r.optimal_leaf_order()
    	     .distance(r.distance[this.options.distance]);
        
        var perm = leafOrder(this.matrix);

        for(const [key, value] of this.idMap) {
            if(this.options.permute) this.idMap.set(key, perm.findIndex(val => val === value));
            else this.idMap.set(key, perm[value]);
        }

        return this.idMap;
    }


}