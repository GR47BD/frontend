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
						step: "0.01",
						tooltip: "The amount of tension for the line between two nodes."
					},
					{
						text: "Basis Opacity",
						group: "lineOptions",
						key: "basis",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01",
						tooltip: "The minimum amount of opacity for a line."
					},
					{
						text: "Max Extra Opacity",
						group: "lineOptions",
						key: "amountBonus",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01",
						tooltip: "The maximum amount of added opacity when a line represents multiple emails."
					},
					{
						text: "Highlight Extra Opacity",
						group: "lineOptions",
						key: "highlightBonus",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01",
						tooltip: "The amount of extra opacity when the line is higlighted."
					},
					{
						text: "Line Color",
						group: "styleOptions",
						key: "lineColor",
						type: "color",
						tooltip: "The default color of the line."
					},
					{
						text: "Line In Color",
						group: "styleOptions",
						key: "lineHighlightInColor",
						type: "color",
						tooltip: "The color of the line when it is highlighted for an incoming email."
					},
					{
						text: "Stroke Out Color",
						group: "styleOptions",
						key: "lineHighlightOutColor",
						type: "color",
						tooltip: "The color of the line when it is highlighted for an outgoing email."
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
						step: "1",
						tooltip: "The width of the persons node."
					},
					{
						text: "Date Height",
						group: "sizes",
						key: "dateHeight",
						type: "number",
						min: "0",
						max: "100",
						step: "1",
						tooltip: "The height of the dates at the bottom."
					},
					{
						text: "Node Height",
						group: "sizes",
						key: "personHeight",
						type: "number",
						min: "0",
						max: "10",
						step: "1",
						tooltip: "The height of the persons node."
					},
					{
						text: "Number of Dates",
						group: "dateOptions",
						key: "number",
						type: "number",
						min: "0",
						max: "20",
						step: "1",
						tooltip: "The number of dates in the bottom."
					},
					{
						text: "Use Gradient",
						group: "styleOptions",
						key: "useGradient",
						type: "checkbox",
						tooltip: "If a gradient should be used when drawing the lines."
					},
					{
						text: "Gradient Color 1",
						group: "styleOptions",
						key: "gradientColor1",
						type: "color",
						tooltip: "The first color of the gradient."
					},
					{
						text: "Gradient Color 2",
						group: "styleOptions",
						key: "gradientColor2",
						type: "color",
						tooltip: "The second color of the gradient."
					},
					{
						text: "Gradient Color 3",
						group: "styleOptions",
						key: "gradientColor3",
						type: "color",
						tooltip: "The third color of the gradient."
					},
					{
						text: "Default Color",
						group: "styleOptions",
						key: "color",
						type: "color",
						tooltip: "The default color for the lines if no gradient is used."
					},
					{
						text: "Line Opacity",
						group: "styleOptions",
						key: "alpha",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01",
						tooltip: "The amount of opacity when drawing the lines."
					},
					{
						text: "Text Color",
						group: "styleOptions",
						key: "textColor",
						type: "color",
						tooltip: "The color of the text on the visualization."
					},
					{
						text: "Text Hover Color",
						group: "styleOptions",
						key: "textHoverColor",
						type: "color",
						tooltip: "The color of the text on the visualization when the mouse is on the visualization."
					},
					{
						text: "Indicator Color",
						group: "styleOptions",
						key: "indicatorColor",
						type: "color",
						tooltip: "The color of the indicator and indicator text."
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
						step: "0.01",
						tooltip: "The minimum amount for the force pulling all the nodes to the center of the visualization."
					},
					{
						text: "Center Force Assumed n",
						group: "centerForce",
						key: "divider",
						type: "number",
						min: "0",
						max: "10000",
						step: "100",
						tooltip: "The assumed amount of emails when calculating the center force for a node."
					},
					{
						text: "Center Force Penalty",
						group: "centerForce",
						key: "penalty",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01",
						tooltip: "The penalty when there are more or less emails then assumed."
					},
					{
						text: "Collide Force Strength",
						group: "collideForce",
						key: "strength",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01",
						tooltip: "The strength of the force that distances multiple nodes."
					},
					{
						text: "Collide Force Min Radius",
						group: "collideForce",
						key: "minRadius",
						type: "number",
						min: "0",
						max: "100",
						step: "1",
						tooltip: "The minimum radius between two nodes."
					},
					{
						text: "Collide Force Max Radius",
						group: "collideForce",
						key: "maxRadius",
						type: "number",
						min: "0",
						max: "100",
						step: "1",
						tooltip: "The maximum radius between two nodes."
					},
					{
						text: "Collide Force Iterations",
						group: "collideForce",
						key: "iterations",
						type: "number",
						min: "0",
						max: "100",
						step: "1",
						tooltip: "The number of iterations when calculation the collision force."
					},
					{
						text: "Line Width",
						group: "edgeOptions",
						key: "strokeWidth",
						type: "number",
						min: "0",
						max: "5",
						step: "0.1",
						tooltip: "The width of the lines."
					},
					{
						text: "Higlighted Line Width",
						group: "edgeOptions",
						key: "highlightedStrokeWidth",
						type: "number",
						min: "0",
						max: "5",
						step: "0.1",
						tooltip: "The width of the lines when highlighted."
					},
					{
						text: "Line Opacity Basis",
						group: "edgeOptions",
						key: "basis",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01",
						tooltip: "The minimum amount of opacity for a line."
					},
					{
						text: "Line Opacity Bonus",
						group: "edgeOptions",
						key: "amountBonus",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01",
						tooltip: "The maximum added amount of opacity when a line represents more emails."
					},
					{
						text: "Line Default Color",
						group: "edgeOptions",
						key: "defaultStroke",
						type: "color",
						tooltip: "The default color of a line."
					},
					{
						text: "Line Higlighted Color",
						group: "edgeOptions",
						key: "highlightedStroke",
						type: "color",
						tooltip: "The highlighted color of a line."
					},
					{
						text: "Node Min Radius",
						group: "nodeOptions",
						key: "minRadius",
						type: "number",
						min: "0",
						max: "50",
						step: "1",
						tooltip: "The minimum radius size of a node."
					},
					{
						text: "Node Max Radius",
						group: "nodeOptions",
						key: "maxRadius",
						type: "number",
						min: "0",
						max: "100",
						step: "1",
						tooltip: "The maximum radius size of a node."
					},
					{
						text: "Node Selected Color",
						group: "nodeOptions",
						key: "selectedFill",
						type: "color",
						tooltip: "The color of node when it is selected."
					},
					{
						text: "Simulation Start Alpha",
						group: "simulationSettings",
						key: "startAlpha",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01",
						tooltip: "The amount of movement allowed in the simulation when starting."
					},
					{
						text: "Simulation Alpha Target",
						group: "simulationSettings",
						key: "alphaTarget",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01",
						tooltip: "The amount of movement for the simulation that is targeted."
					},
					{
						text: "Simulation Alpha Decay",
						group: "simulationSettings",
						key: "alphaDecay",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01",
						tooltip: "The amount that the simulation alpha decays per iteration."
					},
					{
						text: "Simulation Alpha Max",
						group: "simulationSettings",
						key: "maxAlpha",
						type: "number",
						min: "0",
						max: "1",
						step: "0.01",
						tooltip: "The highest allowed alpha for the simulation."
					},
					{
						text: "Simulation Final Threshhold",
						group: "simulationSettings",
						key: "finalPositionThreshold",
						type: "number",
						min: "0",
						max: "1",
						step: "0.0001",
						tooltip: "The threshhold for the amount of change in the data displayed to trigger a lot of movement."
					},
					{
						text: "Simulation Reset Threshhold",
						group: "simulationSettings",
						key: "resetSimulationThreshold",
						type: "number",
						min: "0",
						max: "1",
						step: "0.0001",
						tooltip: "The threshhold for the amount of change in the data to reset the simulation."
					}
				]
			}
		}
	}

	setTooltip(element, text) {
		const tooltip = document.getElementById("tooltip");
		const bounds = element.getBoundingClientRect();
		tooltip.innerText = text;
		tooltip.style.display = "initial";
		tooltip.style.top = `${bounds.top}px`;
		tooltip.style.left = `${bounds.right + 5}px`;
	}

	removeTooltip() {
		document.getElementById("tooltip").style.display = "none";
	}

	buildDefault(text, tooltip, content) {
		return (
			<div class="option-item" onmouseenter={e => this.setTooltip(e.target, tooltip)} onmouseleave={() => this.removeTooltip()}>
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
					elements.push(this.buildDefault(option.text, option.tooltip, (
						<input type="number" min={option.min} max={option.max} step={option.step} value={visualization[option.group][option.key]} onchange={e => this.onChangeUpdate(parseFloat(e.target.value), option.group, option.key, name)}/>
					)));
					break;
				case "color":
					elements.push(this.buildDefault(option.text, option.tooltip, (
						<input type="color" value={visualization[option.group][option.key]} onchange={e => this.onChangeUpdate(e.target.value, option.group, option.key, name)}/>
					)));
					break;
				case "checkbox":
					elements.push(this.buildDefault(option.text, option.tooltip, (
						<input type="checkbox" value={visualization[option.group][option.key]} onchange={e => this.onChangeUpdate(e.target.checked, option.group, option.key, name)}/>
					)));
					break;
			}
		}

		return elements;
	}
}