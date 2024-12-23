import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-slots-list',
	templateUrl: './slots-list.component.html',
})
export class SlotsListComponent {
	@Input() slots: Date[] = [];
}
