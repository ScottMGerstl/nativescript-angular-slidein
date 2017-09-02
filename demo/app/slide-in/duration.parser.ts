import { SlideDurations, defaultSlideDuration } from './slide-durations';

export class DurationParser {
    public static parse(value: string | number): SlideDurations {

        let result: SlideDurations;

        if(value !== undefined && value !== null) {

            if(typeof value === 'string') {
                result = this.parseString(value);
            }
            else if(typeof value === 'number') {

                const valid: boolean = this.validateNumber(value);

                if(valid === true) {
                    result = new SlideDurations(value);
                }
                else {
                    throw new Error(`slideDuration can only be supplied non-negative numbers. Found: ${value}`);
                }
            }
            // else if(value instanceof SlideDurations) {
            //     const errors: Array<string> = [];

            //     const slideInValid: boolean = this.validateNumber(value.slideIn);
            //     const slideOutValid: boolean = this.validateNumber(value.slideOut);

            //     if(slideInValid === false || slideOutValid === false) {
            //         throw new Error(`slideDuration can only be supplied non-negative numbers. Found: ${JSON.stringify(value)}`);
            //     }
            // }
        }
        else {
            // default if not supplied
            result = new SlideDurations(defaultSlideDuration);
        }

        return result;
    }

    private static parseString(value: string) {

        if(value.trim().length === 0) {
            return new SlideDurations(defaultSlideDuration);
        }

        let parts: Array<string> = value.split(',');

        if(parts.length > 2) {
            throw new Error(`slideDuration cannot be provided more than 2 values seperated by comma. Found: ${parts.length}`);
        }

        const parseErrors: Array<string> = [];
        const parsedParts: Array<number> = [];

        for(let part of parts) {
            part = part.trim();

            if(part.length > 0) {
                const parsedPart: number = +part;

                if(isNaN(parsedPart) || this.validateNumber(parsedPart) === false) {
                    parseErrors.push(`slideDuration can only be supplied non-negative numbers. Found: ${part}`);
                    continue;
                }

                parsedParts.push(parsedPart);
            }
        }

        if(parseErrors.length > 0) {
            throw new Error(parseErrors.join(', '));
        }

        if(parsedParts.length < parts.length) {
            throw new Error(`All slideDuration values must be non-negative numbers. Found: ${value}`);
        }

        const result: SlideDurations = new SlideDurations();

        result.slideIn = parsedParts[0];
        result.slideOut = parsedParts.length === 2 ? parsedParts[1] : result.slideIn;

        return result;
    }

    private static validateNumber(num: number): boolean {
        if(num < 0) {
            return false;
        }

        return true;
    }
}