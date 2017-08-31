import { Component, ViewChild, ElementRef } from '@angular/core';
import { SlideInDirective } from '../slide-in.directive';

@Component({
    selector: 'home',
    moduleId: module.id,
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {

    @ViewChild(SlideInDirective) private slider: SlideInDirective;

    private onShowTapped(): void {
        this.slider.show()
    }

    private onHideTapped(): void {
        this.slider.dismiss()
    }
}