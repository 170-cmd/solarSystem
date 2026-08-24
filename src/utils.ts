/** Русская плюрализация: plural(5, ["год", "года", "лет"]) → "лет" */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(Math.round(n)) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (d > 1 && d < 5) return forms[1];
  if (d === 1) return forms[0];
  return forms[2];
}

/** «2 года 134 дня» из количества земных суток */
export function formatElapsed(days: number): string {
  const years = Math.floor(days / 365.25);
  const rest = Math.floor(days - years * 365.25);
  if (years === 0) return `${rest} ${plural(rest, ["день", "дня", "дней"])}`;
  return `${years} ${plural(years, ["год", "года", "лет"])} ${rest} ${plural(rest, ["день", "дня", "дней"])}`;
}

/** «11,9 земных лет» или «88 суток» из орбитального периода */
export function formatPeriod(days: number): string {
  if (days === 0) return "—";
  if (days < 1000) return `${Math.round(days)} ${plural(Math.round(days), ["сутки", "суток", "суток"])}`;
  const years = days / 365.25;
  const rounded = years >= 20 ? Math.round(years) : Math.round(years * 10) / 10;
  return `${rounded.toLocaleString("ru-RU")} ${plural(Math.round(rounded), ["земной год", "земных года", "земных лет"])}`;
}

export function formatKm(km: number): string {
  return `${km.toLocaleString("ru-RU")} км`;
}
