import m from "mithril";
import IndexView from "@/ui/views/index";

export default class UIHandler {
	constructor(main) {
		// We set a reference to our main class for later use
		this.main = main;
	}

	render() {
		// Here we route multiple views to their respective url handles. We then 'mount' this to
		// the body, which means we add them as a child of the body.
		m.route(document.body, "/", {
			"/": IndexView
		});
	}
}