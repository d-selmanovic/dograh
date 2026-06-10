"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
    chatwootSettings?: {
      position?: "left" | "right";
      type?: "standard" | "expanded_bubble";
      launcherTitle?: string;
    };
  }
}

const CHATWOOT_BASE_URL = process.env.NEXT_PUBLIC_CHATWOOT_URL;
const CHATWOOT_WEBSITE_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_TOKEN;
const CHATWOOT_SCRIPT_ID = "chatwoot-sdk-script";
const CHATWOOT_HOLDER_IDS = [
  "cw-widget-holder",
  "cw-bubble-holder",
  "cw-widget-styles",
] as const;

function setHolderVisibility(hidden: boolean) {
  for (const id of CHATWOOT_HOLDER_IDS) {
    const element = document.getElementById(id);
    if (element instanceof HTMLElement) {
      element.style.display = hidden ? "none" : "";
    }
  }
}

export default function ChatwootWidget() {
  const pathname = usePathname();

  useEffect(() => {
    const isWorkflowPage = /^\/workflow\/[^/]+(?:\/.*)?$/.test(pathname);

    setHolderVisibility(isWorkflowPage);
    if (isWorkflowPage) {
      return;
    }

    if (!CHATWOOT_BASE_URL || !CHATWOOT_WEBSITE_TOKEN) {
      console.warn(
        "Chatwoot not configured: Missing NEXT_PUBLIC_CHATWOOT_URL or NEXT_PUBLIC_CHATWOOT_TOKEN",
      );
      return;
    }

    if (!window.chatwootSettings) {
      window.chatwootSettings = {
        position: "right",
        type: "standard",
        launcherTitle: "Chat with us",
      };
    }

    const runWidget = () => {
      window.chatwootSDK?.run({
        websiteToken: CHATWOOT_WEBSITE_TOKEN,
        baseUrl: CHATWOOT_BASE_URL,
      });
    };

    const existingScript = document.getElementById(
      CHATWOOT_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      runWidget();
      return;
    }

    const script = document.createElement("script");
    script.id = CHATWOOT_SCRIPT_ID;
    script.src = `${CHATWOOT_BASE_URL}/packs/js/sdk.js`;
    script.async = true;
    script.defer = true;
    script.onload = runWidget;
    document.body.appendChild(script);
  }, [pathname]);

  return null;
}
