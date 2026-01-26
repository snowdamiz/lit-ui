/**
 * ConfiguratorPage - Theme Configurator (Redesigned)
 *
 * A minimal, docs-integrated theme configurator that matches the design
 * language of the rest of the documentation site.
 */

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import {
  ConfiguratorProvider,
  useConfigurator,
  type ColorKey,
} from "../../contexts/ConfiguratorContext";
import { ThemePreview } from "../../components/configurator/ThemePreview";
import { GetCommandModal } from "../../components/configurator/GetCommandModal";
import { CollapsibleColorPicker } from "../../components/configurator/CollapsibleColorPicker";
import { RadiusSelector } from "../../components/configurator/RadiusSelector";
import { ModeToggle } from "../../components/configurator/ModeToggle";
import { PresetSelector } from "../../components/configurator/PresetSelector";
import { ShareButton } from "../../components/configurator/ShareButton";
import { decodeThemeConfig } from "@lit-ui/cli/theme";
import { Palette, Sliders, Sparkles, Eye, Terminal } from "lucide-react";
import { PrevNextNav } from "../../components/PrevNextNav";

/**
 * URLLoader - Loads theme from URL on mount
 */
function URLLoader() {
  const [searchParams] = useSearchParams();
  const { loadThemeConfig } = useConfigurator();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const encoded = searchParams.get("theme");
    if (encoded) {
      try {
        const config = decodeThemeConfig(encoded);
        loadThemeConfig(config);
      } catch (e) {
        console.warn("Invalid theme in URL, using defaults:", e);
      }
    }
  }, [searchParams, loadThemeConfig]);

  return null;
}

/**
 * SectionHeader - Reusable section header matching docs style
 */
function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
    </div>
  );
}

/**
 * ConfiguratorContent - Main content that uses context
 */
function ConfiguratorContent() {
  const [commandModalOpen, setCommandModalOpen] = useState(false);
  const [expandedPicker, setExpandedPicker] = useState<ColorKey | null>(null);

  const handleTogglePicker = (key: ColorKey) => {
    setExpandedPicker(expandedPicker === key ? null : key);
  };

  const colorDefinitions: { key: ColorKey; label: string; description: string }[] = [
    { key: "primary", label: "Primary", description: "Main brand color for buttons and links" },
    { key: "secondary", label: "Secondary", description: "Supporting color for secondary actions" },
    { key: "destructive", label: "Destructive", description: "Used for delete and error states" },
    { key: "background", label: "Background", description: "Page and card backgrounds" },
    { key: "foreground", label: "Foreground", description: "Primary text color" },
    { key: "muted", label: "Muted", description: "Subtle backgrounds and secondary text" },
  ];

  return (
    <>
      <URLLoader />
      <div className="max-w-4xl">
        {/* Page Header */}
        <header className="relative mb-12 animate-fade-in-up opacity-0 stagger-1">
          <div className="pointer-events-none absolute -left-20 -top-10 h-40 w-40 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50 blur-3xl" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:text-5xl">
                  Theme Configurator
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                  Customize your Lit UI theme colors and export the configuration for your project.
                </p>
              </div>
              <ShareButton />
            </div>
          </div>
        </header>

        {/* Section: Quick Start with Presets */}
        <section className="scroll-mt-20 mb-12 animate-fade-in-up opacity-0 stagger-2">
          <SectionHeader
            icon={Sparkles}
            title="Quick Start"
            description="Choose a preset theme as a starting point"
          />
          <PresetSelector />
        </section>

        {/* Section: Mode & Style */}
        <section className="scroll-mt-20 mb-12 animate-fade-in-up opacity-0 stagger-3">
          <SectionHeader
            icon={Sliders}
            title="Mode & Style"
            description="Toggle between light and dark mode editing"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 card-elevated">
              <ModeToggle />
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 card-elevated">
              <RadiusSelector />
            </div>
          </div>
        </section>

        {/* Section: Colors */}
        <section className="scroll-mt-20 mb-12 animate-fade-in-up opacity-0 stagger-4">
          <SectionHeader
            icon={Palette}
            title="Colors"
            description="Click any color to customize it"
          />
          <div className="space-y-3">
            {colorDefinitions.map((color, index) => (
              <div
                key={color.key}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CollapsibleColorPicker
                  colorKey={color.key}
                  label={color.label}
                  description={color.description}
                  expanded={expandedPicker === color.key}
                  onToggle={() => handleTogglePicker(color.key)}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Dark mode colors are automatically derived from light mode. Override them by switching to dark mode and customizing.
          </p>
        </section>

        {/* Section: Live Preview */}
        <section className="scroll-mt-20 mb-12 animate-fade-in-up opacity-0 stagger-5">
          <SectionHeader
            icon={Eye}
            title="Live Preview"
            description="See your theme applied to components"
          />
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden card-elevated">
            <ThemePreview />
          </div>
        </section>

        {/* Section: Export */}
        <section className="scroll-mt-20 mb-14 animate-fade-in-up opacity-0 stagger-6">
          <SectionHeader
            icon={Terminal}
            title="Export Theme"
            description="Get the CLI command to apply this theme"
          />
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 card-elevated">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Generate a CLI command to apply this theme configuration to your project.
              You can also share the current URL to save or share your configuration.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCommandModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-medium rounded-lg transition-colors"
                type="button"
              >
                <Terminal size={16} />
                Get CLI Command
              </button>
              <ShareButton variant="outline" />
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="divider-fade mb-8" />
        <PrevNextNav
          prev={{ title: "Theming Guide", href: "/guides/theming" }}
          next={{ title: "Components", href: "/components/button" }}
        />
      </div>

      <GetCommandModal
        open={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
      />
    </>
  );
}

/**
 * ConfiguratorPage - Top-level page component with provider wrapper
 */
export function ConfiguratorPage() {
  return (
    <ConfiguratorProvider>
      <ConfiguratorContent />
    </ConfiguratorProvider>
  );
}

export default ConfiguratorPage;
