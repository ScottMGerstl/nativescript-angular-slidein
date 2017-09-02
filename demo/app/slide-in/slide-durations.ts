export class SlideDurations {

    constructor(bothDurations?: number) {
        this.slideIn = bothDurations;
        this.slideOut = bothDurations;
    }

    public slideIn: number;
    public slideOut: number;
}

export const defaultSlideDuration: number = 750;
