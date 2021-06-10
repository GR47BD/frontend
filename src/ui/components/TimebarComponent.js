import m from "mithril";
import noUiSlider from 'nouislider';

const playSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 22v-20l18 10-18 10z"/></svg>`;
const pauseSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M11 22h-4v-20h4v20zm6-20h-4v20h4v-20z"/></svg>`;
const stopSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M2 2h20v20h-20z"/></svg>`;

export default class TimebarComponent {
	oninit(vnode) {
        this.main = vnode.attrs.main;
		this.main.timebar = this;
		this.playing = false;
    }

	oncreate() {
		const fromInput = document.getElementById('timebar-from');
		const toInput = document.getElementById('timebar-to');
		const sliderElement = document.getElementById('timebar-slider');
		const timeSpan = this.main.dataHandler.timeSpan;

		fromInput.valueAsDate = new Date(timeSpan.startTime);
		toInput.valueAsDate = new Date(timeSpan.endTime);

		// Create the slider with default settings
		this.slider = noUiSlider.create(sliderElement, {
			start: [timeSpan.startTime, timeSpan.endTime],
			connect: true,
			range: {
				'min': timeSpan.minTime || 0,
				'max': timeSpan.maxTime || 1
			}
		});

		// Change input fields and timespan when slider is changed
		this.slider.on('end', (values, handle) => {
			if(handle === 0) {
				fromInput.valueAsDate = new Date(parseInt(values[handle]));
			}
			else {
				toInput.valueAsDate = new Date(parseInt(values[handle]));
			}

			this.updateTimespan();
		});

		// Change slider and timespan when the input is changed
		fromInput.addEventListener('input', () => {
			if(fromInput.valueAsDate.getTime() < toInput.valueAsDate.getTime()) {
				this.slider.set([fromInput.valueAsDate.getTime(), null])
			}
			else {
				fromInput.valueAsDate = toInput.valueAsDate;
			}

			this.updateTimespan();
		});

		// Change slider and timespan when the input is changed
		toInput.addEventListener('input', () => {
			if(toInput.valueAsDate.getTime() > fromInput.valueAsDate.getTime()) {
				this.slider.set([null, fromInput.valueAsDate.getTime()])
			}
			else {
				toInput.valueAsDate = fromInput.valueAsDate;
			}

			this.updateTimespan();
		});
	}

	/**
	 * This function updates the slider and input fields when the timespan has changed.
	 */
	update() {
		const timeSpan = this.main.dataHandler.timeSpan;

		this.slider.updateOptions({
			range: {
				'min': timeSpan.minTime || 0,
				'max': timeSpan.maxTime || 1
			}
		})
		this.slider.set([timeSpan.startTime, timeSpan.endTime]);

		document.getElementById('timebar-from').valueAsDate = new Date(timeSpan.startTime);
		document.getElementById('timebar-to').valueAsDate = new Date(timeSpan.endTime);
	}

	/**
	 * This function makes sure the time span is updated, and that the data corresponds the changed time span.
	 */	
	updateTimespan() {
		const sliderValues = this.slider.get();

		this.main.dataHandler.timeSpan.startTime = parseInt(sliderValues[0]);
		this.main.dataHandler.timeSpan.endTime = parseInt(sliderValues[1]);

		this.main.dataHandler.updateTimed(true);
	}

	/**
	 * This function toggles the animator.
	 */
	togglePlayPause() {
		this.main.visualizer.animator.toggle();

		const timebarPlayButton = document.getElementById("timebar-play");

		if(this.playing) {
			timebarPlayButton.innerHTML = playSvg;
			this.playing = false;
		}
		else {
			timebarPlayButton.innerHTML = pauseSvg;
			this.playing = true;
		}
	}

	/**
	 * This function stops the animator.
	 */
	stop() {
		this.main.visualizer.animator.reset();
	}

    view() {
        return (
            <div class="timebar">
				<div class="dates">
					<div class="row">
						<div class="text">from</div>
						<input id="timebar-from" class="value" type="date"/>
					</div>
					<div class="row">
						<div class="text">to</div>
						<input id="timebar-to" class="value" type="date" />
					</div>
				</div>
				<div class="slidebar">
					<div id="timebar-slider"></div>
				</div>
				<div class="buttons">
					<div class="button" id="timebar-play" onclick={() => this.togglePlayPause()}>{m.trust(playSvg)}</div>
					<div class="button" id="timebar-stop" onclick={() => this.stop()}>{m.trust(stopSvg)}</div>
				</div>
			</div>
        );
    }
}