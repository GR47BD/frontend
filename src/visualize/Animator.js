/**
 * The animator class is in charge of running the animation.
 */
export default class Animator {
    /**
     * @param {Number} speed The number of steps per second. 
     */
    constructor(main, {speed} = {}) {
        this.main = main;
        this.speed = speed;
    }

    /**
     * Starts the animation by setting an interval every 1000ms/speed in time.
     */
    start() {
        this.timer = setInterval(() => this.handle(), 1000/this.speed);
    }

    /**
     * Internal function that is called when the animation needs to update.
     */
    handle() {
        if(this.main.dataHandler.timeSpan.hasEnded()) {
            this.stop();

            return;
        }

        this.main.dataHandler.timeSpan.step();
        this.main.dataHandler.updateTimed(true);
    }

    /**
     * Stops the animation by clearing the interval.
     */
    stop() {
        clearInterval(this.timer);

        this.timer = undefined;
    }

    /**
     * Toggles the animation from paused to playing or back.
     */
    toggle() {
        if(this.isRunning()) {
            this.stop();
        }
        else {
            this.start();
        }
    }

    /**
     * @returns If the animation is currently running
     */
    isRunning() {
        return this.timer !== undefined;
    }

    /**
     * Resets the animations to the beginning of the whole timespan, while keeping the timespan the same length.
     */
    reset() {
        if(this.isRunning()) {
            this.stop();
        }

        const diff = this.main.dataHandler.timeSpan.diff();

        this.main.dataHandler.timeSpan.startTime = this.main.dataHandler.timeSpan.minTime;
        this.main.dataHandler.timeSpan.endTime = this.main.dataHandler.timeSpan.startTime + diff;

        this.main.dataHandler.updateTimed(true);
    }
}