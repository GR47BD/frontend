import m from "mithril";

export default class DrawerComponent {
    view(vnode) {
        return (
            <div class="drawer">{vnode.children}</div>
        );
    }
}