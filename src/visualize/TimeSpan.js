export default class TimeSpan {
    constructor({minTime, maxTime, startTime, endTime, stepSize = 24*3600*1000} = {}) {
        this.minTime = minTime;
        this.maxTime = maxTime;
        this.startTime = startTime;
        this.endTime = endTime;
        this.stepSize = stepSize;
    }

    step() {
        this.startTime += this.stepSize;
        this.endTime += this.stepSize;

        if(this.endTime > this.maxTime) {
            this.endTime = this.maxTime;
        }
    }

    hasEnded() {
        return this.endTime === this.maxTime;
    }
}