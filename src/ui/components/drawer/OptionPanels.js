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
					},
					{
						text: "Basis Opacity",
						group: "lineOptions",
						key: "basis",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Max Extra Opacity",
						group: "lineOptions",
						key: "amountBonus",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Highlight Extra Opacity",
						group: "lineOptions",
						key: "highlightBonus",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Stroke Color",
						group: "styleOptions",
						key: "lineColor",
						type: "color"
					},
					{
						text: "Stroke In Color",
						group: "styleOptions",
						key: "lineHighlightInColor",
						type: "color"
					},
					{
						text: "Stroke Out Color",
						group: "styleOptions",
						key: "lineHighlightOutColor",
						type: "color"
					}
				]
			},
			"MassiveSequenceComponent": {
				name: "MassiveSequenceComponent",
				options: [
					{
						text: "Node Width",
						group: "sizes",
						key: "personsWidth",
						type: "number",
						min: "0",
						max: "100",
						step: "1"
					},
					{
						text: "Date Height",
						group: "sizes",
						key: "dateHeight",
						type: "number",
						min: "0",
						max: "100",
						step: "1"
					},
					{
						text: "Node Height",
						group: "sizes",
						key: "personHeight",
						type: "number",
						min: "0",
						max: "10",
						step: "1"
					},
					{
						text: "Number of Dates",
						group: "dateOptions",
						key: "number",
						type: "number",
						min: "0",
						max: "20",
						step: "1"
					},
					{
						text: "Use Gradient",
						group: "styleOptions",
						key: "useGradient",
						type: "checkbox"
					},
					{
						text: "Gradient Color 1",
						group: "styleOptions",
						key: "gradientColor1",
						type: "color"
					},
					{
						text: "Gradient Color 2",
						group: "styleOptions",
						key: "gradientColor2",
						type: "color"
					},
					{
						text: "Gradient Color 3",
						group: "styleOptions",
						key: "gradientColor3",
						type: "color"
					},
					{
						text: "Default Color",
						group: "styleOptions",
						key: "color",
						type: "color"
					},
					{
						text: "Edge Alpha",
						group: "styleOptions",
						key: "alpha",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Text Color",
						group: "styleOptions",
						key: "textColor",
						type: "color"
					},
					{
						text: "Text Hover Color",
						group: "styleOptions",
						key: "textHoverColor",
						type: "color"
					},
					{
						text: "Indicator Color",
						group: "styleOptions",
						key: "indicatorColor",
						type: "color"
					}
				]
			},
			"NodeLinkDiagram": {
				options: [
					{
						text: "Center Force Basis",
						group: "centerForce",
						key: "basis",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Center Force Assumed n",
						group: "centerForce",
						key: "divider",
						type: "number",
						min: "0",
						max: "10000",
						step: "100"
					},
					{
						text: "Center Force Penalty",
						group: "centerForce",
						key: "penalty",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Link Force Basis",
						group: "linkForce",
						key: "basis",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Link Force Assumed n",
						group: "linkForce",
						key: "divider",
						type: "number",
						min: "0",
						max: "10000",
						step: "100"
					},
					{
						text: "Link Force Penalty",
						group: "linkForce",
						key: "divider",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Link Force Bonus",
						group: "linkForce",
						key: "amountBonus",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Collide Force Strength",
						group: "collideForce",
						key: "strength",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Collide Force Min Radius",
						group: "collideForce",
						key: "minRadius",
						type: "number",
						min: "0",
						max: "100",
						step: "1"
					},
					{
						text: "Collide Force Max Radius",
						group: "collideForce",
						key: "maxRadius",
						type: "number",
						min: "0",
						max: "100",
						step: "1"
					},
					{
						text: "Collide Force Iterations",
						group: "collideForce",
						key: "iterations",
						type: "number",
						min: "0",
						max: "100",
						step: "1"
					},
					{
						text: "Edge Stroke Width",
						group: "edgeOptions",
						key: "strokeWidth",
						type: "number",
						min: "0",
						max: "5",
						step: "0.1"
					},
					{
						text: "Higlighted Edge Stroke Width",
						group: "edgeOptions",
						key: "highlightedStrokeWidth",
						type: "number",
						min: "0",
						max: "5",
						step: "0.1"
					},
					{
						text: "Edge Opacity Basis",
						group: "edgeOptions",
						key: "basis",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Edge Opacity Bonus",
						group: "edgeOptions",
						key: "amountBonus",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Edge Default Color",
						group: "edgeOptions",
						key: "defaultStroke",
						type: "color"
					},
					{
						text: "Edge Higlighted Color",
						group: "edgeOptions",
						key: "highlightedStroke",
						type: "color"
					},
					{
						text: "Node Min Radius",
						group: "nodeOptions",
						key: "minRadius",
						type: "number",
						min: "0",
						max: "50",
						step: "1"
					},
					{
						text: "Node Max Radius",
						group: "nodeOptions",
						key: "maxRadius",
						type: "number",
						min: "0",
						max: "100",
						step: "1"
					},
					{
						text: "Node Selected Fill",
						group: "nodeOptions",
						key: "selectedFill",
						type: "color"
					},
					{
						text: "Simulation Start Alpha",
						group: "simulationSettings",
						key: "startAlpha",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Simulation Alpha Target",
						group: "simulationSettings",
						key: "alphaTarget",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Simulation Alpha Decay",
						group: "simulationSettings",
						key: "alphaDecay",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Simulation Alpha Max",
						group: "simulationSettings",
						key: "maxAlpha",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01"
					},
					{
						text: "Simulation Final Threshhold",
						group: "simulationSettings",
						key: "finalPositionThreshold",
						type: "number",
						min: "0",
						max: "1",
						step: "0.0001"
					},
					{
						text: "Simulation Reset Threshhold",
						group: "simulationSettings",
						key: "resetSimulationThreshold",
						type: "number",
						min: "0",
						max: "1",
						step: "0.0001"
					}
				]
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

		console.log(name, group, key, value);

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
				case "color":
					elements.push(this.buildDefault(option.text, (
						<input type="color" value={visualization[option.group][option.key]} onchange={e => this.onChangeUpdate(e.target.value, option.group, option.key, name)}/>
					)));
					break;
				case "checkbox":
					elements.push(this.buildDefault(option.text, (
						<input type="checkbox" value={visualization[option.group][option.key]} onchange={e => this.onChangeUpdate(e.target.checked, option.group, option.key, name)}/>
					)));
					break;
			}
		}

		return elements;
	}
}