import m from "mithril";
import IndexView from "@/ui/views/index";

export default class UIHandler {
	constructor(app) {
		this.app = app;
	}

	render() {
		m.route(document.body, "/", {
			"/": IndexView
		});
	}
}