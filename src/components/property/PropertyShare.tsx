"use client";

import { useState } from "react";
import { Share2, Link as LinkIcon, Twitter, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/layout/LocaleProvider";

interface PropertyShareProps {
  slug: string;
  title: string;
}

export function PropertyShare({ slug, title }: PropertyShareProps) {
  const { locale, dict } = useLocale();
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const getFullUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${locale}/propiedades/${slug}`;
    }
    return "";
  };

  const copyToClipboard = async () => {
    const url = getFullUrl();
    if (!url) return;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy url to clipboard", err);
    }
  };

  const shareWhatsApp = () => {
    const url = getFullUrl();
    if (!url) return;
    const text = encodeURIComponent(`${title}: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const shareTwitter = () => {
    const url = getFullUrl();
    if (!url) return;
    const text = encodeURIComponent(`Check out this property: ${title}`);
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`, "_blank");
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-1.5 h-9"
      >
        <Share2 className="h-4 w-4" />
        <span>{dict.property?.detail?.compartir || "Compartir"}</span>
      </Button>

      {showOptions && (
        <>
          {/* Backdrop close area */}
          <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
          
          <div className="absolute right-0 mt-2 w-48 rounded-sm bg-[var(--surface)] border border-[var(--border-strong)] shadow-[var(--shadow-md)] p-1 z-20 flex flex-col gap-0.5">
            {/* Copy Link */}
            <button
              onClick={() => {
                copyToClipboard();
                setShowOptions(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors rounded-xs text-left cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                  <span className="text-[var(--success)] font-medium">
                    {locale === "es" ? "¡Copiado!" : "Copied!"}
                  </span>
                </>
              ) : (
                <>
                  <LinkIcon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span>{locale === "es" ? "Copiar enlace" : "Copy Link"}</span>
                </>
              )}
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => {
                shareWhatsApp();
                setShowOptions(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors rounded-xs text-left cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span>WhatsApp</span>
            </button>

            {/* Twitter */}
            <button
              onClick={() => {
                shareTwitter();
                setShowOptions(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors rounded-xs text-left cursor-pointer"
            >
              <Twitter className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span>Twitter (X)</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
