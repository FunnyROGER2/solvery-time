import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { SwitcherComponent } from './components/switcher/switcher.component';
import { SvgComponent } from './components/svg/svg.component';
import { ButtonComponent } from './components/button/button.component';
import { LoaderComponent } from './components/loader/loader.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';

@NgModule({
	declarations: [
		AppComponent,
		CalendarComponent,
		SwitcherComponent,
		SvgComponent,
		ButtonComponent,
		LoaderComponent,
		CheckboxComponent,
	],
	imports: [BrowserModule, AppRoutingModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
