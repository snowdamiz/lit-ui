/**
 * Component Templates
 *
 * Embedded component source code for CLI installation.
 * Using Option C from planning: embed as template strings for MVP simplicity.
 */

export { BUTTON_TEMPLATE } from './button.js';
export { DIALOG_TEMPLATE } from './dialog.js';
export { INPUT_TEMPLATE } from './input.js';
export { TEXTAREA_TEMPLATE } from './textarea.js';
export { SELECT_TEMPLATE } from './select.js';
export { SWITCH_TEMPLATE } from './switch.js';
export { CHECKBOX_TEMPLATE } from './checkbox.js';
export { CHECKBOX_GROUP_TEMPLATE } from './checkbox-group.js';
export { RADIO_TEMPLATE } from './radio.js';
export { RADIO_GROUP_TEMPLATE } from './radio-group.js';
export { TOOLTIP_TEMPLATE } from './tooltip.js';
export { TOOLTIP_DELAY_GROUP_TEMPLATE } from './tooltip-delay-group.js';
export { POPOVER_TEMPLATE } from './popover.js';
export { TOAST_TYPES_TEMPLATE } from './toast-types.js';
export { TOAST_ICONS_TEMPLATE } from './toast-icons.js';
export { TOAST_STATE_TEMPLATE } from './toast-state.js';
export { TOAST_API_TEMPLATE } from './toast-api.js';
export { TOAST_ELEMENT_TEMPLATE } from './toast-element.js';
export { TOAST_TOASTER_TEMPLATE } from './toast-toaster.js';
export { ACCORDION_TEMPLATE } from './accordion.js';
export { ACCORDION_ITEM_TEMPLATE } from './accordion-item.js';
export { TABS_TEMPLATE } from './tabs.js';
export { TAB_PANEL_TEMPLATE } from './tab-panel.js';

import { BUTTON_TEMPLATE } from './button.js';
import { DIALOG_TEMPLATE } from './dialog.js';
import { INPUT_TEMPLATE } from './input.js';
import { TEXTAREA_TEMPLATE } from './textarea.js';
import { SELECT_TEMPLATE } from './select.js';
import { SWITCH_TEMPLATE } from './switch.js';
import { CHECKBOX_TEMPLATE } from './checkbox.js';
import { CHECKBOX_GROUP_TEMPLATE } from './checkbox-group.js';
import { RADIO_TEMPLATE } from './radio.js';
import { RADIO_GROUP_TEMPLATE } from './radio-group.js';
import { TOOLTIP_TEMPLATE } from './tooltip.js';
import { TOOLTIP_DELAY_GROUP_TEMPLATE } from './tooltip-delay-group.js';
import { POPOVER_TEMPLATE } from './popover.js';
import { TOAST_TYPES_TEMPLATE } from './toast-types.js';
import { TOAST_ICONS_TEMPLATE } from './toast-icons.js';
import { TOAST_STATE_TEMPLATE } from './toast-state.js';
import { TOAST_API_TEMPLATE } from './toast-api.js';
import { TOAST_ELEMENT_TEMPLATE } from './toast-element.js';
import { TOAST_TOASTER_TEMPLATE } from './toast-toaster.js';
import { ACCORDION_TEMPLATE } from './accordion.js';
import { ACCORDION_ITEM_TEMPLATE } from './accordion-item.js';
import { TABS_TEMPLATE } from './tabs.js';
import { TAB_PANEL_TEMPLATE } from './tab-panel.js';

export const COMPONENT_TEMPLATES: Record<string, string> = {
  button: BUTTON_TEMPLATE,
  dialog: DIALOG_TEMPLATE,
  input: INPUT_TEMPLATE,
  textarea: TEXTAREA_TEMPLATE,
  select: SELECT_TEMPLATE,
  switch: SWITCH_TEMPLATE,
  checkbox: CHECKBOX_TEMPLATE,
  'checkbox-group': CHECKBOX_GROUP_TEMPLATE,
  radio: RADIO_TEMPLATE,
  'radio-group': RADIO_GROUP_TEMPLATE,
  tooltip: TOOLTIP_TEMPLATE,
  'tooltip/delay-group': TOOLTIP_DELAY_GROUP_TEMPLATE,
  popover: POPOVER_TEMPLATE,
  'toast/types': TOAST_TYPES_TEMPLATE,
  'toast/icons': TOAST_ICONS_TEMPLATE,
  'toast/state': TOAST_STATE_TEMPLATE,
  'toast/api': TOAST_API_TEMPLATE,
  toast: TOAST_ELEMENT_TEMPLATE,
  'toast/toaster': TOAST_TOASTER_TEMPLATE,
  accordion: ACCORDION_TEMPLATE,
  'accordion/accordion-item': ACCORDION_ITEM_TEMPLATE,
  tabs: TABS_TEMPLATE,
  'tabs/tab-panel': TAB_PANEL_TEMPLATE,
};

/**
 * Get the template for a component
 */
export function getComponentTemplate(name: string): string | undefined {
  return COMPONENT_TEMPLATES[name];
}
