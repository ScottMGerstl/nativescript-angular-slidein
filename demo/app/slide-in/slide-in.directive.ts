import { Directive, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { screen, ScreenMetrics } from 'platform';
import { Animation } from 'tns-core-modules/ui/animation';

import { DurationParser } from './duration.parser';
import { SlideDurations, defaultSlideDuration } from './slide-durations';

const screenScale: number = screen.mainScreen.scale;

@Directive({
    selector: '[slide-in]'
})
export class SlideInDirective implements OnInit, OnChanges {

    @Input() public selector: string;

    @Input() private slideDuration: number | string;
    @Input() private slideFrom: SlidePosition;
    @Output() private dismissed: EventEmitter<boolean> = new EventEmitter<boolean>(false);

    private element: ElementRef;
    private internalSlideDurations: SlideDurations;
    private showAnimation: Animation;
    private hideAnimation: Animation;

    constructor(el: ElementRef) {
        this.element = el;
    }

    public ngOnInit(): void {
        this.setinitialMargin();
        this.internalSlideDurations = DurationParser.parse(this.slideDuration);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        for (let propName in changes) {
            let change = changes[propName];

            if (propName === 'slideDuration') {

                // if the slideDduration changes, calulate it into an internal model
                if (change.firstChange === true || change.previousValue !== change.currentValue) {
                    this.internalSlideDurations = DurationParser.parse(this.slideDuration);
                }
            }
        }
    }

    /**
     * Shows the view. If the view is in the process of dismissing,
     * it will interrupt the dismiss animation, cancel it, and start the show animation
     *
     * @memberof SlideInDirective
     */
    public show(): void {

        // if the show animation is already running, don't execute again
        if (!this.showAnimation || this.showAnimation.isPlaying === false) {

            this.setMeasuredMargin();

            // if the hide animation is running, cancel it so the show animation can take over
            if (this.hideAnimation && this.hideAnimation.isPlaying === true) {
                this.hideAnimation.cancel();
            }

            // create the cancellable show animation
            this.showAnimation = this.element.nativeElement.createAnimation({
                translate: {
                    x: this.getOnScreenTranslationX(),
                    y: 0
                },
                duration: this.internalSlideDurations.slideIn
            });

            // run the animation
            this.showAnimation.play()
                .catch((reason: Error) => {
                    this.throwIfNotCancelled(reason);
                });
        }
    }

    /**
     * dismisses the view. If the view is in the process of showing,
     * it will interrupt the show animation, cancel it, and start the dismiss animation.
     * If the dismiss animation completes successfully without being cancelled, the dismissed event will be emitted
     *
     * @memberof SlideInDirective
     */
    public dismiss(): void {
        // if the hide animation is already running, don't execute again
        if (!this.hideAnimation || this.hideAnimation.isPlaying === false) {

            // if the show animation is running, cancel it so the hide animation can take over
            if (this.showAnimation && this.showAnimation.isPlaying === true) {
                this.showAnimation.cancel();
            }

            // create the cancellable hide animation
            this.hideAnimation = this.element.nativeElement.createAnimation({
                translate: {
                    x: this.getOffScreenTranslationX(),
                    y: this.getOffScreenTranslationY()
                },
                duration: this.internalSlideDurations.slideOut
            });

            // run the animation
            this.hideAnimation.play()
                .then(() => {
                    // notify when the dismiss has finished successfully
                    this.dismissed.emit(true)
                })
                .catch((reason: Error) => {
                    this.throwIfNotCancelled(reason);
                });
        }
    }

    /**
     * Sets an initial margin on the view based on the slideFrom input to move the view far off
     * the screen on the side it will slide in from
     *
     * @private
     * @memberof SlideInDirective
     */
    private setinitialMargin(): void {
        switch (this.slideFrom) {
            case 'top': this.element.nativeElement.translateY = -3000; break;
            case 'right': this.element.nativeElement.translateX = 3000; break;
            case 'left': this.element.nativeElement.translateX = -3000; break;
            default: this.element.nativeElement.translateY = 3000; break;
        }
    }

    /**
     * After the element can be measured, sets a margin on the view based on the slideFrom input to move the view off
     * the screen by so the edge of the view is just off screen on the side it will slide in from
     *
     * @private
     * @memberof SlideInDirective
     */
    private setMeasuredMargin(): void {
        switch (this.slideFrom) {
            case 'top': this.element.nativeElement.translateY = this.getOffScreenTranslationY(); break;
            case 'right': this.element.nativeElement.translateX = this.getOffScreenTranslationX(); break;
            case 'left': this.element.nativeElement.translateX = this.getOffScreenTranslationX(); break;
            default: this.element.nativeElement.translateY = this.getOffScreenTranslationY(); break;
        }
    }

    /**
     * Gets the distance to translate on the Y axis based on the slideFrom input.
     * If sliding from left or right, translation is 0.
     * If sliding from top, the tranlation is the height of the view .
     * If sliding from bottom (default), the tranlation is the negative height of the view.
     *
     * @private
     * @returns {number} the distance to translate Y
     * @memberof SlideInDirective
     */
    private getOffScreenTranslationY(): number {

        let y: number = 0;

        switch (this.slideFrom) {
            case 'top': y = this.getTranslateYHeight() * -1; break;
            case 'right': y = 0; break;
            case 'left': y = 0; break;
            default: y = this.getTranslateYHeight(); break;
        }

        return y;
    }

    /**
     * Gets the distance to translate on the X axis based on the slideFrom input.
     * If sliding from top or bottom (default), translation is 0.
     * If sliding from left, the tranlation is the width of the view .
     * If sliding from right, the tranlation is the negative width of the view.
     *
     * @private
     * @returns {number}
     * @memberof SlideInDirective
     */
    private getOnScreenTranslationX(): number {

        let x: number = 0;
        let baseX: number = (screen.mainScreen.widthDIPs - this.getViewWidth()) / 2;

        switch (this.slideFrom) {
            case 'top': x = 0; break;
            case 'right': x = baseX; break;
            case 'left': x = baseX * -1; break;
            default: x = 0; break;
        }

        return x;
    }

    /**
     * Gets the distance to translate on the X axis based on the slideFrom input.
     * If sliding from top or bottom (default), translation is 0.
     * If sliding from left, the tranlation is the width of the view .
     * If sliding from right, the tranlation is the negative width of the view.
     *
     * @private
     * @returns {number}
     * @memberof SlideInDirective
     */
    private getOffScreenTranslationX(): number {

        let x: number = 0;

        switch (this.slideFrom) {
            case 'top': x = 0; break;
            case 'right': x = this.getTranslateXWidth(); break;
            case 'left': x = this.getTranslateXWidth() * -1; break;
            default: x = 0; break;
        }

        return x;
    }

    /**
     * Gets the height of the element to be used as the distance to translate on the Y axis
     *
     * @private
     * @returns {number} the measured height of the view
     * @memberof SlideInDirective
     */
    private getTranslateYHeight(): number {
        return this.element.nativeElement.getMeasuredHeight() / screenScale;
    }

    /**
     * Gets the width of the element to be used as the distance to translate on the X axis
     *
     * @private
     * @returns {number} thw mwasured width of the view
     * @memberof SlideInDirective
     */
    private getTranslateXWidth(): number {
        return (this.getViewWidth() + (screen.mainScreen.widthDIPs - this.getViewWidth()) / 2);
    }

    /**
     * Gets the width of the element to be used as the distance to translate on the X axis
     *
     * @private
     * @returns {number} thw mwasured width of the view
     * @memberof SlideInDirective
     */
    private getViewWidth(): number {
        return this.element.nativeElement.getMeasuredWidth() / screenScale;
    }

    /**
     * checks the error to determine if the error was caused by cancelling the animation.
     * If it was not caused by cancellation, throw the error. If it was cancellation, ignore as
     * it was intentional
     *
     * @private
     * @param {Error} err the error received in the catch call of the promise returned by the play function of the animation in show and dismiss
     * @memberof SlideInDirective
     */
    private throwIfNotCancelled(err: Error) {
        if (err.message.indexOf('cancel') === -1) {
            throw err;
        }
    }
}

export type SlidePosition = 'top' | 'right' | 'bottom' | 'left';