import m from "mithril";
import TestComponent from "@/ui/components/TestComponent";
import NodeLinkDiagramComponent from "@/ui/components/visualization/NodeLinkDiagramComponent";
import HierarchicalEdgeComponent from "@/ui/components/visualization/HierarchicalEdgeComponent";
import TimebarComponent from "../components/TimebarComponent";

export default class IndexView {
    view(vnode) {
        return (
            // <div> 
            //     {/* In the next line the component TestComponent is loaded in as HTML element */}
            //     <NodeLinkDiagramComponent></NodeLinkDiagramComponent>
            //     {/* The following line contains standard text. */} 
            // </div>
            //m(NodeLinkDiagramComponent, {main: vnode.attrs.main})
            <div>
                <TimebarComponent main={vnode.attrs.main}></TimebarComponent>
                <HierarchicalEdgeComponent main={vnode.attrs.main}></HierarchicalEdgeComponent>
            </div>
        );
        // HTML syntax that is returned may only contain one root element
        // So the following wouldn't be allowed:
        // return (<div></div> <div></div>)
    }
}