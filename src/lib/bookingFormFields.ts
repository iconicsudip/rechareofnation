// src/lib/bookingFormFields.ts
// Per-event/competition configurable form fields for the four public booking
// flows (ticket booking, commercial inquiry, competition registration) — an
// admin can show/hide/reorder the OPTIONAL fields below per event, since the
// right form can vary from event to event. Core identity fields (name/email,
// and mobile for ticket booking) always show and aren't part of this config.

export interface BookingFormFieldConfig {
  key: string;
  label: string;
  enabled: boolean;
}

// Event ticket booking wizard — Step 3 "Attendee Information".
export const DEFAULT_TICKET_BOOKING_FIELDS: BookingFormFieldConfig[] = [
  { key: "city", label: "City", enabled: true },
  { key: "notes", label: "Special Notes", enabled: true },
];

// Shared Sponsorship / Stall / Directory Ad inquiry modal on the event page.
export const DEFAULT_INQUIRY_FORM_FIELDS: BookingFormFieldConfig[] = [
  { key: "phone", label: "Phone Number", enabled: true },
  { key: "company", label: "Company / Brand Name", enabled: true },
  { key: "notes", label: "Notes / Requirements", enabled: true },
];

// Competition registration (CompetitorBoardingModal) — Profile + Uploads steps.
export const DEFAULT_REGISTRATION_FORM_FIELDS: BookingFormFieldConfig[] = [
  { key: "phone", label: "Phone Number", enabled: true },
  { key: "idProof", label: "Verification ID Proof", enabled: true },
  { key: "videoLink", label: "Audition Video Link", enabled: true },
  { key: "portfolioLink", label: "Portfolio Link", enabled: true },
  { key: "headshot", label: "Headshot Upload", enabled: true },
];

export function isFieldEnabled(
  configured: BookingFormFieldConfig[] | undefined,
  defaults: BookingFormFieldConfig[],
  key: string
): boolean {
  const fields = configured && configured.length > 0 ? configured : defaults;
  const field = fields.find((f) => f.key === key);
  return field ? field.enabled : true;
}
