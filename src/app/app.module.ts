import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
	BrowserAnimationsModule,
	provideAnimations,
} from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { SwitcherComponent } from './components/switcher/switcher.component';
import { SvgComponent } from './components/svg/svg.component';
import { ButtonComponent } from './components/button/button.component';
import { LoaderComponent } from './components/loader/loader.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NotifyComponent } from './components/notify/notify.component';
import { PopupComponent } from './components/popup/popup.component';
import { SlotsListComponent } from './components/slots-list/slots-list.component';

@NgModule({
	declarations: [
		AppComponent,
		CalendarComponent,
		SwitcherComponent,
		SvgComponent,
		ButtonComponent,
		LoaderComponent,
		CheckboxComponent,
		NotifyComponent,
		PopupComponent,
		SlotsListComponent,
	],
	imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule],
	providers: [provideAnimations(), DeviceDetectorService],
	bootstrap: [AppComponent],
})
export class AppModule {}
