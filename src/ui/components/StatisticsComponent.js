import m from "mithril";
import * as d3 from "d3";

export default class StatisticsComponent {
	oninit(vnode) {
		this.main = vnode.attrs.main;
		this.main.statistics = this;
	}

    update() {
		this.updateContent();
    }

	updateContent() {
		m.render(document.getElementById("statistics-content"), this.drawContent())
	}

	getOptions() {
		const options = [];

		options.push({key: "general-email", group: "Emails", name: "General", type: "general-email"});

		for(const dataType of this.main.dataHandler.emailDataTypes) {
			dataType.group = "Emails";
			options.push(dataType);
		}

		options.push({key: "general-person", group: "People", name: "General", type: "general-person"});

		for(const dataType of this.main.dataHandler.personsDataTypes) {
			dataType.group = "People";
			options.push(dataType);
		}

		return options;
	}

	drawContent() {
		const selector = document.getElementById("statistics-selector");
		let optionKey;

		if(selector === null) optionKey = this.options[0].key;
		else optionKey = selector.value;

		const option = this.options.find(option => option.key === optionKey);
		
		switch(option.type) {
			case "general-email":
				var jobtitles = this.main.dataHandler.getJobTitles("all");
				var color = d3.scaleOrdinal()
					.domain(jobtitles)
					.range(d3.schemeCategory10);

				return (
					<div class="wrapper"><ul>
						<li>There are <span class="highlight">{this.main.dataHandler.data.length}</span> emails.</li>
						<li>Of which <span class="highlight">{this.main.dataHandler.filteredData.length}</span> are within the selected filter.</li>
						<li>Of which <span class="highlight">{this.main.dataHandler.timedData.length}</span> are within in the selected time span.</li>
					</ul>Legenda:<ul>
						{jobtitles.map(jobtitle => m("li", {style: {color: color(jobtitle)}}, jobtitle))}
					</ul></div>
				);
			case "general-person":
				return (
					<div class="wrapper"><ul>
						<li>There are <span class="highlight">{this.main.dataHandler.getPersons("all").length}</span> individuals.</li>
						<li>Of which <span class="highlight">{this.main.dataHandler.getPersons("filtered").length}</span> are within the selected filter.</li>
						<li>Of which <span class="highlight">{this.main.dataHandler.getPersons("timed").length}</span> are within in the selected time span.</li>
					</ul></div>
				);
			case "number":
				var emails = this.main.dataHandler.getEmails();
				var mean = emails.reduce((sum, value) => sum + value[option.key], 0) / emails.length;
				emails = emails.sort((a, b) => a[option.key] - b[option.key]);
				var median = emails%2 === 0 ? (emails[Math.floor(emails.length/2)][option.key] + emails[Math.floor(emails.length/2) + 1][option.key])/2 : emails[Math.floor(emails.length/2)][option.key];
				var percentile25 = emails[Math.floor(emails.length*.25)][option.key];
				var percentile75 = emails[Math.floor(emails.length*.75)][option.key];
				var mode = this.mode(emails.map(email => email[option.key]));

				return (
					<div class="wrapper"><ul>
						<li>For the emails shown:</li>
						<li>The mean {option.name.toLowerCase()} is <span class="highlight">{Math.round(mean * 1000) / 1000}</span>.</li>
						<li>The median {option.name.toLowerCase()} is <span class="highlight">{Math.round(median * 1000) / 1000}</span>.</li>
						<li>The {option.name.toLowerCase()} is <span class="highlight">{Math.round(percentile25 * 1000) / 1000}</span> at the 25th percentile.</li>
						<li>The {option.name.toLowerCase()} is <span class="highlight">{Math.round(percentile75 * 1000) / 1000}</span> at the 75th percentile.</li>
						<li>The mode {option.name.toLowerCase()} is <span class="highlight">{Math.round(mode * 1000) / 1000}</span>.</li>
					</ul></div>
				);
			case "date": 
				var emails = this.main.dataHandler.getEmails();
				var mean = emails.reduce((sum, value) => sum + value[option.key].getTime(), 0) / emails.length;
				var median = emails%2 === 0 ? (emails[Math.floor(emails.length/2)][option.key].getTime() + emails[Math.floor(emails.length/2) + 1][option.key].getTime())/2 : emails[Math.floor(emails.length/2)][option.key].getTime();
				var percentile25 = emails[Math.floor(emails.length*.25)][option.key].getTime();
				var percentile75 = emails[Math.floor(emails.length*.75)][option.key].getTime();
				var mode = this.mode(emails.map(email => email[option.key].getTime()));

				return (
					<div class="wrapper"><ul>
						<li>For the emails shown:</li>
						<li>The average date is <span class="highlight">{this.dateToString(new Date(mean))}</span>.</li>
						<li>The median date is <span class="highlight">{this.dateToString(new Date(median))}</span>.</li>
						<li>The date is <span class="highlight">{this.dateToString(new Date(percentile25))}</span> at the 25th percentile.</li>
						<li>The date is <span class="highlight">{this.dateToString(new Date(percentile75))}</span> at the 75th percentile.</li>
						<li>The mode {option.name.toLowerCase()} is <span class="highlight">{this.dateToString(new Date(mode))}</span>.</li>
					</ul></div>
				);
			case "category":
				var counts = {};
				var persons = this.main.dataHandler.getPersons();

				for(const person of persons) {
					if(counts[person.jobtitle] === undefined) counts[person.jobtitle] = 1;
					else counts[person.jobtitle]++;
				}

				return (
					<div class="wrapper"><ul>
						<li>For the emails shown:</li>
						{Object.keys(counts).map(jobtitle => (<li>There {counts[jobtitle]===1?"is":"are"} <span class="highlight">{counts[jobtitle]}</span> individual{counts[jobtitle]===1?"":"s"} with the jobtitle "{jobtitle}".</li>))}
					</ul></div>
				);
		}
	}

	mode(a) {
		return Object.values(
			a.reduce((count, e) => {
			if (!(e in count)) {
				count[e] = [0, e];
			}
			
			count[e][0]++;
			return count;
			}, {})
		).reduce((a, v) => v[0] < a[0] ? a : v, [0, null])[1];
	}

	dateToString(date) {
        return `${date.getDate()}-${date.getMonth()}-${("" + date.getFullYear()).substring(2,4)}`;
    }

    view() {
		this.options = this.getOptions();

        return (
			<div class="statistics">
				<div class="header">
					<div class="title">Statistics</div>
					<div class="selector">
						<select id="statistics-selector" onchange={() => this.updateContent()}>
							{this.options.map(option => m("option", {value: option.key}, `${option.group} - ${option.name}`))}
						</select>
					</div>
				</div>
				<div class="content2" id="statistics-content">
					{this.drawContent()}
				</div>
			</div>
		);
    }
}
