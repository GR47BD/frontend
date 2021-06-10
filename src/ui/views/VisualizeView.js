import m from "mithril";
import MenuBarComponent from "@/ui/components/MenuBarComponent";
import DrawerContainerComponent from "@/ui/components/drawer/DrawerContainerComponent";
import DrawerComponent from "@/ui/components/drawer/DrawerComponent";
import VisualizationContainerComponent from "@/ui/components/visualization/VisualizationContainerComponent";
import UploadButtonComponent from "@/ui/components/UploadButtonComponent";
import ApplyFilterComponent from "@/ui/components/ApplyFilterComponent";
import StatisticsComponent from "../components/StatisticsComponent";

export default class VisualizeView {
    view(vnode) {
		const main = vnode.attrs.main;
		
        return (
            <div class="view">
                <MenuBarComponent></MenuBarComponent>
				<div class="visualize-container">
					<DrawerContainerComponent>
						<DrawerComponent title="Options" id="options-drawer">
							<ApplyFilterComponent main={main}></ApplyFilterComponent>
						</DrawerComponent>
					</DrawerContainerComponent>
					
					<VisualizationContainerComponent main={main}></VisualizationContainerComponent>

					<DrawerContainerComponent right={true}>
						<DrawerComponent title="Data" right={true} id="data-drawer">
							<UploadButtonComponent main={main}></UploadButtonComponent>
						</DrawerComponent>
						<DrawerComponent right={true} topless={true} id="statistics-drawer">
							<StatisticsComponent main={main}></StatisticsComponent>
						</DrawerComponent>
					</DrawerContainerComponent>
				</div>
            </div>
        );
    }
}