const BOOKING_ICAL = 'https://ical.booking.com/v1/export?t=33a5896b-5bbb-45dd-a331-e7617f0ea08a';
const ICLOUD_ICAL =
  'https://p153-caldav.icloud.com/published/2/MTE1MTkxOTkxODExNTE5MYS0ucVXviFE9CicXquw5J-haMa6zNDa38kLTCgHaJjoRDyDxgxp0NIFeNwubqA9v0hhAYXT_56MenZvZpCiw1Q';

const ICAL_FEEDS = [BOOKING_ICAL, ICLOUD_ICAL];

const pad = (n: number) => String(n).padStart(2, '0');

const parseYmd = (s: string) =>
  new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)));

export const fmt = (d: Date) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/** Unfold iCal lines (continuation lines start with space/tab). */
const unfold = (text: string) =>
  text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');

const addRange = (booked: Set<string>, start: string, end: string) => {
  let d = parseYmd(start);
  const endDate = parseYmd(end);
  // Timed same-day events: treat as one occupied day
  if (endDate <= d) {
    booked.add(fmt(d));
    return;
  }
  for (; d < endDate; d = new Date(d.getTime() + 864e5)) booked.add(fmt(d));
};

const parseIcal = (text: string, booked: Set<string>) => {
  let cur: { start?: string; end?: string } | null = null;
  for (const raw of unfold(text).split('\n')) {
    const line = raw.trim();
    if (line === 'BEGIN:VEVENT') cur = {};
    else if (line === 'END:VEVENT') {
      if (cur?.start) {
        const end = cur.end || cur.start;
        addRange(booked, cur.start, end);
      }
      cur = null;
    } else if (cur) {
      const m = line.match(/^DTSTART[^:]*:(\d{8})/);
      if (m) cur.start = m[1];
      const n = line.match(/^DTEND[^:]*:(\d{8})/);
      if (n) cur.end = n[1];
    }
  }
};

export async function loadBookedDates() {
  const booked = new Set<string>();
  let fetchOk = false;

  await Promise.all(
    ICAL_FEEDS.map(async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        parseIcal(await res.text(), booked);
        fetchOk = true;
      } catch {
        /* ignore single-feed failures */
      }
    }),
  );

  return { booked, fetchOk };
}

export function buildMonths(
  booked: Set<string>,
  monthNames: string[],
  monthsCount = 12,
) {
  const now = new Date();
  const todayYmd = fmt(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())),
  );
  const months = [];

  for (let i = 0; i < monthsCount; i++) {
    const base = now.getMonth() + i;
    const year = now.getFullYear() + Math.floor(base / 12);
    const month = ((base % 12) + 12) % 12;
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const firstDow = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    const cells = [];
    for (let k = 0; k < firstDow; k++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const ymd = `${year}-${pad(month + 1)}-${pad(day)}`;
      cells.push({
        day,
        ymd,
        booked: booked.has(ymd),
        past: ymd < todayYmd,
      });
    }
    months.push({ label: `${monthNames[month]} ${year}`, cells });
  }

  return { months, now };
}
