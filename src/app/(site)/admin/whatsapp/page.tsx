"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Plus, Trash2, Save, Check } from "lucide-react";
import {
  WHATSAPP_CONTENT_KEY,
  DEFAULT_WHATSAPP_CITIES,
  normalizeWhatsAppNumber,
  type WhatsAppConfig,
  type WhatsAppCityEntry,
} from "@/lib/whatsapp";

const S = {
  card: { background: "rgba(23,13,8,0.6)", border: "1px solid rgba(217, 119, 6,0.12)", borderRadius: "16px" },
  input: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(217, 119, 6,0.2)", borderRadius: "10px", color: "#F5EEE2", outline: "none", padding: "9px 12px", fontSize: "13px", width: "100%" },
  btn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none" },
};

export default function AdminWhatsAppPage() {
  const [rows, setRows] = useState<WhatsAppCityEntry[]>([]);
  const [defaultNumber, setDefaultNumber] = useState("");
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const [contentRes, cityRes] = await Promise.all([
        fetch(`/api/admin/site-content?key=${WHATSAPP_CONTENT_KEY}`, { cache: "no-store" }),
        fetch("/api/taxonomies?type=city", { cache: "no-store" }),
      ]);
      const content = (await contentRes.json()).content?.value as WhatsAppConfig | undefined;
      const cities: string[] = (await cityRes.json()).values ?? [];
      setCityOptions(Array.from(new Set([...DEFAULT_WHATSAPP_CITIES, ...cities])));
      setRows(
        content?.cities?.length
          ? content.cities
          : DEFAULT_WHATSAPP_CITIES.map((city) => ({ city, number: "", active: true }))
      );
      setDefaultNumber(content?.defaultNumber ?? "");
      setLoading(false);
    })();
  }, []);

  const update = (i: number, patch: Partial<WhatsAppCityEntry>) => {
    setSaved(false);
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  };

  const save = async () => {
    setSaving(true);
    const value: WhatsAppConfig = {
      cities: rows
        .filter((r) => r.city.trim())
        .map((r) => ({ city: r.city.trim(), number: r.number.trim(), active: r.active !== false })),
      defaultNumber: defaultNumber.trim(),
    };
    await fetch("/api/admin/site-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: WHATSAPP_CONTENT_KEY, value }),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-[#F5EEE2] flex items-center gap-2">
          <MessageCircle size={20} className="text-emerald-400" /> City-wise WhatsApp
        </h1>
        <p className="text-xs text-[#F5EEE2]/60 mt-1">
          When a visitor picks a city on the contact form or while booking, the WhatsApp button opens a chat with that
          city&apos;s number. Enter numbers with country code (a bare 10-digit number is treated as +91).
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-[#F5EEE2]/60">Loading…</div>
      ) : (
        <>
          <div style={S.card} className="p-5 flex flex-col gap-3">
            <datalist id="wa-cities">
              {cityOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>

            {rows.map((row, i) => {
              const normalized = normalizeWhatsAppNumber(row.number);
              return (
                <div key={i} className="grid grid-cols-[1fr_1.2fr_auto_auto] gap-2 items-center">
                  <input
                    list="wa-cities"
                    style={S.input}
                    placeholder="City"
                    value={row.city}
                    onChange={(e) => update(i, { city: e.target.value })}
                  />
                  <div className="flex flex-col">
                    <input
                      style={S.input}
                      placeholder="+91 98765 43210"
                      inputMode="tel"
                      value={row.number}
                      onChange={(e) => update(i, { number: e.target.value })}
                    />
                    {row.number && normalized.length < 11 && (
                      <span className="text-[10px] text-amber-400 mt-1">Looks too short — include the country code.</span>
                    )}
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-[#F5EEE2]/70 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={row.active !== false}
                      onChange={(e) => update(i, { active: e.target.checked })}
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    aria-label={`Remove ${row.city || "row"}`}
                    onClick={() => {
                      setSaved(false);
                      setRows((r) => r.filter((_, idx) => idx !== i));
                    }}
                    style={{ ...S.btn, background: "rgba(220,38,38,0.12)", color: "#f87171", padding: "9px" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setSaved(false);
                setRows((r) => [...r, { city: "", number: "", active: true }]);
              }}
              style={{ ...S.btn, background: "rgba(217,119,6,0.12)", color: "#fbbf24", alignSelf: "flex-start" }}
            >
              <Plus size={14} /> Add city
            </button>
          </div>

          <div style={S.card} className="p-5 flex flex-col gap-2">
            <label className="text-xs font-bold text-[#F5EEE2]/80">Default number (fallback)</label>
            <input
              style={S.input}
              placeholder="Used when the selected city has no number"
              inputMode="tel"
              value={defaultNumber}
              onChange={(e) => {
                setSaved(false);
                setDefaultNumber(e.target.value);
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              style={{ ...S.btn, background: "linear-gradient(135deg,#C59B27,#E5C05B)", color: "#2E050C", opacity: saving ? 0.6 : 1 }}
            >
              <Save size={14} /> {saving ? "Saving…" : "Save numbers"}
            </button>
            {saved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check size={14} /> Saved — live on the site within a minute.
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
