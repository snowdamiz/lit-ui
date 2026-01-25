/**
 * ConfiguratorPage - Main Theme Configurator Page
 *
 * Composes the configurator with state provider, layout, sidebar controls,
 * preview area, and command modal.
 */

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import {
  ConfiguratorProvider,
  useConfigurator,
  type ColorKey,
} from "../../contexts/ConfiguratorContext";
import { ConfiguratorLayout } from "../../components/configurator/ConfiguratorLayout";
import { ThemePreview } from "../../components/configurator/ThemePreview";
import { GetCommandModal } from "../../components/configurator/GetCommandModal";
import { ColorPickerGroup } from "../../components/configurator/ColorPickerGroup";
import { ColorSection } from "../../components/configurator/ColorSection";
import { TailwindSwatches } from "../../components/configurator/TailwindSwatches";
import { RadiusSelector } from "../../components/configurator/RadiusSelector";
import { ModeToggle } from "../../components/configurator/ModeToggle";
import { PresetSelector } from "../../components/configurator/PresetSelector";
import { ShadeScaleDisplay } from "../../components/configurator/ShadeScaleDisplay";
import { hexToOklch } from "../../utils/color-utils";
import { decodeThemeConfig } from "@lit-ui/cli/theme";

/**
 * URLLoader - Loads theme from URL on mount
 * Must be inside ConfiguratorProvider to access context
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
        // Keep defaults - don't break the page
      }
    }
  }, [searchParams, loadThemeConfig]);

  return null; // This component only handles side effects
}

/**
 * ConfiguratorSidebar - Sidebar controls for the configurator
 * Must be used within ConfiguratorProvider to access context
 */
function ConfiguratorSidebar() {
  const {
    activeMode,
    lightColors,
    setLightColor,
    setDarkColor,
  } = useConfigurator();
  const [lastColorKey, setLastColorKey] = useState<ColorKey>("primary");

  // Handle Tailwind swatch selection - applies to last selected color
  const handleSwatchSelect = (hex: string) => {
    const oklch = hexToOklch(hex);
    if (activeMode === "light") {
      setLightColor(lastColorKey, oklch);
    } else {
      setDarkColor(lastColorKey, oklch);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <ModeToggle />

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Preset Themes */}
      <PresetSelector />

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Brand Colors Section */}
      <ColorSection title="Brand Colors">
        <div onClick={() => setLastColorKey("primary")}>
          <ColorPickerGroup colorKey="primary" label="Primary" />
        </div>
        {/* Primary shade scale */}
        <ShadeScaleDisplay baseColor={lightColors.primary} label="Primary Shades" />
        <div onClick={() => setLastColorKey("secondary")}>
          <ColorPickerGroup colorKey="secondary" label="Secondary" />
        </div>
        <div onClick={() => setLastColorKey("destructive")}>
          <ColorPickerGroup colorKey="destructive" label="Destructive" />
        </div>
      </ColorSection>

      {/* Surface Colors Section */}
      <ColorSection title="Surface Colors">
        <div onClick={() => setLastColorKey("background")}>
          <ColorPickerGroup colorKey="background" label="Background" />
        </div>
        <div onClick={() => setLastColorKey("foreground")}>
          <ColorPickerGroup colorKey="foreground" label="Foreground" />
        </div>
      </ColorSection>

      {/* Utility Colors Section */}
      <ColorSection title="Utility Colors">
        <div onClick={() => setLastColorKey("muted")}>
          <ColorPickerGroup colorKey="muted" label="Muted" />
        </div>
      </ColorSection>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Tailwind Swatches */}
      <TailwindSwatches onSelect={handleSwatchSelect} />

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Radius Selector */}
      <RadiusSelector />
    </div>
  );
}

/**
 * ConfiguratorPageContent - Inner content that uses context
 */
function ConfiguratorPageContent() {
  const [commandModalOpen, setCommandModalOpen] = useState(false);

  return (
    <>
      <URLLoader />
      <ConfiguratorLayout
        sidebar={<ConfiguratorSidebar />}
        preview={<ThemePreview />}
        onGetCommand={() => setCommandModalOpen(true)}
      />
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
      <ConfiguratorPageContent />
    </ConfiguratorProvider>
  );
}

export default ConfiguratorPage;
