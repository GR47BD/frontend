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

     changeSelection() {}
    
    // To be used when converting from a node object with unnecessary content, to a person object used by the event functions
    nodeToPersonObject(node){
        return{
            id: node.id,
            name: node.name,
            jobtitle: node.jobtitle
        }
    }
}