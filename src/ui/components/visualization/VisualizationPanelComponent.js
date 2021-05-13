import m from "mithril";

export default class VisualizationPanelComponent {
    view(vnode) {
        return (
            <div class={`visualization-panel${vnode.attrs.half ? " half" : ""}`}>
                <div class="title">{vnode.attrs.name}</div>
                <div class="content">{vnode.children}</div>
            </div>
        );
    }
}