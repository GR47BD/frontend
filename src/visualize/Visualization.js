/**
 * A start for the base class of all visualitations
 */
export default class Visualization {
    oninit(vnode) {
        this.main = vnode.attrs.main;
    }

    /**
     * Called the first time the visualization has to be drawn.
     */
    draw() {}

    /**
     * Called when the data has changed and the visualization has to be redrawn.
     */
    update() {
        this.main.dataHandler.dataChanged = false;
    }

    /**
     * Called when there has been a step through the timespan.
     */
     step() {}

     /**
      * Called when you hover over a node in one of the graphs.
      * @param {string, string, string} person This should be an object with the id of the person, the jobtitle and the name of the person
      */
    mouseOverNode(person) {
        this.update();
     }

     /**
      * Called when you stop hovering a node in one of the graphs.
      * @param {string, string, string} person This should be an object with the id of the person, the jobtitle and the name of the person
      */
    mouseOutNode(person){
         this.update();
    }

    /**
     * Called when you click on a node in one of the graphs
     * @param {string, string, string} person This should be an object with the id of the person, the jobtitle and the name of the person
     */
    mouseDownNode(person){
        this.update();
    }

    /**
     * Called when you stop clicking on a node in one of the graphs
     * @param {string, string, string} person This should be an object with the id of the person, the jobtitle and the name of the person
     */
    mouseUpNode(person){
        this.update();
    }
    
    // To be used when converting from a node object with unnecessary content, to a person object used by the event functions
    nodeToPersonObject(node){
        return{
            id: node.id,
            name: node.name,
            jobtitle: node.jobtitle
        }
    }
}