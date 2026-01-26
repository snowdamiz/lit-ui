/**
 * ShareButton - Copy shareable theme URL to clipboard
 *
 * Generates a URL with the current theme encoded in search params.
 * Shows feedback when URL is copied.
 */

import { useState, useCallback } from "react";
import { Link, Check } from "lucide-react";
import { useConfigurator } from "../../contexts/ConfiguratorContext";

interface ShareButtonProps {
  variant?: "default" | "outline";
}

export function ShareButton({ variant = "default" }: ShareButtonProps) {
  const { getEncodedConfig } = useConfigurator();
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const encoded = getEncodedConfig();
    const url = new URL(window.location.href);
    url.searchParams.set("theme", encoded);

    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  }, [getEncodedConfig]);

  const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200";

  const variantClasses = {
    default: copied
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    outline: copied
      ? "border border-green-300 text-green-700 bg-green-50"
      : "border border-gray-200 text-gray-700 hover:bg-gray-50",
  };

  return (
    <button
      onClick={handleShare}
      className={`${baseClasses} ${variantClasses[variant]}`}
      type="button"
    >
      {copied ? (
        <>
          <Check size={16} />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Link size={16} />
          <span>Share URL</span>
        </>
      )}
    </button>
  );
}

export default ShareButton;
