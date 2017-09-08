import { SlideDurations, defaultSlideDuration } from './slide-durations';

export class DurationParser {

    /**
     * parse the slideDuration value into a SlideDurations object
     *
     * @static
     * @param {(string | number)} value the value to parse
     * @returns {SlideDurations}
     * @memberof DurationParser
     */
    public static parse(value: string | number): SlideDurations {

        let result: SlideDurations;

        if (value === undefined || value === null) {
            // If not supplied, return default
            return new SlideDurations(defaultSlideDuration);
        }

        if (typeof value === 'string') {
            result = this.parseString(value);
        }
        else if (typeof value === 'number') {
            const valid: boolean = this.validateNumber(value);

            if (valid === true) {
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

        return result;
    }

    /**
     * given a string configuration for the slideDuration, parse it into a SlideDurations object.
     * If one numeric value is specified, it will be used for both the in and out speeds.
     * If two poisitive numeric values seperated by a comma are found, the first value is the in speed and the second value is the out speed
     * string must contain 1-2 positive numbers seperated by comma. Errors are thrown for all other scenarios
     *
     * @private
     * @static
     * @param {string} value the value to parse
     * @returns {SlideDurations} the object storing the slide in and slide out speeds
     * @memberof DurationParser
     */
    private static parseString(value: string): SlideDurations {

        if (value.trim().length === 0) {
            // If not supplied, return default
            return new SlideDurations(defaultSlideDuration);
        }

        let parts: Array<string> = value.split(',');

        if (parts.length > 2) {
            // If thre are  more than 2 values provided separated by comma, throw an error
            throw new Error(`slideDuration cannot be provided more than 2 values seperated by comma. Found: ${parts.length}`);
        }

        const parseErrors: Array<string> = [];
        const parsedParts: Array<number> = [];

        for (let part of parts) {
            part = part.trim();

            if (part.length > 0) {
                const parsedPart: number = +part;

                if (isNaN(parsedPart) || this.validateNumber(parsedPart) === false) {
                    // if the parsed value is not a number or the number is not valid, add an error and continue to the next part
                    parseErrors.push(`slideDuration can only be supplied non-negative numbers. Found: ${part}`);
                    continue;
                }

                // if the value successfully parsed, add it to the parsed collection
                parsedParts.push(parsedPart);
            }
        }

        if (parseErrors.length > 0) {
            // If there were errors, combine them into one error message and throw it to help with implementation
            throw new Error(parseErrors.join(', '));
        }

        if (parsedParts.length < parts.length) {
            // if the successfully parsed parts don't equal the number of parts in the original string, throw an error
            throw new Error(`All slideDuration values must be non-negative numbers. Found: ${value}`);
        }

        // Create and return
        const result: SlideDurations = new SlideDurations();

        result.slideIn = parsedParts[0];
        result.slideOut = parsedParts.length === 2 ? parsedParts[1] : result.slideIn;

        return result;
    }

    /**
     * valdates the number is a valid slide duration. Make sure it is greater than 0
     *
     * @private
     * @static
     * @param {number} num the value to check
     * @returns {boolean}
     * @memberof DurationParser
     */
    private static validateNumber(num: number): boolean {
        if (num < 0) {
            return false;
        }

        return true;
    }
}