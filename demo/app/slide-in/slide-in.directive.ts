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
                if (change.firstChange === true || change.previousValue !== change.currentValue) {
                    this.internalSlideDurations = DurationParser.parse(this.slideDuration);
                }
            }
        }
    }

    public show(): void {

        if (!this.showAnimation || this.showAnimation.isPlaying === false) {

            if (this.hideAnimation && this.hideAnimation.isPlaying === true) {
                this.hideAnimation.cancel();
            }

            this.showAnimation = this.element.nativeElement.createAnimation({
                translate: {
                    x: this.getTranslationX(),
                    y: this.getTranslationY()
                },
                duration: this.internalSlideDurations.slideIn
            });

            this.showAnimation.play()
                .catch((reason: Error) => {
                    // throw all errors except cancellation
                    if (reason.message.indexOf('cancel') === -1) {
                        throw reason;
                    }
                });
        }
    }

    public dismiss(): void {
        if (!this.hideAnimation || this.hideAnimation.isPlaying === false) {

            if (this.showAnimation && this.showAnimation.isPlaying === true) {
                this.showAnimation.cancel();
            }

            this.hideAnimation = this.element.nativeElement.createAnimation({
                translate: {
                    x: this.getTranslationX() * -1,
                    y: this.getTranslationY() * -1
                },
                duration: this.internalSlideDurations.slideOut
            });

            this.hideAnimation.play()
                .then(() => this.dismissed.emit(true))
                .catch((reason: Error) => {
                    // throw all errors except cancellation
                    if (reason.message.indexOf('cancel') === -1) {
                        throw reason;
                    }
                });
        }
    }

    private getTranslateYHeight(): number {
        return this.element.nativeElement.getMeasuredHeight() / screenScale;
    }

    private getTranslateXWidth(): number {
        return this.element.nativeElement.getMeasuredWidth() / screenScale;
    }

    private setinitialMargin(): void {
        switch (this.slideFrom) {
            case 'top': this.element.nativeElement.marginTop = screen.mainScreen.heightDIPs * -1; break;
            case 'right': this.element.nativeElement.marginRight = screen.mainScreen.widthDIPs * -1; break;
            case 'left': this.element.nativeElement.marginLeft = screen.mainScreen.widthDIPs * -1; break;
            default: this.element.nativeElement.marginBottom = screen.mainScreen.heightDIPs * -1; break;
        }
    }

    private getTranslationY(): number {

        let y: number = 0;

        switch (this.slideFrom) {
            case 'top': y = this.getTranslateYHeight(); break;
            case 'right': y = 0; break;
            case 'left': y = 0; break;
            default: y = this.getTranslateYHeight() * -1; break;
        }

        return y;
    }

    private getTranslationX(): number {

        let x: number = 0;

        switch (this.slideFrom) {
            case 'top': x = 0; break;
            case 'right': x = this.getTranslateXWidth() * -1; break;
            case 'left': x = this.getTranslateXWidth(); break;
            default: x = 0; break;
        }

        return x;
    }
}

export type SlidePosition = 'top' | 'right' | 'bottom' | 'left';