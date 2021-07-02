import m from "mithril";
import MenuBarComponent from "@/ui/components/MenuBarComponent";
import DrawerContainerComponent from "@/ui/components/drawer/DrawerContainerComponent";
import DrawerComponent from "@/ui/components/drawer/DrawerComponent";
import VisualizationContainerComponent from "@/ui/components/visualization/VisualizationContainerComponent";
import UploadButtonComponent from "@/ui/components/UploadButtonComponent";
import ApplyFilterComponent from "@/ui/components/ApplyFilterComponent";
import StatisticsComponent from "@/ui/components/StatisticsComponent";
import OptionPanelComponent from "@/ui/components/drawer/OptionPanelComponent";
import OptionPanels from "@/ui/components/drawer/OptionPanels";
import SelectDataFileComponent from "@/ui/components/SelectDataFileComponent";

export default class VisualizeView {
    view(vnode) {
		const main = vnode.attrs.main;
		const optionPanels = new OptionPanels(main);
		
        return (
            <div class="view">
                <MenuBarComponent></MenuBarComponent>
				<div class="visualize-container">
					<DrawerContainerComponent>
						<DrawerComponent title="Options" id="options-drawer">
							<OptionPanelComponent title="Filters" id="filters">
								<ApplyFilterComponent main={main}></ApplyFilterComponent>
							</OptionPanelComponent>
							<OptionPanelComponent title="Node-link diagram" id="viz1">
								{optionPanels.build("NodeLinkDiagram")}
							</OptionPanelComponent>
							<OptionPanelComponent title="Hierarichal edge bundling" id="viz2">
								{optionPanels.build("HierarchicalEdgeComponent")}
							</OptionPanelComponent>
							<OptionPanelComponent title="massive sequence view" id="viz3">
								{optionPanels.build("MassiveSequenceComponent")}
							</OptionPanelComponent>
						</DrawerComponent>
					</DrawerContainerComponent>
					
					<VisualizationContainerComponent main={main}></VisualizationContainerComponent>

					<DrawerContainerComponent right={true}>
						<DrawerComponent title="Data" right={true} id="data-drawer">
							<UploadButtonComponent main={main}></UploadButtonComponent>
							<SelectDataFileComponent main={main}></SelectDataFileComponent>
						</DrawerComponent>
						<DrawerComponent right={true} topless={true} id="statistics-drawer">
							<StatisticsComponent main={main}></StatisticsComponent>
						</DrawerComponent>
					</DrawerContainerComponent>
					<div class="tooltip" id="tooltip"></div>
				</div>
            </div>
        );
    }
}