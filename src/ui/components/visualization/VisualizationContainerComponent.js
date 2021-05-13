import m from "mithril";
import VisualizationPanelComponent from "@/ui/components/visualization/VisualizationPanelComponent";
import NodeLinkDiagramComponent from "@/ui/components/visualization/NodeLinkDiagramComponent";
import HierarchicalEdgeComponent from "@/ui/components/visualization/HierarchicalEdgeComponent";
import TimebarComponent from "@/ui/components/TimebarComponent";

export default class VisualizationContainerComponent {
    view(vnode) {
		const main = vnode.attrs.main;

        return (
            <div class="visualization-container">
				<VisualizationPanelComponent name="Node-Link Diagram" half={true}>
					<NodeLinkDiagramComponent main={main} ></NodeLinkDiagramComponent>
				</VisualizationPanelComponent>
				<VisualizationPanelComponent name="Hierarchical Edge Bundling" half={true}>
					<HierarchicalEdgeComponent main={main} ></HierarchicalEdgeComponent>
				</VisualizationPanelComponent>

				<TimebarComponent main={main} ></TimebarComponent>
			</div>
        );
    }
}