import m from "mithril";
import TestComponent from "@/ui/components/visualization/TestComponent.js";
import NodeLinkDiagramComponent from "@/ui/components/visualization/NodeLinkDiagramComponent";
import HierarchicalEdgeComponent from "@/ui/components/visualization/HierarchicalEdgeComponent";
import TimebarComponent from "../components/TimebarComponent";
import UploadButtonComponent from "../components/UploadButtonComponent";

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
                <UploadButtonComponent> </UploadButtonComponent>
                <TimebarComponent main={vnode.attrs.main}></TimebarComponent>
                <div class="visualizations">
                    <HierarchicalEdgeComponent main={vnode.attrs.main}></HierarchicalEdgeComponent>
                    <NodeLinkDiagramComponent main={vnode.attrs.main}></NodeLinkDiagramComponent>
                </div>
            </div>
        );
        // HTML syntax that is returned may only contain one root element
        // So the following wouldn't be allowed:
        // return (<div></div> <div></div>)
    }
}