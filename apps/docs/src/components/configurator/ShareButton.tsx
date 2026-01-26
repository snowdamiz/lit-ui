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
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
    outline: copied
      ? "border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
      : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
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
