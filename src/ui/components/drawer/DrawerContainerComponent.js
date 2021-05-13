import m from "mithril";

export default class DrawerContainerComponent {
    view(vnode) {
        return (
            <div class={`drawer-container${vnode.attrs.right ? " right" : ""}`}>
				{vnode.children}
			</div>
        );
    }
}