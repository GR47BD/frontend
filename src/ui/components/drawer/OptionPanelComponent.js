import m from "mithril";

const arrowSvg = m.trust(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z"/></svg>`);

export default class OptionPanelComponent {
	toggle(id) {
		document.getElementById(`options-${id}`).classList.toggle("closed");
	}

    view(vnode) {
        return (
            <div class="option-panel" id={`options-${vnode.attrs.id}`}>
				<div class="header">
					<div class="title">{vnode.attrs.title}</div>
					<div class="line"></div>
					<div class="close" onclick={() => this.toggle(vnode.attrs.id)}>{arrowSvg}</div>
				</div>
				<div class="option-content">
					{vnode.children}
				</div>
			</div>
        );
    }
}