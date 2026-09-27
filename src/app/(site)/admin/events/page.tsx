"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import {
  Plus, Pencil, Trash2, Search, X, Check, CalendarDays,
  MapPin, Tag, RefreshCw, ChevronLeft, ChevronRight, Layers, FileText,
} from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import PdfUploadField from "@/components/admin/PdfUploadField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import RepeaterField from "@/components/admin/RepeaterField";
import ScheduleDaysEditor, { ScheduleDay } from "@/components/admin/ScheduleDaysEditor";
import FieldToggleListEditor from "@/components/admin/FieldToggleListEditor";
import { EventFormFieldConfig, DEFAULT_EVENT_FORM_FIELDS } from "@/lib/eventFormFields";
import { BookingFormFieldConfig, DEFAULT_TICKET_BOOKING_FIELDS, DEFAULT_INQUIRY_FORM_FIELDS } from "@/lib/bookingFormFields";

interface TicketPrice {
  [key: string]: unknown;
  type: string;
  price: number;
  available: number;
  description: string;
}

interface SponsorshipTier {
  [key: string]: unknown;
  tier: string;
  amount: string;
  benefits: string;
}

interface StallOption {
  [key: string]: unknown;
  type: string;
  size: string;
  rate: string;
  includes: string;
}

interface AdRate {
  [key: string]: unknown;
  category: string;
  amount: string;
}

interface Organizer {
  name: string;
  contact: string;
  email: string;
  phone: string;
}

interface Headliner {
  [key: string]: unknown;
  name: string;
  role: string;
  img: string;
}

interface Faq {
  [key: string]: unknown;
  q: string;
  a: string;
}

export interface EventSectionConfig {
  id: string;
  label: string;
  enabled: boolean;
  type: string;
}

export const DEFAULT_EVENT_SECTIONS: EventSectionConfig[] = [
  { id: "exhibit", label: "Exhibit", enabled: true, type: "exhibit" },
  { id: "visit", label: "Visit", enabled: true, type: "visit" },
  { id: "gallery", label: "Gallery", enabled: true, type: "gallery" },
  { id: "view_pdf", label: "View PDF", enabled: true, type: "pdf" },
  { id: "book_space", label: "Book Space", enabled: true, type: "book_space" },
  { id: "sponsorship", label: "Sponsorship Opportunities", enabled: true, type: "sponsorship" },
];

interface Event {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  venue: string;
  event_date: string;
  event_time: string;
  is_featured: boolean;
  is_upcoming: boolean;
  banner_url: string;
  summary: string;
  description: string;
  ticket_prices: TicketPrice[];
  organizer: Organizer;
  rating: number;
  review_count: number;
  sponsorship_tiers: SponsorshipTier[];
  stall_options: StallOption[];
  ad_rates: AdRate[];
  date_is_tentative: boolean;
  headliners: Headliner[];
  faqs: Faq[];
  schedule_days: ScheduleDay[];
  qr_stages: { id: string; name: string; order: number }[];
  video_url?: string;
  gallery_urls?: string[];
  brochure_pdf_url?: string;
  exhibit_info?: string;
  visit_info?: string;
  event_sections?: EventSectionConfig[];
  booking_form_fields?: BookingFormFieldConfig[];
  inquiry_form_fields?: BookingFormFieldConfig[];
  created_at: string;
}

interface Taxonomy { value: string }

const EMPTY_TICKET: TicketPrice = { type: "", price: 0, available: 0, description: "" };
const EMPTY_TIER: SponsorshipTier = { tier: "", amount: "", benefits: "" };
const EMPTY_STALL: StallOption = { type: "", size: "", rate: "", includes: "" };
const EMPTY_AD_RATE: AdRate = { category: "", amount: "" };
const EMPTY_ORGANIZER: Organizer = { name: "", contact: "", email: "", phone: "" };
const EMPTY_HEADLINER: Headliner = { name: "", role: "", img: "" };
const EMPTY_FAQ: Faq = { q: "", a: "" };

const EMPTY_FORM = {
  name: "", slug: "", category: "", city: "", venue: "",
  eventDate: "", eventTime: "18:00", bannerUrl: "", summary: "", description: "",
  videoUrl: "", galleryUrlsText: "",
  brochurePdfUrl: "", exhibitInfo: "", visitInfo: "",
  isFeatured: false, isUpcoming: true, rating: "4.6", reviewCount: "25", dateIsTentative: false,
};
const DEFAULT_QR_STAGES = [{ id: "entry", name: "Entry Gate", order: 1 }];

const S = {
  card: { background: "rgba(23,13,8,0.6)", border: "1px solid rgba(217, 119, 6,0.12)", borderRadius: "16px" },
  input: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(217, 119, 6,0.2)",
    borderRadius: "10px", color: "#F5EEE2", outline: "none", padding: "10px 12px",
    fontSize: "13px", width: "100%",
  },
  btn: {
    display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 16px",
    borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none",
  },
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Event | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [eventSections, setEventSections] = useState<EventSectionConfig[]>(DEFAULT_EVENT_SECTIONS);
  const [ticketPrices, setTicketPrices] = useState<TicketPrice[]>([]);
  const [sponsorshipTiers, setSponsorshipTiers] = useState<SponsorshipTier[]>([]);
  const [stallOptions, setStallOptions] = useState<StallOption[]>([]);
  const [adRates, setAdRates] = useState<AdRate[]>([]);
  const [headliners, setHeadliners] = useState<Headliner[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([]);
  const [organizer, setOrganizer] = useState<Organizer>(EMPTY_ORGANIZER);
  const [qrStages, setQrStages] = useState<{ id: string; name: string; order: number }[]>([]);
  const [bookingFormFields, setBookingFormFields] = useState<BookingFormFieldConfig[]>(DEFAULT_TICKET_BOOKING_FIELDS);
  const [inquiryFormFields, setInquiryFormFields] = useState<BookingFormFieldConfig[]>(DEFAULT_INQUIRY_FORM_FIELDS);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formFieldsConfig, setFormFieldsConfig] = useState<EventFormFieldConfig[]>(DEFAULT_EVENT_FORM_FIELDS);

  // Which optional fields show in the Add/Edit form, and in what order —
  // configured via Site Content ("Event Form Fields"). Loaded once; doesn't
  // need to reload alongside the paginated event list.
  useEffect(() => {
    fetch("/api/admin/site-content?key=event_form_fields")
      .then((res) => res.json())
      .then((data) => {
        const fields = data?.content?.value?.fields;
        if (Array.isArray(fields) && fields.length > 0) setFormFieldsConfig(fields);
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const [eventsRes, catRes, cityRes] = await Promise.all([
      fetch(`/api/admin/events?search=${encodeURIComponent(search)}&page=${page}`),
      fetch("/api/taxonomies?type=event_category"),
      fetch("/api/taxonomies?type=city"),
    ]);
    const data = await eventsRes.json();
    const catData = await catRes.json();
    const cityData = await cityRes.json();
    setEvents(data.events || []);
    setTotal(data.total || 0);
    setCategories((catData.taxonomies ?? []).map((t: Taxonomy) => t.value));
    setCities((cityData.taxonomies ?? []).map((t: Taxonomy) => t.value));
    setLoading(false);
  }, [search, page]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, category: categories[0] || "", city: cities[0] || "" });
    setEventSections(DEFAULT_EVENT_SECTIONS);
    setTicketPrices([{ ...EMPTY_TICKET }]);
    setSponsorshipTiers([]);
    setStallOptions([]);
    setAdRates([]);
    setHeadliners([]);
    setFaqs([]);
    setScheduleDays([]);
    setQrStages([...DEFAULT_QR_STAGES]);
    setOrganizer({ ...EMPTY_ORGANIZER });
    setBookingFormFields(DEFAULT_TICKET_BOOKING_FIELDS);
    setInquiryFormFields(DEFAULT_INQUIRY_FORM_FIELDS);
    setPanelOpen(true);
  };
  const openEdit = (ev: Event) => {
    setEditTarget(ev);
    setForm({
      name: ev.name, slug: ev.slug, category: ev.category,
      city: ev.city, venue: ev.venue, eventDate: ev.event_date?.slice(0, 10) || "",
      eventTime: ev.event_time || "18:00", bannerUrl: ev.banner_url || "",
      summary: ev.summary || "", description: ev.description || "",
      videoUrl: ev.video_url || "",
      galleryUrlsText: Array.isArray(ev.gallery_urls) ? ev.gallery_urls.join("\n") : "",
      brochurePdfUrl: ev.brochure_pdf_url || "",
      exhibitInfo: ev.exhibit_info || "",
      visitInfo: ev.visit_info || "",
      isFeatured: ev.is_featured, isUpcoming: ev.is_upcoming,
      rating: String(ev.rating ?? 4.6), reviewCount: String(ev.review_count ?? 25),
      dateIsTentative: ev.date_is_tentative ?? false,
    });
    setEventSections(Array.isArray(ev.event_sections) && ev.event_sections.length > 0 ? ev.event_sections : DEFAULT_EVENT_SECTIONS);
    setTicketPrices(Array.isArray(ev.ticket_prices) && ev.ticket_prices.length > 0 ? ev.ticket_prices : [{ ...EMPTY_TICKET }]);
    setSponsorshipTiers(Array.isArray(ev.sponsorship_tiers) ? ev.sponsorship_tiers : []);
    setStallOptions(Array.isArray(ev.stall_options) ? ev.stall_options : []);
    setAdRates(Array.isArray(ev.ad_rates) ? ev.ad_rates : []);
    setHeadliners(Array.isArray(ev.headliners) ? ev.headliners : []);
    setFaqs(Array.isArray(ev.faqs) ? ev.faqs : []);
    setScheduleDays(Array.isArray(ev.schedule_days) ? ev.schedule_days : []);
    setQrStages(Array.isArray(ev.qr_stages) && ev.qr_stages.length > 0 ? ev.qr_stages : [...DEFAULT_QR_STAGES]);
    setOrganizer(ev.organizer && ev.organizer.name !== undefined ? ev.organizer : { ...EMPTY_ORGANIZER });
    setBookingFormFields(Array.isArray(ev.booking_form_fields) && ev.booking_form_fields.length > 0 ? ev.booking_form_fields : DEFAULT_TICKET_BOOKING_FIELDS);
    setInquiryFormFields(Array.isArray(ev.inquiry_form_fields) && ev.inquiry_form_fields.length > 0 ? ev.inquiry_form_fields : DEFAULT_INQUIRY_FORM_FIELDS);
    setPanelOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const method = editTarget ? "PUT" : "POST";
    const body = {
      ...form,
      videoUrl: form.videoUrl.trim(),
      galleryUrls: form.galleryUrlsText
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean),
      brochurePdfUrl: form.brochurePdfUrl.trim(),
      exhibitInfo: form.exhibitInfo,
      visitInfo: form.visitInfo,
      eventSections,
      bookingFormFields,
      inquiryFormFields,
      rating: Number(form.rating) || 0,
      reviewCount: Number(form.reviewCount) || 0,
      ticketPrices: ticketPrices.filter(t => t.type.trim()),
      sponsorshipTiers: sponsorshipTiers.filter(t => t.tier.trim()),
      stallOptions: stallOptions.filter(s => s.type.trim()),
      adRates: adRates.filter(a => a.category.trim()),
      headliners: headliners.filter(h => h.name.trim()),
      faqs: faqs.filter(f => f.q.trim()),
      scheduleDays: scheduleDays.filter(d => d.dayLabel.trim()),
      qrStages: qrStages.filter(q => q.id.trim() && q.name.trim()),
      organizer,
      ...(editTarget ? { id: editTarget.id } : {}),
    };
    await fetch("/api/admin/events", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    setPanelOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    load();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#F5EEE2" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Event Management</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(203,185,160,0.6)" }}>{total} events total</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} style={{ ...S.btn, background: "rgba(217, 119, 6,0.1)", color: "#fbbf24", border: "1px solid rgba(217, 119, 6,0.2)" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openCreate} style={{ ...S.btn, background: "linear-gradient(135deg, #F59E0B, #B45309)", color: "#fff" }}>
            <Plus size={14} /> New Event
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(203,185,160,0.4)" }} />
        <input
          style={{ ...S.input, paddingLeft: "36px" }}
          placeholder="Search events by name, city or category..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      <div style={S.card} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(217, 119, 6,0.1)", background: "rgba(217, 119, 6,0.05)" }}>
                {["Event", "Category", "Date & Venue", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "rgba(203,185,160,0.5)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(217, 119, 6,0.06)]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-4">
                    <div className="h-4 rounded animate-pulse w-3/4" style={{ background: "rgba(217, 119, 6,0.1)" }} />
                  </td></tr>
                ))
              ) : events.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm"
                  style={{ color: "rgba(203,185,160,0.4)" }}>
                  No events found. Create your first event.
                </td></tr>
              ) : events.map((ev) => (
                <tr key={ev.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white text-sm leading-tight">{ev.name}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "rgba(203,185,160,0.4)" }}>/{ev.slug}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold"
                      style={{ background: "rgba(217, 119, 6,0.1)", color: "#fbbf24", border: "1px solid rgba(217, 119, 6,0.2)" }}>
                      {ev.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(203,185,160,0.7)" }}>
                      <CalendarDays size={11} /> {ev.event_date?.slice(0, 10)}
                      {ev.date_is_tentative && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" }}>
                          Tentative
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs mt-1" style={{ color: "rgba(203,185,160,0.5)" }}>
                      <MapPin size={11} /> {ev.city}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      {ev.is_featured && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold w-fit"
                          style={{ background: "rgba(251,191,36,0.1)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.2)" }}>
                          Featured
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold w-fit ${
                        ev.is_upcoming
                          ? "text-emerald-400 border border-emerald-400/20 bg-emerald-400/10"
                          : "text-[#8F7A66] border border-[rgba(203,185,160,0.2)] bg-[rgba(203,185,160,0.08)]"
                      }`}>
                        {ev.is_upcoming ? "Upcoming" : "Past"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(ev)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: "rgba(217, 119, 6,0.1)", color: "#fbbf24" }}
                        title="Edit">
                        <Pencil size={13} />
                      </button>
                      {deleteConfirm === ev.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(ev.id)}
                            className="p-1.5 rounded-lg"
                            style={{ background: "rgba(239,68,68,0.15)", color: "#F87171" }}>
                            <Check size={13} />
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="p-1.5 rounded-lg"
                            style={{ background: "rgba(203,185,160,0.1)", color: "rgba(203,185,160,0.7)" }}>
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(ev.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ background: "rgba(239,68,68,0.08)", color: "#F87171" }}
                          title="Delete">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(217, 119, 6,0.1)" }}>
            <span className="text-xs" style={{ color: "rgba(203,185,160,0.4)" }}>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg disabled:opacity-30"
                style={{ background: "rgba(217, 119, 6,0.1)", color: "#fbbf24" }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30"
                style={{ background: "rgba(217, 119, 6,0.1)", color: "#fbbf24" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />
          <div className="relative w-full max-w-lg h-full overflow-y-auto flex flex-col"
            style={{ background: "#2A1510", borderLeft: "1px solid rgba(217, 119, 6,0.2)" }}>
            <div className="flex items-center justify-between p-6 border-b sticky top-0 z-10"
              style={{ borderColor: "rgba(217, 119, 6,0.15)", background: "#2A1510" }}>
              <h2 className="font-extrabold text-white text-lg">
                {editTarget ? "Edit Event" : "Create Event"}
              </h2>
              <button onClick={() => setPanelOpen(false)} className="p-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(203,185,160,0.7)" }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5 flex-1">
              {[
                { label: "Event Name", key: "name", type: "text", required: true },
                { label: "URL Slug", key: "slug", type: "text", required: true },
                { label: "Venue", key: "venue", type: "text" },
                { label: "Date", key: "eventDate", type: "date", required: true },
                { label: "Time", key: "eventTime", type: "time" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                    style={{ color: "rgba(203,185,160,0.5)" }}>{f.label}</label>
                  <input
                    type={f.type}
                    style={S.input}
                    required={f.required}
                    value={(form as Record<string, unknown>)[f.key] as string}
                    onChange={(e) => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </div>
              ))}

              <label className="flex items-center gap-2.5 cursor-pointer -mt-2">
                <div
                  className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
                  style={{ background: form.dateIsTentative ? "#F59E0B" : "rgba(217, 119, 6,0.15)" }}
                  onClick={() => setForm(prev => ({ ...prev, dateIsTentative: !prev.dateIsTentative }))}
                >
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{ transform: form.dateIsTentative ? "translateX(16px)" : "translateX(0)" }} />
                </div>
                <span className="text-xs font-medium" style={{ color: "rgba(203,185,160,0.7)" }}>
                  Date is tentative / not yet confirmed
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                    style={{ color: "rgba(203,185,160,0.5)" }}>Category</label>
                  <select style={S.input} value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                    style={{ color: "rgba(203,185,160,0.5)" }}>City</label>
                  <select style={S.input} value={form.city}
                    onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}>
                    <option value="">Select city</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {(() => {
                const fieldBlocks: Record<string, ReactNode> = {
                  bannerMedia: (
                    <ImageUploadField label="Banner Image (Hero Primary)" value={form.bannerUrl} onChange={(url) => setForm(prev => ({ ...prev, bannerUrl: url }))} />
                  ),
                  videoUrl: (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                        style={{ color: "rgba(203,185,160,0.5)" }}>
                        Hero Promo Video URL (Optional)
                      </label>
                      <input
                        style={S.input}
                        placeholder="e.g. https://www.youtube.com/watch?v=... or https://example.com/promo.mp4"
                        value={form.videoUrl}
                        onChange={(e) => setForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                      />
                      <p className="text-[11px] mt-1" style={{ color: "rgba(203,185,160,0.4)" }}>
                        Supports YouTube, Vimeo, or direct MP4/WebM video links. Displayed directly inside the hero showcase.
                      </p>
                    </div>
                  ),
                  galleryUrls: (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                        style={{ color: "rgba(203,185,160,0.5)" }}>
                        Additional Hero Media &mdash; Images / Videos (One URL per line)
                      </label>
                      <textarea
                        rows={3}
                        style={{ ...S.input, resize: "vertical", fontFamily: "monospace", fontSize: "12px" }}
                        placeholder={"https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2...\nhttps://www.youtube.com/watch?v=..."}
                        value={form.galleryUrlsText}
                        onChange={(e) => setForm(prev => ({ ...prev, galleryUrlsText: e.target.value }))}
                      />
                      <p className="text-[11px] mt-1" style={{ color: "rgba(203,185,160,0.4)" }}>
                        Add multiple photo or video URLs to enable the interactive Hero carousel &amp; thumbnail filmstrip.
                      </p>
                    </div>
                  ),
                  summary: (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                        style={{ color: "rgba(203,185,160,0.5)" }}>Summary</label>
                      <textarea rows={2} style={{ ...S.input, resize: "vertical" }}
                        value={form.summary}
                        onChange={(e) => setForm(prev => ({ ...prev, summary: e.target.value }))} />
                    </div>
                  ),
                  description: (
                    <RichTextEditor label="Full Description" value={form.description}
                      onChange={(html) => setForm(prev => ({ ...prev, description: html }))} />
                  ),
                  eventSectionsBlock: (
                    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-amber-500/25 bg-[#170C07] shadow-xl">
                      <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
                        <div>
                          <h3 className="font-extrabold text-white text-sm font-primary uppercase tracking-wide flex items-center gap-2">
                            <Layers size={16} className="text-amber-400" />
                            Event Sections &amp; Navigation Buttons
                          </h3>
                          <p className="text-[11px] text-stone-400 font-secondary mt-0.5">
                            Configure the prominent action pills &amp; sections (Exhibit, Visit, Gallery, View PDF, Book Space, Sponsorship Opportunities).
                          </p>
                        </div>
                      </div>

                      {/* Live Button Preview (Styled matching reference) */}
                      <div className="bg-[#120703] p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
                          Live Buttons Preview (As displayed on Event Page):
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {eventSections.filter(s => s.enabled).map((sec) => (
                            <span
                              key={sec.id}
                              className="bg-[#800000] text-white text-xs font-bold font-primary px-4.5 py-2.5 rounded-xl uppercase tracking-wider shadow-sm select-none"
                            >
                              {sec.label}
                            </span>
                          ))}
                          {eventSections.filter(s => s.enabled).length === 0 && (
                            <span className="text-xs text-stone-500 italic">No buttons enabled</span>
                          )}
                        </div>
                      </div>

                      {/* Section Toggles & Label Editors */}
                      <div className="flex flex-col gap-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
                          Manage Buttons &amp; Labels
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {eventSections.map((sec, idx) => (
                            <div
                              key={sec.id}
                              className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                                sec.enabled
                                  ? "bg-amber-500/5 border-amber-500/30"
                                  : "bg-white/[0.02] border-white/5 opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={sec.enabled}
                                  onChange={(e) => {
                                    const next = [...eventSections];
                                    next[idx].enabled = e.target.checked;
                                    setEventSections(next);
                                  }}
                                  className="w-4 h-4 rounded accent-amber-500 cursor-pointer shrink-0"
                                />
                                <input
                                  style={{ ...S.input, padding: "6px 10px", fontSize: "12px" }}
                                  value={sec.label}
                                  onChange={(e) => {
                                    const next = [...eventSections];
                                    next[idx].label = e.target.value;
                                    setEventSections(next);
                                  }}
                                  placeholder="Button label..."
                                />
                              </div>
                              <span className="text-[10px] font-mono uppercase text-amber-400/80 font-bold shrink-0">
                                {sec.id}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dedicated Content for Sections */}
                      <div className="flex flex-col gap-4 pt-3 border-t border-white/10">
                        {/* View PDF Field */}
                        <PdfUploadField
                          label="View PDF — Event Brochure / Prospectus"
                          hint="When users click 'View PDF', this document opens directly in a new tab."
                          value={form.brochurePdfUrl}
                          onChange={(url) => setForm(prev => ({ ...prev, brochurePdfUrl: url }))}
                        />

                        {/* Exhibit Information */}
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(203,185,160,0.6)" }}>
                            Exhibit Section — Why Exhibit &amp; Exhibitor Profile
                          </label>
                          <textarea
                            rows={3}
                            style={{ ...S.input, resize: "vertical" }}
                            placeholder="Why exhibit at this event? Exhibitor benefits, profiles, past participants, and guidelines..."
                            value={form.exhibitInfo}
                            onChange={(e) => setForm(prev => ({ ...prev, exhibitInfo: e.target.value }))}
                          />
                          <p className="text-[11px] mt-1 text-stone-400">
                            Displayed on the event page under the Exhibit section. Also links to Stall/Booth options below.
                          </p>
                        </div>

                        {/* Visit Information */}
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(203,185,160,0.6)" }}>
                            Visit Section — Visitor Information &amp; Timings
                          </label>
                          <textarea
                            rows={3}
                            style={{ ...S.input, resize: "vertical" }}
                            placeholder="Visitor profile, visiting hours, delegate passes, entry rules, and badge collection info..."
                            value={form.visitInfo}
                            onChange={(e) => setForm(prev => ({ ...prev, visitInfo: e.target.value }))}
                          />
                          <p className="text-[11px] mt-1 text-stone-400">
                            Displayed on the event page under the Visit section. Also links to Audience Passes below.
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                  ratingReview: (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                          style={{ color: "rgba(203,185,160,0.5)" }}>Rating (0-5)</label>
                        <input type="number" step="0.1" min="0" max="5" style={S.input} value={form.rating}
                          onChange={(e) => setForm(prev => ({ ...prev, rating: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                          style={{ color: "rgba(203,185,160,0.5)" }}>Review Count</label>
                        <input type="number" min="0" style={S.input} value={form.reviewCount}
                          onChange={(e) => setForm(prev => ({ ...prev, reviewCount: e.target.value }))} />
                      </div>
                    </div>
                  ),
                  ticketPrices: (
                    <RepeaterField
                      label="Event Tiers / Prices"
                      hint="Can be anything (General Tickets, VIP, Sponsorships, etc.)"
                      columns={[
                        { key: "type", label: "Tier type (e.g. VIP Pass, Title Sponsor)", span: 2 },
                        { key: "price", label: "Price (₹)", type: "number" },
                        { key: "available", label: "Available", type: "number" },
                        { key: "description", label: "Description", type: "textarea", span: 2 },
                      ]}
                      value={ticketPrices}
                      onChange={setTicketPrices}
                      emptyRow={EMPTY_TICKET}
                      addLabel="Add ticket tier"
                    />
                  ),
                  sponsorshipTiers: (
                    <RepeaterField
                      label="Sponsorship Tiers"
                      hint="Corporate sponsorship packages (Title Sponsor, Co-Sponsor, etc.) — leave empty if not applicable"
                      columns={[
                        { key: "tier", label: "Tier name (e.g. Title Sponsor)", span: 2 },
                        { key: "amount", label: "Amount (e.g. ₹75,00,000)", span: 2 },
                        { key: "benefits", label: "Benefits", type: "textarea", span: 2 },
                      ]}
                      value={sponsorshipTiers}
                      onChange={setSponsorshipTiers}
                      emptyRow={EMPTY_TIER}
                      addLabel="Add sponsorship tier"
                    />
                  ),
                  stallOptions: (
                    <RepeaterField
                      label="Stall / Booth Booking Options"
                      hint="Exhibitor stall packages — leave empty if not applicable"
                      columns={[
                        { key: "type", label: "Type (e.g. Premium Raw Space)" },
                        { key: "size", label: "Size (e.g. 100 sq.ft)" },
                        { key: "rate", label: "Rate (e.g. ₹75,000)" },
                        { key: "includes", label: "Includes" },
                      ]}
                      value={stallOptions}
                      onChange={setStallOptions}
                      emptyRow={EMPTY_STALL}
                      addLabel="Add stall option"
                    />
                  ),
                  adRates: (
                    <RepeaterField
                      label="Directory / Ad Rates"
                      hint="Publication/directory advertising rates — leave empty if not applicable"
                      columns={[
                        { key: "category", label: "Category (e.g. Cover Page Front)", span: 2 },
                        { key: "amount", label: "Amount (e.g. ₹5,00,000)", span: 2 },
                      ]}
                      value={adRates}
                      onChange={setAdRates}
                      emptyRow={EMPTY_AD_RATE}
                      addLabel="Add ad rate"
                    />
                  ),
                  organizer: (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: "rgba(203,185,160,0.5)" }}>Organizer</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input style={S.input} placeholder="Organization name" value={organizer.name}
                          onChange={(e) => setOrganizer(o => ({ ...o, name: e.target.value }))} />
                        <input style={S.input} placeholder="Contact person / short description (shown publicly)" value={organizer.contact}
                          onChange={(e) => setOrganizer(o => ({ ...o, contact: e.target.value }))} />
                        <input style={S.input} placeholder="Email" value={organizer.email}
                          onChange={(e) => setOrganizer(o => ({ ...o, email: e.target.value }))} />
                        <input style={S.input} placeholder="Phone" value={organizer.phone}
                          onChange={(e) => setOrganizer(o => ({ ...o, phone: e.target.value }))} />
                      </div>
                    </div>
                  ),
                  headliners: (
                    <RepeaterField
                      label="Headliners"
                      hint="Featured artists/performers shown on the event page — leave empty if not applicable"
                      columns={[
                        { key: "name", label: "Name" },
                        { key: "role", label: "Role (e.g. Folk Headliner)" },
                        { key: "img", label: "Photo", type: "image", span: 2 },
                      ]}
                      value={headliners}
                      onChange={setHeadliners}
                      emptyRow={EMPTY_HEADLINER}
                      addLabel="Add headliner"
                    />
                  ),
                  faqs: (
                    <RepeaterField
                      label="FAQs"
                      hint="Also used to answer visitor questions in the on-page assistant"
                      columns={[
                        { key: "q", label: "Question", span: 2 },
                        { key: "a", label: "Answer", type: "textarea", span: 2 },
                      ]}
                      value={faqs}
                      onChange={setFaqs}
                      emptyRow={EMPTY_FAQ}
                      addLabel="Add FAQ"
                    />
                  ),
                  scheduleDays: (
                    <ScheduleDaysEditor
                      label="Program Schedule"
                      value={scheduleDays}
                      onChange={setScheduleDays}
                    />
                  ),
                  qrStages: (
                    <RepeaterField
                      label="Dynamic QR Scan Stages"
                      hint="Define the scanning checkpoints for this event (e.g., Entry, Food Coupon, Certificate). Scanners will select a stage when scanning."
                      columns={[
                        { key: "id", label: "Stage ID (e.g., entry, food, exit)" },
                        { key: "name", label: "Display Name (e.g., Entry Gate)", span: 2 },
                        { key: "order", label: "Order", type: "number" },
                      ]}
                      value={qrStages}
                      onChange={(val) => setQrStages(val as { id: string; name: string; order: number }[])}
                      emptyRow={{ id: "", name: "", order: 1 }}
                      addLabel="Add stage"
                    />
                  ),
                  featuredToggles: (
                    <div className="flex gap-6">
                      {[
                        { label: "Featured Event", key: "isFeatured" },
                        { label: "Mark as Upcoming", key: "isUpcoming" },
                      ].map((toggle) => (
                        <label key={toggle.key} className="flex items-center gap-2.5 cursor-pointer">
                          <div
                            className="relative w-9 h-5 rounded-full transition-colors"
                            style={{ background: (form as Record<string, unknown>)[toggle.key] ? "#d97706" : "rgba(217, 119, 6,0.15)" }}
                            onClick={() => setForm(prev => ({ ...prev, [toggle.key]: !(prev as Record<string, unknown>)[toggle.key] }))}
                          >
                            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                              style={{ transform: (form as Record<string, unknown>)[toggle.key] ? "translateX(16px)" : "translateX(0)" }} />
                          </div>
                          <span className="text-xs font-medium" style={{ color: "rgba(203,185,160,0.7)" }}>{toggle.label}</span>
                        </label>
                      ))}
                    </div>
                  ),
                  bookingFormFieldsConfig: (
                    <FieldToggleListEditor
                      label="Ticket Booking Form — Optional Attendee Fields"
                      hint="Name, email, and mobile are always required for a booking — these are the extra fields shown in Step 3 of the booking wizard."
                      value={bookingFormFields}
                      onChange={setBookingFormFields}
                    />
                  ),
                  inquiryFormFieldsConfig: (
                    <FieldToggleListEditor
                      label="Sponsor / Ad Inquiry Form — Optional Fields"
                      hint="Name and email are always required — these show in the shared Sponsorship / Stall Booking / Directory Ad inquiry popup."
                      value={inquiryFormFields}
                      onChange={setInquiryFormFields}
                    />
                  ),
                };

                return formFieldsConfig
                  .filter((f) => f.enabled)
                  .map((f) => <div key={f.key}>{fieldBlocks[f.key]}</div>);
              })()}

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setPanelOpen(false)}
                  style={{ ...S.btn, flex: 1, justifyContent: "center", background: "rgba(255,255,255,0.05)", color: "rgba(203,185,160,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ ...S.btn, flex: 2, justifyContent: "center", background: saving ? "rgba(217, 119, 6,0.3)" : "linear-gradient(135deg, #F59E0B, #B45309)", color: "#fff" }}>
                  {saving ? "Saving..." : editTarget ? "Update Event" : "Create Event"}
                  {!saving && <Tag size={13} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
