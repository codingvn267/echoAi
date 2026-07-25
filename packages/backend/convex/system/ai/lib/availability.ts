import type { Doc } from "../../../_generated/dataModel.js";

type BookingSettings = Doc<"bookingSettings">;

const DEFAULT_HOURS: BookingSettings["businessHours"] = [
  { day: 0, open: "00:00", close: "00:00", closed: true },
  { day: 1, open: "09:00", close: "17:00" },
  { day: 2, open: "09:00", close: "17:00" },
  { day: 3, open: "09:00", close: "17:00" },
  { day: 4, open: "09:00", close: "17:00" },
  { day: 5, open: "09:00", close: "17:00" },
  { day: 6, open: "10:00", close: "15:00" },
];

export function getServiceDuration(
  settings: BookingSettings | null,
  serviceName?: string
): number {
  if (settings && serviceName) {
    const match = settings.services.find(
      (s) => s.name.toLowerCase() === serviceName.toLowerCase()
    );
    if (match) {
      return match.durationMinutes;
    }
  }
  return 30;
}

function parseHM(value: string): { h: number; m: number } {
  const [h, m] = value.split(":").map((n) => Number.parseInt(n, 10));
  return { h: h ?? 0, m: m ?? 0 };
}

/**
 * Generate the next open appointment slots based on business hours.
 * Times are computed in UTC for MVP simplicity; the timezone label is surfaced
 * to the visitor and staff always confirm before the appointment is locked in.
 */
export function generateSlots(
  settings: BookingSettings | null,
  fromMs: number,
  count: number
): number[] {
  const hours = settings?.businessHours ?? DEFAULT_HOURS;
  const intervalMinutes = settings?.slotIntervalMinutes ?? 30;
  const slots: number[] = [];

  // Start searching at the next interval boundary, at least 1 hour out.
  const start = new Date(fromMs + 60 * 60 * 1000);
  start.setUTCSeconds(0, 0);

  for (let dayOffset = 0; dayOffset < 21 && slots.length < count; dayOffset++) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + dayOffset);
    const weekday = day.getUTCDay();
    const config = hours.find((h) => h.day === weekday);

    if (!config || config.closed) {
      continue;
    }

    const { h: openH, m: openM } = parseHM(config.open);
    const { h: closeH, m: closeM } = parseHM(config.close);

    const slotTime = new Date(day);
    slotTime.setUTCHours(openH, openM, 0, 0);
    const closeTime = new Date(day);
    closeTime.setUTCHours(closeH, closeM, 0, 0);

    while (slotTime < closeTime && slots.length < count) {
      if (slotTime.getTime() >= start.getTime()) {
        slots.push(slotTime.getTime());
      }
      slotTime.setUTCMinutes(slotTime.getUTCMinutes() + intervalMinutes);
    }
  }

  return slots;
}

export function formatSlot(ms: number, timezone?: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone || "UTC",
    timeZoneName: "short",
  }).format(new Date(ms));
}
