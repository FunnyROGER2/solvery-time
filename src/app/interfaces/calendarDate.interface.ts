export interface CalendarDate {
	date: Date;
	selectedDate: boolean;
	visibleDate: boolean;
	nowDate: boolean;
	weekendDate?: boolean;
	disabledDate?: boolean;
	otherMonthDate?: boolean;
}