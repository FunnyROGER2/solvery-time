import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ActionService {
	private _eventSlotRemovedSubject = new Subject<Date>();
	eventSlotRemoved$ = this._eventSlotRemovedSubject.asObservable();

	slotRemoved(slot: Date) {
		this._eventSlotRemovedSubject.next(slot);
	}
}
