// City-wise WhatsApp routing. Numbers are managed from /admin/whatsapp and stored
// in site_content under WHATSAPP_CONTENT_KEY.

export const WHATSAPP_CONTENT_KEY = "whatsapp_numbers";

export interface WhatsAppCityEntry {
  city: string;
  number: string;
  active?: boolean;
}

export interface WhatsAppConfig {
  cities: WhatsAppCityEntry[];
  /** Used when the selected city has no number of its own. */
  defaultNumber?: string;
}

/** Cities offered out of the box before the admin saves anything. */
export const DEFAULT_WHATSAPP_CITIES = ["Udaipur", "Navsari", "Jaipur"];

/** Digits only, as wa.me expects. A bare 10-digit Indian number gets the 91 prefix. */
export function normalizeWhatsAppNumber(raw: string | undefined | null): string {
  const digits = (raw ?? "").replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/** Cities that have a usable number, in admin order. */
export function getWhatsAppCities(config: WhatsAppConfig | null | undefined): string[] {
  return (config?.cities ?? [])
    .filter((c) => c.city.trim() && c.active !== false && normalizeWhatsAppNumber(c.number))
    .map((c) => c.city.trim());
}

/**
 * Number for a city (case-insensitive; "Udaipur, Rajasthan" matches "Udaipur"),
 * falling back to the default number. Returns "" when nothing is configured.
 */
export function findWhatsAppNumber(config: WhatsAppConfig | null | undefined, city?: string): string {
  const wanted = (city ?? "").trim().toLowerCase();
  if (wanted) {
    const hit = (config?.cities ?? []).find((c) => {
      const name = c.city.trim().toLowerCase();
      return c.active !== false && name && (wanted === name || wanted.includes(name) || name.includes(wanted));
    });
    const num = normalizeWhatsAppNumber(hit?.number);
    if (num) return num;
  }
  return normalizeWhatsAppNumber(config?.defaultNumber);
}

export function buildWhatsAppUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
