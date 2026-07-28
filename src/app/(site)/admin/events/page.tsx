"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Pencil, Trash2, Search, X, Check, CalendarDays,
  MapPin, Tag, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import RepeaterField from "@/components/admin/RepeaterField";
import ScheduleDaysEditor, { ScheduleDay } from "@/components/admin/ScheduleDaysEditor";

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
  created_at: string;
}

interface Taxonomy { value: string }

const EMPTY_TICKET: TicketPrice = { type: "General Entry", price: 0, available: 0, description: "" };
const EMPTY_TIER: SponsorshipTier = { tier: "", amount: "", benefits: "" };
const EMPTY_STALL: StallOption = { type: "", size: "", rate: "", includes: "" };
const EMPTY_AD_RATE: AdRate = { category: "", amount: "" };
const EMPTY_ORGANIZER: Organizer = { name: "", contact: "", email: "", phone: "" };
const EMPTY_HEADLINER: Headliner = { name: "", role: "", img: "" };
const EMPTY_FAQ: Faq = { q: "", a: "" };

const EMPTY_FORM = {
  name: "", slug: "", category: "", city: "", venue: "",
  eventDate: "", eventTime: "18:00", bannerUrl: "", summary: "", description: "",
  isFeatured: false, isUpcoming: true, rating: "4.6", reviewCount: "25", dateIsTentative: false,
};

const S = {
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "16px" },
  input: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "10px 12px",
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
  const [ticketPrices, setTicketPrices] = useState<TicketPrice[]>([]);
  const [sponsorshipTiers, setSponsorshipTiers] = useState<SponsorshipTier[]>([]);
  const [stallOptions, setStallOptions] = useState<StallOption[]>([]);
  const [adRates, setAdRates] = useState<AdRate[]>([]);
  const [headliners, setHeadliners] = useState<Headliner[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([]);
  const [organizer, setOrganizer] = useState<Organizer>(EMPTY_ORGANIZER);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, category: categories[0] || "", city: cities[0] || "" });
    setTicketPrices([{ ...EMPTY_TICKET }]);
    setSponsorshipTiers([]);
    setStallOptions([]);
    setAdRates([]);
    setHeadliners([]);
    setFaqs([]);
    setScheduleDays([]);
    setOrganizer({ ...EMPTY_ORGANIZER });
    setPanelOpen(true);
  };
  const openEdit = (ev: Event) => {
    setEditTarget(ev);
    setForm({
      name: ev.name, slug: ev.slug, category: ev.category,
      city: ev.city, venue: ev.venue, eventDate: ev.event_date?.slice(0, 10) || "",
      eventTime: ev.event_time || "18:00", bannerUrl: ev.banner_url || "",
      summary: ev.summary || "", description: ev.description || "",
      isFeatured: ev.is_featured, isUpcoming: ev.is_upcoming,
      rating: String(ev.rating ?? 4.6), reviewCount: String(ev.review_count ?? 25),
      dateIsTentative: ev.date_is_tentative ?? false,
    });
    setTicketPrices(Array.isArray(ev.ticket_prices) && ev.ticket_prices.length > 0 ? ev.ticket_prices : [{ ...EMPTY_TICKET }]);
    setSponsorshipTiers(Array.isArray(ev.sponsorship_tiers) ? ev.sponsorship_tiers : []);
    setStallOptions(Array.isArray(ev.stall_options) ? ev.stall_options : []);
    setAdRates(Array.isArray(ev.ad_rates) ? ev.ad_rates : []);
    setHeadliners(Array.isArray(ev.headliners) ? ev.headliners : []);
    setFaqs(Array.isArray(ev.faqs) ? ev.faqs : []);
    setScheduleDays(Array.isArray(ev.schedule_days) ? ev.schedule_days : []);
    setOrganizer(ev.organizer && ev.organizer.name !== undefined ? ev.organizer : { ...EMPTY_ORGANIZER });
    setPanelOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const method = editTarget ? "PUT" : "POST";
    const body = {
      ...form,
      rating: Number(form.rating) || 0,
      reviewCount: Number(form.reviewCount) || 0,
      ticketPrices: ticketPrices.filter(t => t.type.trim()),
      sponsorshipTiers: sponsorshipTiers.filter(t => t.tier.trim()),
      stallOptions: stallOptions.filter(s => s.type.trim()),
      adRates: adRates.filter(a => a.category.trim()),
      headliners: headliners.filter(h => h.name.trim()),
      faqs: faqs.filter(f => f.q.trim()),
      scheduleDays: scheduleDays.filter(d => d.dayLabel.trim()),
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
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#E2E8F0" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Event Management</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>{total} events total</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openCreate} style={{ ...S.btn, background: "linear-gradient(135deg, #4F46E5, #DB2777)", color: "#fff" }}>
            <Plus size={14} /> New Event
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(148,163,184,0.4)" }} />
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
              <tr style={{ borderBottom: "1px solid rgba(99,102,241,0.1)", background: "rgba(99,102,241,0.05)" }}>
                {["Event", "Category", "Date & Venue", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "rgba(148,163,184,0.5)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(99,102,241,0.06)]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-4">
                    <div className="h-4 rounded animate-pulse w-3/4" style={{ background: "rgba(99,102,241,0.1)" }} />
                  </td></tr>
                ))
              ) : events.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm"
                  style={{ color: "rgba(148,163,184,0.4)" }}>
                  No events found. Create your first event.
                </td></tr>
              ) : events.map((ev) => (
                <tr key={ev.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white text-sm leading-tight">{ev.name}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "rgba(148,163,184,0.4)" }}>/{ev.slug}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold"
                      style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>
                      {ev.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(148,163,184,0.7)" }}>
                      <CalendarDays size={11} /> {ev.event_date?.slice(0, 10)}
                      {ev.date_is_tentative && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" }}>
                          Tentative
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs mt-1" style={{ color: "rgba(148,163,184,0.5)" }}>
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
                          : "text-slate-400 border border-slate-400/20 bg-slate-400/10"
                      }`}>
                        {ev.is_upcoming ? "Upcoming" : "Past"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(ev)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}
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
                            style={{ background: "rgba(148,163,184,0.1)", color: "#94A3B8" }}>
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
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(99,102,241,0.1)" }}>
            <span className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg disabled:opacity-30"
                style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30"
                style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
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
            style={{ background: "#0F1729", borderLeft: "1px solid rgba(99,102,241,0.2)" }}>
            <div className="flex items-center justify-between p-6 border-b sticky top-0 z-10"
              style={{ borderColor: "rgba(99,102,241,0.15)", background: "#0F1729" }}>
              <h2 className="font-extrabold text-white text-lg">
                {editTarget ? "Edit Event" : "Create Event"}
              </h2>
              <button onClick={() => setPanelOpen(false)} className="p-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8" }}>
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
                    style={{ color: "rgba(148,163,184,0.5)" }}>{f.label}</label>
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
                  style={{ background: form.dateIsTentative ? "#F59E0B" : "rgba(99,102,241,0.15)" }}
                  onClick={() => setForm(prev => ({ ...prev, dateIsTentative: !prev.dateIsTentative }))}
                >
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{ transform: form.dateIsTentative ? "translateX(16px)" : "translateX(0)" }} />
                </div>
                <span className="text-xs font-medium" style={{ color: "rgba(148,163,184,0.7)" }}>
                  Date is tentative / not yet confirmed
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                    style={{ color: "rgba(148,163,184,0.5)" }}>Category</label>
                  <select style={S.input} value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                    style={{ color: "rgba(148,163,184,0.5)" }}>City</label>
                  <select style={S.input} value={form.city}
                    onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}>
                    <option value="">Select city</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <ImageUploadField label="Banner Image" value={form.bannerUrl} onChange={(url) => setForm(prev => ({ ...prev, bannerUrl: url }))} />

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                  style={{ color: "rgba(148,163,184,0.5)" }}>Summary</label>
                <textarea rows={2} style={{ ...S.input, resize: "vertical" }}
                  value={form.summary}
                  onChange={(e) => setForm(prev => ({ ...prev, summary: e.target.value }))} />
              </div>

              <RichTextEditor label="Full Description" value={form.description}
                onChange={(html) => setForm(prev => ({ ...prev, description: html }))} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                    style={{ color: "rgba(148,163,184,0.5)" }}>Rating (0-5)</label>
                  <input type="number" step="0.1" min="0" max="5" style={S.input} value={form.rating}
                    onChange={(e) => setForm(prev => ({ ...prev, rating: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1.5"
                    style={{ color: "rgba(148,163,184,0.5)" }}>Review Count</label>
                  <input type="number" min="0" style={S.input} value={form.reviewCount}
                    onChange={(e) => setForm(prev => ({ ...prev, reviewCount: e.target.value }))} />
                </div>
              </div>

              <RepeaterField
                label="Ticket Prices"
                hint="Consumer ticket tiers (General, VIP, Student, etc.)"
                columns={[
                  { key: "type", label: "Ticket type (e.g. VIP Pass)", span: 2 },
                  { key: "price", label: "Price (₹)", type: "number" },
                  { key: "available", label: "Available", type: "number" },
                  { key: "description", label: "Description", type: "textarea", span: 2 },
                ]}
                value={ticketPrices}
                onChange={setTicketPrices}
                emptyRow={EMPTY_TICKET}
                addLabel="Add ticket tier"
              />

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

              {/* Organizer */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>Organizer</label>
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

              <RepeaterField
                label="Headliners"
                hint="Featured artists/performers shown on the event page — leave empty if not applicable"
                columns={[
                  { key: "name", label: "Name" },
                  { key: "role", label: "Role (e.g. Folk Headliner)" },
                  { key: "img", label: "Photo URL", span: 2 },
                ]}
                value={headliners}
                onChange={setHeadliners}
                emptyRow={EMPTY_HEADLINER}
                addLabel="Add headliner"
              />

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

              <ScheduleDaysEditor
                label="Program Schedule"
                value={scheduleDays}
                onChange={setScheduleDays}
              />

              <div className="flex gap-6">
                {[
                  { label: "Featured Event", key: "isFeatured" },
                  { label: "Mark as Upcoming", key: "isUpcoming" },
                ].map((toggle) => (
                  <label key={toggle.key} className="flex items-center gap-2.5 cursor-pointer">
                    <div
                      className="relative w-9 h-5 rounded-full transition-colors"
                      style={{ background: (form as Record<string, unknown>)[toggle.key] ? "#4F46E5" : "rgba(99,102,241,0.15)" }}
                      onClick={() => setForm(prev => ({ ...prev, [toggle.key]: !(prev as Record<string, unknown>)[toggle.key] }))}
                    >
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                        style={{ transform: (form as Record<string, unknown>)[toggle.key] ? "translateX(16px)" : "translateX(0)" }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: "rgba(148,163,184,0.7)" }}>{toggle.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setPanelOpen(false)}
                  style={{ ...S.btn, flex: 1, justifyContent: "center", background: "rgba(255,255,255,0.05)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ ...S.btn, flex: 2, justifyContent: "center", background: saving ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #4F46E5, #DB2777)", color: "#fff" }}>
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
