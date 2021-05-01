import m from "mithril";
import TestComponent from "@/ui/components/test";
import NodeLinkDiagramComponent from "../components/visualization/NodeLinkDiagramComponent";
import csvData from "@/data/enron-v1.js";
import HierarchicalEdgeComponent from "../components/visualization/HierarchicalEdgeComponent";

export default class IndexView {
    view() {
        return (
            // <div> 
            //     {/* In the next line the component TestComponent is loaded in as HTML element */}
            //     <NodeLinkDiagramComponent></NodeLinkDiagramComponent>
            //     {/* The following line contains standard text. */} 
            // </div>
            //m(NodeLinkDiagramComponent, {csvData: csvData})
            m(HierarchicalEdgeComponent, {csvData: csvData})
        );
        // HTML syntax that is returned may only contain one root element
        // So the following wouldn't be allowed:
        // return (<div></div> <div></div>)
    }
}