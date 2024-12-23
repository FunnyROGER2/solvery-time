import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostListener,
	OnInit,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { PopupService } from 'src/app/services';

@Component({
	selector: 'app-popup',
	templateUrl: './popup.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupComponent implements OnInit {
	@ViewChild('popupContent', {
		read: ViewContainerRef,
	})
	popupContent!: ViewContainerRef;

	title = '';
	isVisible = false;
	private subscriptions = new Subscription();

	constructor(
		private cdr: ChangeDetectorRef,
		private popupService: PopupService
	) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.popupService.eventPopupOpen$.subscribe({
				next: (data) => {
					this.show(data.title, data.component, data.inputs);
				},
			})
		);
	}

	show(title: string, component: any, inputs?: Record<string, any>) {
		this.isVisible = true;
		this.title = title;
		this.cdr.detectChanges();
		this.popupContent?.createComponent(component, inputs);
	}

	close() {
		this.isVisible = false;
		this.popupContent?.clear();
		this.popupService.hide();
	}

	@HostListener('document:keydown.escape')
	onEscapeKeydown() {
		if (this.isVisible) {
			this.close();
		}
	}
}
