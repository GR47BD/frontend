import m from "mithril";
import MenuBarComponent from "@/ui/components/MenuBarComponent";
import DrawerContainerComponent from "@/ui/components/drawer/DrawerContainerComponent";
import DrawerComponent from "@/ui/components/drawer/DrawerComponent";
import VisualizationContainerComponent from "@/ui/components/visualization/VisualizationContainerComponent";
import UploadButtonComponent from "@/ui/components/UploadButtonComponent";
import JobSelectorComponent from "@/ui/components/JobSelectorComponent";
import ApplyFilterComponent from "@/ui/components/ApplyFilterComponent";

export default class VisualizeView {
    view(vnode) {
		const main = vnode.attrs.main;
		
        return (
            <div class="view">
                <MenuBarComponent></MenuBarComponent>
				<div class="visualize-container">
					<DrawerContainerComponent>
						<DrawerComponent>Statistics</DrawerComponent>
					</DrawerContainerComponent>
					
					<VisualizationContainerComponent main={main}></VisualizationContainerComponent>

					<DrawerContainerComponent right={true}>
						<DrawerComponent>
							<UploadButtonComponent main={main}></UploadButtonComponent>
						</DrawerComponent>
						<DrawerComponent>Options
							<JobSelectorComponent main={main}></JobSelectorComponent>
							<ApplyFilterComponent main={main}></ApplyFilterComponent>
						</DrawerComponent>
					</DrawerContainerComponent>
				</div>
            </div>
        );
    }
}