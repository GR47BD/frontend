import m from "mithril";
import logo from "../../../resources/images/logo.png";

export default class MenuBarComponent {
	constructor() {
		this.size = 80;
	}

	toggleCircle() {
		document.getElementById("logo-circle").classList.toggle("visible");
	}

	moveCircle(x, y) {
		x = x - this.size / 2;
		y = y - this.size / 2;

		const element = document.getElementById("logo-circle");
		element.style.top = `${y}px`;
		element.style.left = `${x}px`;
	}

    view() {
        return (	
            <div class="menubar">
				<div class="logo" onmouseenter={e => this.toggleCircle()} onmouseleave={e => this.toggleCircle()} onmousemove={e => this.moveCircle(e.offsetX, e.offsetY)}>
					<div class="effect"><div class="circle" id="logo-circle"></div></div>
					<img class="image" src={logo}></img>
				</div>	
				<div class="links">
					<div class="link" onclick={() => m.route.set("/")}>Home</div>
					<div class="link" onclick={() => {window.location = "/#!/visualize"; window.location.reload()}}>Visualize</div>
					<div class="link" onclick={() => window.open("https://github.com/GR47BD")}>Github</div>
				</div>
			</div>
        );
    }
}