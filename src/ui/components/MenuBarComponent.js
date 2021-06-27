import m from "mithril";

export default class MenuBarComponent {
    view() {
        return (	
            <div class="menubar">
				<div class="logo">Plutode</div>	
				<div class="links">
					<div class="link" onclick={() => m.route.set("/")}>Home</div>
					<div class="link" onclick={() => m.route.set("/visualize")}>Visualize</div>
					<div class="link" onclick={() => window.open("https://github.com/GR47BD")}>Github</div>
				</div>
			</div>
        );
    }
}