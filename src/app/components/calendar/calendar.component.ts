import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	TemplateRef,
} from '@angular/core';
import {
	addDays,
	addHours,
	addMinutes,
	addMonths,
	addWeeks,
	addYears,
	format,
	isAfter,
	isBefore,
	isMonday,
	isSameMonth,
	lastDayOfMonth,
	previousMonday,
	startOfDay,
	startOfHour,
	startOfMinute,
	startOfMonth,
	startOfWeek,
	startOfYear,
	subDays,
	subHours,
	subMonths,
	subWeeks,
	subYears,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { Subscription } from 'rxjs';
import { calendarModeNames } from 'src/app/enums';
import { CalendarDate, SwitcherItem } from 'src/app/interfaces';
import { CalendarMode } from 'src/app/types';

@Component({
	selector: 'app-calendar',
	templateUrl: './calendar.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements OnInit, OnDestroy {
	private nowDate = new Date();
	private lastDateOfCurrentMonth!: Date;
	private firstMonday!: Date;
	private isCalendarInited = false;
	private _visibleDate = this.nowDate;

	private subscriptions = new Subscription();

	@Input() activeMode: CalendarMode = 'week';
	@Input() selectedDate = this.nowDate;
	@Input() hideCurrentPeriod = false;
	@Input() hideModeSwitch = false;
	@Input() daysPerWeek: number | string = 7;
	@Input() weekendDays = [5, 6];
	@Input() rowsNumber!: number;
	@Input() disabledBefore: Date | undefined;
	@Input() disabledAfter: Date | undefined;
	@Input() urlMode = false;

	/**
	 * При получении значения всегда обновляем календарь, если она обновилась
	 * и записываем новую дату в _visibleDate именно при генерации
	 */
	@Input() get visibleDate(): Date {
		return this._visibleDate;
	}
	set visibleDate(value: Date) {
		this.isCalendarInited &&
			+this._visibleDate !== +value &&
			this.generateCalendar({
				date: value,
			});
	}

	calendarArray: CalendarDate[][] = [];
	daysOfWeek: string[] = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

	@Output() dateSelected = new EventEmitter<{
		date: Date;
		mode: CalendarMode;
	}>();
	@Output() created = new EventEmitter();
	@Output() modeSelected = new EventEmitter<CalendarMode>();
	@Output() visibleDateSelected = new EventEmitter<Date>();

	@ContentChild('navTemplate') navTemplate: TemplateRef<unknown> | undefined;

	constructor(private cdr: ChangeDetectorRef) {}

	ngOnInit() {
		/**
		 * Режим календаря выбран (для родителя),
		 * календарь генерируется с переданной из родителя датой,
		 * родитель уведомляется, флаг об инициализации ставится в true
		 * (чтобы только после этой генерации срабатывала генерация из сеттера visibleDate())
		 */
		this.modeSelected.emit(this.activeMode);
		this.generateCalendar({
			date: this.selectedDate,
		});
		this.created.emit();
		this.isCalendarInited = true;
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get calendarModes(): SwitcherItem[] {
		return Object.keys(calendarModeNames).map((item) => {
			return {
				text: calendarModeNames[item as CalendarMode],
				value: item,
			};
		});
	}

	get visiblePeriod() {
		let result = '';
		switch (this.activeMode) {
			case 'year':
				result = format(this.visibleDate, "yyyy 'г.'", {
					locale: ru,
				});
				break;
			case 'week':
			case 'day':
				result = format(this.visibleDate, "yyyy 'г.' / dd MMMM", {
					locale: ru,
				});
				break;
			case 'day':
				result = format(this.visibleDate, "yyyy 'г.' / dd MMMM", {
					locale: ru,
				});
				break;
			case 'hour':
				result = format(
					this.visibleDate,
					"yyyy 'г.' / dd MMMM / HH 'ч'",
					{
						locale: ru,
					}
				);
				break;
			default:
				result = format(this.visibleDate, "yyyy 'г.' / LLL", {
					locale: ru,
				});
				break;
		}
		return result;
	}

	get weekDaysArray() {
		let result: string[] = [];
		for (let i = 0; i < +this.daysPerWeek; i++) {
			result.push(this.daysOfWeek[i % 7]);
		}
		return result;
	}

	getItemDate(date: Date) {
		let result = '';
		switch (this.activeMode) {
			case 'week':
				result = format(date, 'EEEEE', {
					locale: ru,
				});
				break;
			case 'day':
				result = format(date, 'k');
				break;
			case 'hour':
				result = format(date, 'm');
				break;
			case 'year':
				result = format(date, 'LLL', {
					locale: ru,
				});
				break;
			default:
				result = format(date, 'd');
				break;
		}
		return result;
	}

	dateClicked({
		date,
		activeMode,
	}: {
		date: Date;
		activeMode: CalendarMode;
	}) {
		if (this.urlMode) return;
		this.selectedDate = date;
		this.dateSelected.emit({ date, mode: activeMode });
		// Делаем отложенное срабатывание перерисовки календаря,
		// чтобы кнопка-триггер не исчезла раньше времени и дроп не закрылся
		setTimeout(() => {
			this.generateCalendar({
				date,
			});
			this.cdr.detectChanges();
		});
	}

	getStartOfDate(date: Date) {
		let startOfDate: Date;

		switch (this.activeMode) {
			case 'year':
				startOfDate = startOfMonth(date);
				break;
			case 'week':
				startOfDate = startOfDay(date);
				break;
			case 'day':
				startOfDate = startOfHour(date);
				break;
			case 'hour':
				startOfDate = startOfMinute(date);
				break;
			default:
				startOfDate = startOfDay(date);
				break;
		}

		return startOfDate;
	}

	generateCalendar({
		date,
		mode = this.activeMode,
		selectDate = false,
		force = false,
	}: {
		date?: Date;
		mode?: CalendarMode;
		selectDate?: boolean;
		force?: boolean;
	} = {}) {
		date = date || this.visibleDate;

		/**
		 * Делаем проверку, что есть изменения в режиме/выбранной дате,
		 * чтобы не делать лишних перегенераций календаря
		 */
		if (
			mode === this.activeMode &&
			this._visibleDate === date &&
			((this.selectedDate === date && selectDate) || !selectDate) &&
			this.calendarArray.length &&
			!force
		)
			return;

		if (selectDate) {
			this.selectedDate = date;
		}

		this.activeMode = mode as CalendarMode;

		/**
		 * Записываем _visibleDate напрямую, чтобы не вызывать лишних действий через геттер
		 */
		this._visibleDate = this.getStartOfDate(date);

		this.visibleDateSelected.emit(this.visibleDate);
		this.lastDateOfCurrentMonth = lastDayOfMonth(date);
		this.firstMonday = isMonday(startOfMonth(date))
			? startOfMonth(date)
			: previousMonday(startOfMonth(date));

		let rows = 1;
		let cols = +this.daysPerWeek;
		let rowNumber = 0;

		if (this.rowsNumber) {
			rows = this.rowsNumber;
		} else {
			switch (mode) {
				case 'year':
					cols = 12;
					break;
				case 'week':
					rows = 1;
					cols = 7;
					break;
				case 'day':
					rows = 2;
					cols = 12;
					break;
				case 'hour':
					rows = 4;
					cols = 15;
					break;
				default:
					break;
			}
		}

		let fullArray = [];
		let loopFinished = false;
		let previousDate!: Date;

		while (!loopFinished) {
			let rowArray: CalendarDate[] = [];

			for (let i = 0; i < cols; i++) {
				if (!previousDate) {
					let thisDate = this.firstMonday;

					switch (this.activeMode) {
						case 'year':
							thisDate = startOfYear(this.visibleDate);
							break;
						case 'week':
							thisDate = startOfWeek(this.visibleDate, {
								weekStartsOn: 1,
							});
							break;
						case 'day':
							thisDate = startOfDay(this.visibleDate);
							break;
						case 'hour':
							thisDate = startOfHour(this.visibleDate);
							break;
						default:
							break;
					}

					previousDate = thisDate;

					rowArray.push({
						date: thisDate,
						visibleDate: this.isDateMatch(thisDate, 'visible'),
						selectedDate: this.isDateMatch(thisDate, 'selected'),
						nowDate: this.isDateMatch(thisDate, 'now'),
						disabledDate: this.isDateDisabled(thisDate),
						weekendDate:
							this.weekendDays.includes(i) &&
							this.activeMode === 'month',
						otherMonthDate:
							!isSameMonth(thisDate, this.visibleDate) &&
							this.activeMode === 'month',
					});
				} else {
					let thisDate = addDays(previousDate, 1);

					switch (this.activeMode) {
						case 'year':
							thisDate = addMonths(previousDate, 1);
							break;
						case 'week':
							thisDate = addDays(previousDate, 1);
							break;
						case 'day':
							thisDate = addHours(previousDate, 1);
							break;
						case 'hour':
							thisDate = addMinutes(previousDate, 1);
							break;
						default:
							break;
					}

					if (
						(mode === 'month' &&
							!this.rowsNumber &&
							+thisDate === +this.lastDateOfCurrentMonth) ||
						((this.rowsNumber ||
							mode === 'year' ||
							mode === 'week' ||
							mode === 'day' ||
							mode === 'hour') &&
							rowNumber === rows - 1)
					) {
						loopFinished = true;
					}
					previousDate = thisDate;

					rowArray.push({
						date: thisDate,
						visibleDate: this.isDateMatch(thisDate, 'visible'),
						selectedDate: this.isDateMatch(thisDate, 'selected'),
						nowDate: this.isDateMatch(thisDate, 'now'),
						disabledDate: this.isDateDisabled(thisDate),
						weekendDate:
							this.weekendDays.includes(i) &&
							this.activeMode === 'month',
						otherMonthDate:
							!isSameMonth(thisDate, this.visibleDate) &&
							this.activeMode === 'month',
					});
				}
			}

			if (
				mode === 'year' ||
				mode === 'week' ||
				mode === 'day' ||
				mode === 'hour' ||
				this.rowsNumber
			) {
				rowNumber++;
			}

			fullArray.push(rowArray);
		}
		this.calendarArray = fullArray;
	}

	isDateMatch(date: Date, matchMode: 'visible' | 'selected' | 'now') {
		switch (this.activeMode) {
			case 'year':
				return +date === +startOfMonth(this[`${matchMode}Date`]);
			case 'week':
				return +date === +startOfDay(this[`${matchMode}Date`]);
			case 'day':
				return +date === +startOfHour(this[`${matchMode}Date`]);
			case 'hour':
				return +date === +startOfMinute(this[`${matchMode}Date`]);
			default:
				return +date === +startOfDay(this[`${matchMode}Date`]);
		}
	}

	isDateDisabled(date: Date) {
		return (
			(this.disabledAfter &&
				isAfter(date, this.getStartOfDate(this.disabledAfter))) ||
			(this.disabledBefore &&
				isBefore(date, this.getStartOfDate(this.disabledBefore)))
		);
	}

	switchCalendarMode(mode: string) {
		this.generateCalendar({
			date: this.selectedDate,
			mode: mode as CalendarMode,
		});
		this.modeSelected.emit(this.activeMode);
	}

	switchCalendarToNow() {
		this.generateCalendar({
			date: this.nowDate,
		});
	}

	switchCalendarToSelected() {
		this.generateCalendar({
			date: this.selectedDate,
		});
	}

	switchCalendarPeriod(forward = true) {
		const result = {
			year: {
				forward: addYears(this.visibleDate, 1),
				backward: subYears(this.visibleDate, 1),
			},
			month: {
				forward: addMonths(this.visibleDate, 1),
				backward: subMonths(this.visibleDate, 1),
			},
			week: {
				forward: addWeeks(this.visibleDate, 1),
				backward: subWeeks(this.visibleDate, 1),
			},
			day: {
				forward: addDays(this.visibleDate, 1),
				backward: subDays(this.visibleDate, 1),
			},
			hour: {
				forward: addHours(this.visibleDate, 1),
				backward: subHours(this.visibleDate, 1),
			},
		};

		this.generateCalendar({
			date: result[this.activeMode][forward ? 'forward' : 'backward'],
		});
		this.cdr.detectChanges();
	}
}
