"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Check, RefreshCw, Plus, Trash2 } from "lucide-react";
import RepeaterField from "@/components/admin/RepeaterField";
import SimpleListEditor from "@/components/admin/SimpleListEditor";

interface SiteContentRow {
  key: string;
  value: Record<string, unknown>;
  updated_at?: string;
}

const KEY_META: Record<string, { label: string; description: string }> = {
  homepage_hero: { label: "Homepage Hero Slides", description: "The rotating hero banner on the homepage." },
  homepage_testimonials: { label: "Homepage Testimonials", description: "The scrolling testimonial wall." },
  homepage_partner_logos: { label: "Homepage Partner Logos", description: "Brand names in the trusted-partners marquee." },
  about_page: { label: "About Page", description: "Mission copy, milestones, and core values." },
  contact_info: { label: "Contact Page", description: "Address, phone, email, and map." },
  footer: { label: "Footer", description: "Brand description, newsletter copy, and link columns." },
  nav_links: { label: "Navigation Menu", description: "The main nav bar items." },
  legal_terms: { label: "Terms & Conditions", description: "Full legal document body." },
  legal_privacy: { label: "Privacy Policy", description: "Full legal document body." },
  sponsorship_tiers: { label: "Sponsorship Tiers", description: "Pricing packages shown on the sponsors page." },
  homepage_hubs: { label: "Homepage National Hubs", description: "The curated category hub cards on the homepage — each links to a real event category." },
  homepage_stats: { label: "Homepage Stats Bar", description: "The trust/stat tiles strip on the homepage." },
  homepage_newsletter: { label: "Homepage Newsletter Banner", description: "The VIP gateway email signup banner copy." },
  sponsors_page: { label: "Sponsors Page", description: "Hero copy, stat tiles, and the Enlist Your Brand panel." },
  gallery_page: { label: "Gallery Page", description: "Hero eyebrow, heading, and description." },
  blogs_page: { label: "Blogs Page", description: "Hero heading and description." },
};

const KEY_ORDER = Object.keys(KEY_META);

const S = {
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "16px" },
  input: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "9px 12px", fontSize: "13px", width: "100%" },
  btn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none" },
};

const isLongText = (v: string) => v.length > 90 || v.includes("\n");

// ─── Empty row shapes for each structured field ─────────────────────────────
const EMPTY_SLIDE = { badge: "", titleLine1: "", titleLine2: "", accent: "", desc: "", image: "", tier: "", multipass: "", eventDate: "", venue: "", gate: "", price: "", code: "", slug: "" };
const EMPTY_TESTIMONIAL = { quote: "", author: "", role: "" };
const EMPTY_MILESTONE = { title: "", desc: "" };
const EMPTY_NAV_ITEM = { name: "", href: "" };
const EMPTY_SECTION = { title: "", body: "" };
const EMPTY_FOOTER_LINK = { label: "", href: "" };
const EMPTY_TIER_KEYS = ["TITLE", "PLATINUM", "GOLD", "ASSOCIATE"];
const EMPTY_TIER = { name: "", price: 0, baseImpressions: 0, space: "", allotments: "", entitlements: [] as string[], placements: "" };
const EMPTY_HUB = { category: "", desc: "" };
const EMPTY_STAT = { value: "", label: "" };

interface FooterColumn { title: string; links: { label: string; href: string }[] }

function FooterColumnsEditor({ value, onChange }: { value: FooterColumn[]; onChange: (cols: FooterColumn[]) => void }) {
  const columns = value ?? [];
  const updateColumn = (i: number, patch: Partial<FooterColumn>) =>
    onChange(columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const removeColumn = (i: number) => onChange(columns.filter((_, idx) => idx !== i));
  const addColumn = () => onChange([...columns, { title: "", links: [] }]);

  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>
        Footer Columns
      </label>
      <div className="flex flex-col gap-4">
        {columns.map((col, i) => (
          <div key={i} className="p-4 rounded-xl relative" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <button type="button" onClick={() => removeColumn(i)}
              className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.1)", color: "#F87171", border: "none", cursor: "pointer" }}>
              <Trash2 size={11} />
            </button>
            <input style={{ ...S.input, marginBottom: "10px", maxWidth: "70%" }} placeholder="Column title (e.g. For Audiences)"
              value={col.title} onChange={(e) => updateColumn(i, { title: e.target.value })} />
            <RepeaterField
              columns={[{ key: "label", label: "Link label" }, { key: "href", label: "Link href (e.g. /events)" }]}
              value={col.links as unknown as Record<string, unknown>[]}
              onChange={(links) => updateColumn(i, { links: links as unknown as { label: string; href: string }[] })}
              emptyRow={EMPTY_FOOTER_LINK}
              addLabel="Add link"
            />
          </div>
        ))}
      </div>
      <button type="button" onClick={addColumn} className="flex items-center gap-1.5 mt-2.5"
        style={{ ...S.btn, background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>
        <Plus size={12} /> Add column
      </button>
    </div>
  );
}

function SponsorshipTiersEditor({ value, onChange }: { value: Record<string, typeof EMPTY_TIER>; onChange: (v: Record<string, typeof EMPTY_TIER>) => void }) {
  const tiers = value ?? {};
  const updateTier = (key: string, patch: Partial<typeof EMPTY_TIER>) =>
    onChange({ ...tiers, [key]: { ...(tiers[key] ?? EMPTY_TIER), ...patch } });

  return (
    <div className="flex flex-col gap-4">
      {EMPTY_TIER_KEYS.map((tierKey) => {
        const tier = tiers[tierKey] ?? EMPTY_TIER;
        return (
          <div key={tierKey} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: "#818CF8" }}>{tierKey}</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input style={S.input} placeholder="Tier display name" value={tier.name}
                onChange={(e) => updateTier(tierKey, { name: e.target.value })} />
              <input type="number" style={S.input} placeholder="Price (₹)" value={tier.price}
                onChange={(e) => updateTier(tierKey, { price: Number(e.target.value) })} />
              <input type="number" style={S.input} placeholder="Base impressions" value={tier.baseImpressions}
                onChange={(e) => updateTier(tierKey, { baseImpressions: Number(e.target.value) })} />
              <input style={S.input} placeholder="Space (e.g. 300 sq.ft Pavilion)" value={tier.space}
                onChange={(e) => updateTier(tierKey, { space: e.target.value })} />
              <input style={S.input} placeholder="Allotments (e.g. 40 Full Pass Badges)" value={tier.allotments}
                onChange={(e) => updateTier(tierKey, { allotments: e.target.value })} />
              <input style={S.input} placeholder="Placements" value={tier.placements}
                onChange={(e) => updateTier(tierKey, { placements: e.target.value })} />
            </div>
            <SimpleListEditor label="Entitlements" value={tier.entitlements}
              onChange={(entitlements) => updateTier(tierKey, { entitlements })}
              placeholder="Add an entitlement..." />
          </div>
        );
      })}
    </div>
  );
}

export default function AdminContentPage() {
  const [rows, setRows] = useState<Record<string, SiteContentRow>>({});
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState(KEY_ORDER[0]);
  const [scalarFields, setScalarFields] = useState<Record<string, string>>({});
  const [structured, setStructured] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/site-content");
    const data = await res.json();
    const map: Record<string, SiteContentRow> = {};
    for (const r of data.contents ?? []) map[r.key] = r;
    setRows(map);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const value = rows[activeKey]?.value ?? {};
    const scalars: Record<string, string> = {};
    const struct: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        scalars[k] = String(v);
      } else {
        struct[k] = v;
      }
    }
    setScalarFields(scalars);
    setStructured(struct);
    setSaved(false);
  }, [activeKey, rows]);

  const handleSave = async () => {
    setSaving(true);
    const merged: Record<string, unknown> = { ...scalarFields, ...structured };
    await fetch("/api/admin/site-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: activeKey, value: merged }),
    });
    setSaving(false);
    setSaved(true);
    load();
  };

  const setStruct = (patch: Record<string, unknown>) => setStructured((s) => ({ ...s, ...patch }));
  const meta = KEY_META[activeKey];

  return (
    <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-6" style={{ color: "#E2E8F0" }}>
      {/* Sidebar */}
      <div className="lg:w-64 flex-shrink-0 flex flex-col gap-1">
        <h1 className="text-xl font-extrabold text-white tracking-tight mb-1">Site Content</h1>
        <p className="text-xs mb-4" style={{ color: "rgba(148,163,184,0.6)" }}>Edit copy shown across the public site.</p>
        {KEY_ORDER.map((key) => (
          <button
            key={key}
            onClick={() => setActiveKey(key)}
            className="text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: activeKey === key ? "linear-gradient(135deg, rgba(79,70,229,0.25), rgba(219,39,119,0.12))" : "transparent",
              color: activeKey === key ? "#fff" : "rgba(148,163,184,0.7)",
              border: activeKey === key ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
            }}
          >
            {KEY_META[key].label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="h-64 rounded-2xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />
        ) : (
          <div style={S.card} className="p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-extrabold text-white text-lg">{meta.label}</h2>
                <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>{meta.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={load} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
                  <RefreshCw size={13} /> Refresh
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ ...S.btn, background: saving ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg,#4F46E5,#DB2777)", color: "#fff" }}>
                  {saving ? "Saving..." : saved ? <><Check size={14} /> Saved</> : "Save Changes"}
                </button>
              </div>
            </div>

            {Object.keys(scalarFields).length === 0 && Object.keys(structured).length === 0 && (
              <div className="flex items-center gap-2 text-sm py-8 justify-center" style={{ color: "rgba(148,163,184,0.5)" }}>
                <FileText size={16} /> No content seeded for this key yet.
              </div>
            )}

            {/* Flat scalar fields (headings, subheadings, single strings) */}
            {Object.entries(scalarFields).map(([field, val]) => (
              <div key={field}>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>
                  {field}
                </label>
                {isLongText(val) ? (
                  <textarea rows={4} style={{ ...S.input, resize: "vertical" }} value={val}
                    onChange={(e) => setScalarFields((p) => ({ ...p, [field]: e.target.value }))} />
                ) : (
                  <input style={S.input} value={val}
                    onChange={(e) => setScalarFields((p) => ({ ...p, [field]: e.target.value }))} />
                )}
              </div>
            ))}

            {/* Structured, type-specific editors — no raw JSON anywhere */}
            {activeKey === "homepage_hero" && (
              <RepeaterField
                label="Hero Slides"
                columns={[
                  { key: "badge", label: "Badge text", span: 2 },
                  { key: "titleLine1", label: "Title line 1" },
                  { key: "titleLine2", label: "Title line 2" },
                  { key: "accent", label: "Accent label", span: 2 },
                  { key: "desc", label: "Description", type: "textarea", span: 2 },
                  { key: "image", label: "Slide Image", type: "image", span: 2 },
                  { key: "tier", label: "Tier label" },
                  { key: "multipass", label: "Multipass label" },
                  { key: "eventDate", label: "Event date text" },
                  { key: "venue", label: "Venue" },
                  { key: "gate", label: "Gate label" },
                  { key: "price", label: "Price text" },
                  { key: "code", label: "Pass code" },
                  { key: "slug", label: "Linked event slug" },
                ]}
                value={(structured.slides as Record<string, unknown>[]) ?? []}
                onChange={(v) => setStruct({ slides: v })}
                emptyRow={EMPTY_SLIDE}
                addLabel="Add slide"
              />
            )}

            {activeKey === "homepage_testimonials" && (
              <RepeaterField
                label="Testimonials"
                columns={[
                  { key: "quote", label: "Quote", type: "textarea", span: 2 },
                  { key: "author", label: "Author name" },
                  { key: "role", label: "Author role" },
                ]}
                value={(structured.testimonials as Record<string, unknown>[]) ?? []}
                onChange={(v) => setStruct({ testimonials: v })}
                emptyRow={EMPTY_TESTIMONIAL}
                addLabel="Add testimonial"
              />
            )}

            {activeKey === "homepage_partner_logos" && (
              <SimpleListEditor
                label="Partner Logo Names"
                value={(structured.logos as string[]) ?? []}
                onChange={(v) => setStruct({ logos: v })}
                placeholder="Add a brand name..."
              />
            )}

            {activeKey === "about_page" && (
              <>
                <SimpleListEditor
                  label="Intro Paragraphs"
                  value={(structured.introParagraphs as string[]) ?? []}
                  onChange={(v) => setStruct({ introParagraphs: v })}
                  placeholder="Add a paragraph..."
                />
                <RepeaterField
                  label="Milestones / Stats"
                  columns={[{ key: "title", label: "Stat (e.g. 50+)" }, { key: "desc", label: "Label" }]}
                  value={(structured.milestones as Record<string, unknown>[]) ?? []}
                  onChange={(v) => setStruct({ milestones: v })}
                  emptyRow={EMPTY_MILESTONE}
                  addLabel="Add milestone"
                />
                <RepeaterField
                  label="Core Values"
                  columns={[{ key: "title", label: "Title" }, { key: "desc", label: "Description", type: "textarea" }]}
                  value={(structured.coreValues as Record<string, unknown>[]) ?? []}
                  onChange={(v) => setStruct({ coreValues: v })}
                  emptyRow={EMPTY_MILESTONE}
                  addLabel="Add core value"
                />
              </>
            )}

            {activeKey === "footer" && (
              <FooterColumnsEditor
                value={(structured.columns as FooterColumn[]) ?? []}
                onChange={(v) => setStruct({ columns: v })}
              />
            )}

            {activeKey === "nav_links" && (
              <RepeaterField
                label="Navigation Items"
                columns={[{ key: "name", label: "Label" }, { key: "href", label: "Link (e.g. /events)" }]}
                value={(structured.items as Record<string, unknown>[]) ?? []}
                onChange={(v) => setStruct({ items: v })}
                emptyRow={EMPTY_NAV_ITEM}
                addLabel="Add nav item"
              />
            )}

            {(activeKey === "legal_terms" || activeKey === "legal_privacy") && (
              <RepeaterField
                label="Sections"
                hint="Body supports basic HTML (e.g. <ul><li>...</li></ul>, <strong>...</strong>)"
                columns={[
                  { key: "title", label: "Section title", span: 2 },
                  { key: "body", label: "Body", type: "textarea", span: 2 },
                ]}
                value={(structured.sections as Record<string, unknown>[]) ?? []}
                onChange={(v) => setStruct({ sections: v })}
                emptyRow={EMPTY_SECTION}
                addLabel="Add section"
              />
            )}

            {activeKey === "sponsorship_tiers" && (
              <SponsorshipTiersEditor
                value={structured as Record<string, typeof EMPTY_TIER>}
                onChange={(v) => setStructured(v)}
              />
            )}

            {activeKey === "homepage_hubs" && (
              <RepeaterField
                label="Hub Cards"
                hint="Category must exactly match a value from Categories & Cities → Event Categories, or the card's link won't find any events."
                columns={[
                  { key: "category", label: "Event category (must match taxonomy exactly)", span: 2 },
                  { key: "desc", label: "Short description", type: "textarea", span: 2 },
                ]}
                value={(structured.hubs as Record<string, unknown>[]) ?? []}
                onChange={(v) => setStruct({ hubs: v })}
                emptyRow={EMPTY_HUB}
                addLabel="Add hub card"
              />
            )}

            {activeKey === "homepage_stats" && (
              <RepeaterField
                label="Stat Tiles"
                columns={[
                  { key: "value", label: "Value (e.g. 250K+)" },
                  { key: "label", label: "Label (e.g. Tickets Booked Successfully)" },
                ]}
                value={(structured.stats as Record<string, unknown>[]) ?? []}
                onChange={(v) => setStruct({ stats: v })}
                emptyRow={EMPTY_STAT}
                addLabel="Add stat tile"
              />
            )}

            {activeKey === "sponsors_page" && (
              <>
                <RepeaterField
                  label="Hero Stat Tiles"
                  columns={[
                    { key: "label", label: "Label (e.g. Total Audience Reach)" },
                    { key: "value", label: "Value (e.g. 15 Lakhs+)" },
                  ]}
                  value={(structured.stats as Record<string, unknown>[]) ?? []}
                  onChange={(v) => setStruct({ stats: v })}
                  emptyRow={EMPTY_STAT}
                  addLabel="Add stat tile"
                />
                <SimpleListEditor
                  label="Enlist Panel Bullet Points"
                  value={(structured.enlistBullets as string[]) ?? []}
                  onChange={(v) => setStruct({ enlistBullets: v })}
                  placeholder="Add a bullet point..."
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
