const m = require('mithril');
import noUiSlider from 'nouislider';

export default class SliderComponent {


    constructor(main, name, index) {
        this.main = main;
        this.name = name;
        this.index = index;
        this.main.sentimentSlider = this;
    }

    oncreate() {
        const sliderElement = document.getElementById(this.name);
        const button = document.getElementById(this.name+"_button");
        const filterSelector = document.getElementById("filterSelector");
        this.sentiment = this.main.dataHandler.sentiment;
		this.slider = noUiSlider.create(sliderElement, {
			start: [this.sentiment.startSentiment, this.sentiment.endSentiment],
			connect: true,
            tooltips: [true, true],
			range: {
				'min': this.sentiment.minSentiment,
				'max': this.sentiment.maxSentiment
			}
		});
        button.addEventListener("click", () => {
            filterSelector.options[this.index].hidden = false;
            button.parentNode.parentNode.parentNode
            .removeChild(button.parentNode.parentNode);
            this.main.applyFilter.removeFilterSelector(this.name);
            this.main.sentimentSlider = undefined;
        });
    }

    update() {
        this.slider.updateOptions();
    }


    selectedFilters() {
        const selector = document.getElementById(this.name);
        let filters = [].filter.call(selector.options, option => option.selected).map(option => option.text);
        return filters;
    }

    view () {
        return [m("div", {className: "filter-item-top"}, [m("span", {className: "filter-item-title"}, this.name), m("span", {id: this.name + "_button", className: "filter-item-button"},"X")]), m("div", {id: this.name, className: "slidebar"})];
    }
}