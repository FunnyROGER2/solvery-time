import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActionService, PopupService } from 'src/app/services';

@Component({
	selector: 'app-slots-list',
	templateUrl: './slots-list.component.html',
})
export class SlotsListComponent implements OnInit, OnDestroy {
	@Input() slots: Date[] = [];

	private subscriptions = new Subscription();

	constructor(
		private actionService: ActionService,
		private popupService: PopupService
	) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.actionService.eventSlotRemoved$.subscribe({
				next: (slot) => {
					this.slots = this.slots.filter((s) => s !== slot);
					if (!this.slots.length) {
						this.popupService.close();
					}
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	slotRemoveHandler(slot: Date) {
		this.actionService.slotRemoved(slot);
	}
}
