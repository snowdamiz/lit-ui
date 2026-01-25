/**
 * ShareButton - Copy shareable theme URL to clipboard
 *
 * Generates a URL with the current theme encoded in search params.
 * Shows feedback when URL is copied.
 */

import { useState, useCallback } from "react";
import { Link, Check } from "lucide-react";
import { useConfigurator } from "../../contexts/ConfiguratorContext";

export function ShareButton() {
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

  return (
    <button
      onClick={handleShare}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-all duration-200
        ${
          copied
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        }
      `}
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
