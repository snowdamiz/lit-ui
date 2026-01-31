export {
  parseDateInput,
  formatDateForDisplay,
  getPlaceholderText,
} from './date-input-parser.js';

export { DatePicker } from './date-picker.js';

import { DatePicker } from './date-picker.js';

// Import calendar to ensure it's registered when date-picker is used
import '@lit-ui/calendar';

customElements.define('lui-date-picker', DatePicker);
