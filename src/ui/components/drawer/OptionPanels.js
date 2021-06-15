import m from "mithril";

export default class OptionPanels {
	constructor(main) {
		this.main = main;

		this.visualizations = {
			"HierarchicalEdgeComponent": {
				name: "HierarchicalEdgeComponent",
				options: [
					{
						text: "Line Tension",
						group: "lineOptions",
						key: "tension",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					}
				]
			},
			"MassiveSequenceComponent": {
				options: []
			},
			"NodeLinkDiagram": {
				options: []
			}
		}
	}

	buildDefault(text, content) {
		return (
			<div class="option-item">
				<div class="key">{text}</div>
				<div class="value">{content}</div>
			</div>
		);
	}

	onChangeUpdate(value, group, key, name) {
		const visualization = this.main.visualizer.getVisualization(name);

		console.log(value, visualization);
		visualization[group][key] = value;
		visualization.update();
	}

	build(name) {
		const visualizationOptions = this.visualizations[name];
		const visualization = this.main.visualizer.getVisualization(name);
		const elements = [];

		if(visualization === undefined) return [];

		for(const option of visualizationOptions.options) {
			switch(option.type) {
				case "number": 
					elements.push(this.buildDefault(option.text, (
						<input type="number" min={option.min} max={option.max} step={option.step} value={visualization[option.group][option.key]} onchange={e => this.onChangeUpdate(parseFloat(e.target.value), option.group, option.key, name)}/>
					)));
					break;
			}
		}

		return elements;
	}
}