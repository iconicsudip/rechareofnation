// src/lib/eventFormFields.ts
// Which optional field blocks show in the admin Add/Edit Event form, and in
// what order — managed from Site Content ("Event Form Fields") so admins can
// tailor the form without a code change. Order of this array is display
// order; Basic Info, Category/City, and the Save/Cancel row are always shown
// and aren't part of this config. Shared between the events admin page
// (which renders the form) and the content admin page (which edits this
// config), so it's not duplicated between them.

export interface EventFormFieldConfig {
  key: string;
  label: string;
  enabled: boolean;
}

export const DEFAULT_EVENT_FORM_FIELDS: EventFormFieldConfig[] = [
  { key: "bannerMedia", label: "Banner Image", enabled: true },
  { key: "videoUrl", label: "Hero Promo Video URL", enabled: true },
  { key: "galleryUrls", label: "Additional Hero Media (Gallery URLs)", enabled: true },
  { key: "summary", label: "Summary", enabled: true },
  { key: "description", label: "Full Description", enabled: true },
  { key: "eventSectionsBlock", label: "Event Sections & Navigation Buttons (Exhibit/Visit/PDF)", enabled: true },
  { key: "ratingReview", label: "Rating & Review Count", enabled: true },
  { key: "ticketPrices", label: "Event Tiers / Prices", enabled: true },
  { key: "sponsorshipTiers", label: "Sponsorship Tiers", enabled: true },
  { key: "stallOptions", label: "Stall / Booth Booking Options", enabled: true },
  { key: "adRates", label: "Directory / Ad Rates", enabled: true },
  { key: "organizer", label: "Organizer", enabled: true },
  { key: "headliners", label: "Headliners", enabled: true },
  { key: "faqs", label: "FAQs", enabled: true },
  { key: "scheduleDays", label: "Program Schedule", enabled: true },
  { key: "qrStages", label: "Dynamic QR Scan Stages", enabled: true },
  { key: "featuredToggles", label: "Featured / Upcoming Toggles", enabled: true },
  { key: "bookingFormFieldsConfig", label: "Ticket Booking Form — Optional Attendee Fields", enabled: true },
  { key: "inquiryFormFieldsConfig", label: "Sponsor / Ad Inquiry Form — Optional Fields", enabled: true },
];
