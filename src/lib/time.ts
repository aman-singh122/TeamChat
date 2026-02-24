import { format, isSameDay, isSameYear } from "date-fns";

export function formatMessageTimestamp(date: Date) {
  if (isSameDay(date, new Date())) {
    return format(date, "p");
  }

  if (isSameYear(date, new Date())) {
    return format(date, "MMM d, p");
  }

  return format(date, "MMM d, yyyy, p");
}
