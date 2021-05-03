import m from "mithril";
import TestComponent from "@/ui/components/TestComponent";
import NodeLinkDiagramComponent from "@/ui/components/visualization/NodeLinkDiagramComponent";
import HierarchicalEdgeComponent from "@/ui/components/visualization/HierarchicalEdgeComponent";

export default class IndexView {
    view(vnode) {
        return (
            // <div> 
            //     {/* In the next line the component TestComponent is loaded in as HTML element */}
            //     <NodeLinkDiagramComponent></NodeLinkDiagramComponent>
            //     {/* The following line contains standard text. */} 
            // </div>
            m(NodeLinkDiagramComponent, {csvData: csvData})
            // m(HierarchicalEdgeComponent, {csvData: csvData})
        );
        // HTML syntax that is returned may only contain one root element
        // So the following wouldn't be allowed:
        // return (<div></div> <div></div>)
    }
}