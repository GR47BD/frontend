import DataHandler from '@/DataHandler.js';

/**
 * A start for the base class of all visualitations
 */
export default class Visualization{

    oncreate(vnode){
        vnode.state.DataHandler = new DataHandler(vnode.attrs.csvData);
    }
    
}