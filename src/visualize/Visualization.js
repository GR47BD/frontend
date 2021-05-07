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
    update() {}

    /**
     * Called when there has been a step through the timespan.
     */
     step() {}

     /**
      * Called when you select a node in one of the graphs.
      * @param {string} id 
      */
     selectNode(id) {
        this.update();
     }

     /**
      * Called when you deselect a node in one of the graphs.
      * @param {string} id 
      */
     deselectNode(id){
         this.update();
     }
}