import { Directive, ElementRef, EventEmitter, Output } from '@angular/core';
import { screen, ScreenMetrics } from 'platform';

const screenScale: number = screen.mainScreen.scale;
const offScreenMargin: number = screen.mainScreen.heightDIPs * -1;

@Directive({
    selector: '[slide-in]'
})
export class SlideInDirective {

    @Output() private dismissed: EventEmitter<boolean> = new EventEmitter<boolean>(false);

    private element: ElementRef;

    constructor(el: ElementRef) {
        this.element = el;
        this.element.nativeElement.marginBottom = offScreenMargin;
    }

    public show(): void {
        this.element.nativeElement.animate({
            translate: { x: 0, y: this.getTranslateYHeight() * -1 },
            duration: 750
        });
    }

    public dismiss(): void {
        this.element.nativeElement.animate({
            translate: { x: 0, y: this.getTranslateYHeight() },
            duration: 750
        })
        .then(() => this.dismissed.emit(true));
    }

    private getTranslateYHeight(): number {
        return this.element.nativeElement.getMeasuredHeight() / screenScale;
    }
}