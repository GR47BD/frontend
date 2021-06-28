import m from "mithril";
import VisualizationPanelComponent from "@/ui/components/visualization/VisualizationPanelComponent";
import NodeLinkDiagramComponent from "@/ui/components/visualization/NodeLinkDiagramComponent";
import HierarchicalEdgeComponent from "@/ui/components/visualization/HierarchicalEdgeComponent";
import MassiveSequenceComponent from "@/ui/components/visualization/MassiveSequenceComponent";
import TimebarComponent from "@/ui/components/TimebarComponent";

export default class VisualizationContainerComponent {
    view(vnode) {
		const main = vnode.attrs.main;

        return (
            <div class="visualization-container">
				<VisualizationPanelComponent name="Node-Link Diagram" half={true} help="node-link">
					<NodeLinkDiagramComponent main={main}></NodeLinkDiagramComponent>
				</VisualizationPanelComponent>
				<VisualizationPanelComponent name="Hierarchical Edge Bundling" half={true} help="hierarchical-edge">
					<HierarchicalEdgeComponent main={main}></HierarchicalEdgeComponent>
				</VisualizationPanelComponent>

				<TimebarComponent main={main}></TimebarComponent>

				<VisualizationPanelComponent name="Massive Sequence View" half={false} help="massive-sequence">
					<MassiveSequenceComponent main={main}></MassiveSequenceComponent>
				</VisualizationPanelComponent>
			</div>
        );
    }
}