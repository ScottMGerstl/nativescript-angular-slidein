import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { SlideInDirective, SlidePosition } from '../slide-in/slide-in.directive';
import { ListPicker } from "ui/list-picker";

@Component({
    selector: 'home',
    moduleId: module.id,
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {

    @ViewChildren(SlideInDirective) private sliders: QueryList<SlideInDirective>;

    private slidePositions: Array<SlidePosition>;
    private slidePosition: SlidePosition;

    constructor() {
        this.slidePositions = [
            'left',
            'bottom',
            'top',
            'right'
        ];
        this.slidePosition = this.slidePositions[0];
    }

    private selectedIndexChanged(args): void {
        let picker = <ListPicker>args.object;
        this.slidePosition = this.slidePositions[picker.selectedIndex];
    }

    private onShowTapped(selector: string): void {
        this.sliders.find(s => s.selector === selector).show()
    }

    private onHideTapped(selector: string): void {
        this.sliders.find(s => s.selector === selector).dismiss()
    }

    private onRightDrawerDismissed(): void {
        alert('Oh no! The right view just ran away');
    }
}