import DataHandler from '@/DataHandler.js';

/**
 * A start for the base class of all visualitations
 */
export default class Visualization{

    oninit(vnode){
        vnode.state.dataHandler = new DataHandler(vnode.attrs.csvData);
    }

}