import m from "mithril";
import noUiSlider from 'nouislider';

export default class TimebarComponent {
	oninit(vnode) {
        this.main = vnode.attrs.main;
		this.main.timebar = this;
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
					<div class="button" id="timebar-play" onclick={() => this.togglePlayPause()}>Play/Pause</div>
					<div class="button" id="timebar-stop" onclick={() => this.stop()}>Stop</div>
				</div>
			</div>
        );
    }
}