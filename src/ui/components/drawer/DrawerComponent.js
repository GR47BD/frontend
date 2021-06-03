import m from "mithril";

const arrowSvg = m.trust(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z"/></svg>`);

export default class DrawerComponent {
    toggleDrawerContainer(id) {
        const drawer = document.getElementById(id);
        const drawerButton = document.getElementById(`${id}-button`);

        drawer.parentNode.classList.toggle("closed");
        drawerButton.classList.toggle("open");
    }

    view(vnode) {
        return (
            <div class={vnode.attrs.right ? "drawer right" : "drawer"} id={vnode.attrs.id}>
                {vnode.attrs.topless ? "" : (
                    <div class="top">
                        {vnode.attrs.right ? (<div class="button open" id={`${vnode.attrs.id}-button`} onclick={() => this.toggleDrawerContainer(vnode.attrs.id)}>{arrowSvg}</div>) : ""}
                        <div class="title">{vnode.attrs.title}</div>
                        {vnode.attrs.right ? "" : (<div class="button open" id={`${vnode.attrs.id}-button`} onclick={() => this.toggleDrawerContainer(vnode.attrs.id)}>{arrowSvg}</div>)}
                    </div>
                )}
                <div class="content">{vnode.children}</div>
            </div>
        );
    }
}