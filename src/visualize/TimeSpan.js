/**
 * The TimeSpan class is in control of a time span. You can step the time span forwards until you reach the end of the timestamp.
 */
export default class TimeSpan {
    constructor({minTime, maxTime, startTime, endTime, stepSize = 24*3600*1000} = {}) {
        this.minTime = minTime;
        this.maxTime = maxTime;
        this.startTime = startTime;
        this.endTime = endTime;
        this.stepSize = stepSize;
    }

    /**
     * Steps the time span. In the case that the time span reaches the maximum time it will stop adding time to the end time.
     */
    step() {
        this.startTime += this.stepSize;
        this.endTime += this.stepSize;

        if(this.endTime > this.maxTime) {
            this.endTime = this.maxTime;
        }
    }

    /**
     * @returns If the time span has ended, meaning endTime is equal to maxTime.
     */
    hasEnded() {
        return this.endTime === this.maxTime;
    }
}