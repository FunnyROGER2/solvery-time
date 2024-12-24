import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ComponentRef,
	HostListener,
	OnDestroy,
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
export class PopupComponent implements OnInit, OnDestroy {
	@ViewChild('popupContent', {
		read: ViewContainerRef,
	})
	popupContent!: ViewContainerRef;

	title = '';
	isVisible = false;
	componentRef!: ComponentRef<any>;
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

		this.subscriptions.add(
			this.popupService.eventPopupClose$.subscribe({
				next: () => {
					this.close();
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	show(title: string, component: any, inputs?: Record<string, any>) {
		this.isVisible = true;
		this.title = title;
		this.cdr.detectChanges();

		this.componentRef = this.popupContent.createComponent(component);

		if (inputs) {
			for (const [key, value] of Object.entries(inputs)) {
				(this.componentRef.instance as any)[key] = value;
			}
		}

		this.cdr.detectChanges();
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
