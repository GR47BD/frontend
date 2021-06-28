import m from "mithril";
import VisualizeView from "@/ui/views/VisualizeView";
import IndexView from "@/ui/views/IndexView";

export default class UIHandler {
	constructor(main) {
		// We set a reference to our main class for later use
		this.main = main;
	}

	render() {
		// Here we route multiple views to their respective url handles. We then 'mount' this to
		// the body, which means we add them as a child of the body.
		m.route(document.body,  "/", {
			"/": {view: (vnode) => {return m(IndexView, {main: this.main, scroll: vnode.attrs.scroll})}},
			"/visualize": {view: () => {return m(VisualizeView, {main: this.main})}}
		});
	}
}