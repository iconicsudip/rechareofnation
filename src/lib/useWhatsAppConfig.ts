"use client";

import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api-client";
import { WHATSAPP_CONTENT_KEY, type WhatsAppConfig } from "@/lib/whatsapp";

export function useWhatsAppConfig(): WhatsAppConfig | null {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  useEffect(() => {
    let alive = true;
    ApiClient.getSiteContent<WhatsAppConfig>(WHATSAPP_CONTENT_KEY).then((c) => {
      if (alive) setConfig(c);
    });
    return () => {
      alive = false;
    };
  }, []);
  return config;
}
