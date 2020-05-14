interface CalendarDate {
  date?: string | null;
  dateTime?: string | null;
}

export interface CalendarEvent {
  from: CalendarDate;
  to: CalendarDate;
  summary: string;
}
