/**
 * LivePreview component for rendering live web components in documentation
 *
 * Imports the lui-button component to register it as a custom element,
 * then renders it in a styled preview container.
 */

// Side-effect import to register the custom elements from built library
import '@lit-ui/button';
import '@lit-ui/checkbox';
import '@lit-ui/input';
import '@lit-ui/radio';
import '@lit-ui/select';
import '@lit-ui/switch';
import '@lit-ui/textarea';

// TypeScript JSX declaration for lui-button and lui-input
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
          size?: 'sm' | 'md' | 'lg';
          loading?: boolean;
          disabled?: boolean;
          'btn-class'?: string;
        },
        HTMLElement
      >;
      'lui-input': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          type?: 'text' | 'email' | 'password' | 'number' | 'search';
          size?: 'sm' | 'md' | 'lg';
          name?: string;
          value?: string;
          placeholder?: string;
          label?: string;
          'helper-text'?: string;
          required?: boolean;
          'required-indicator'?: 'asterisk' | 'text';
          disabled?: boolean;
          readonly?: boolean;
          minlength?: number;
          maxlength?: number;
          pattern?: string;
          min?: number;
          max?: number;
          clearable?: boolean;
          'show-count'?: boolean;
        },
        HTMLElement
      >;
      'lui-textarea': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          size?: 'sm' | 'md' | 'lg';
          name?: string;
          value?: string;
          placeholder?: string;
          label?: string;
          'helper-text'?: string;
          rows?: number;
          resize?: 'none' | 'vertical' | 'horizontal' | 'both';
          autoresize?: boolean;
          'max-rows'?: number;
          'max-height'?: string;
          required?: boolean;
          'required-indicator'?: 'asterisk' | 'text';
          disabled?: boolean;
          readonly?: boolean;
          minlength?: number;
          maxlength?: number;
          'show-count'?: boolean;
        },
        HTMLElement
      >;
      'lui-select': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          size?: 'sm' | 'md' | 'lg';
          name?: string;
          value?: string;
          placeholder?: string;
          label?: string;
          options?: Array<{ value: string; label: string; disabled?: boolean }>;
          required?: boolean;
          disabled?: boolean;
          clearable?: boolean;
          multiple?: boolean;
          maxSelections?: number;
          showSelectAll?: boolean;
          searchable?: boolean;
          creatable?: boolean;
          noResultsMessage?: string;
          onCreate?: (e: CustomEvent) => void;
        },
        HTMLElement
      >;
      'lui-option': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          label?: string;
          disabled?: boolean;
        },
        HTMLElement
      >;
      'lui-option-group': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string;
        },
        HTMLElement
      >;
      'lui-checkbox': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          checked?: boolean;
          disabled?: boolean;
          required?: boolean;
          indeterminate?: boolean;
          name?: string;
          value?: string;
          label?: string;
          size?: 'sm' | 'md' | 'lg';
        },
        HTMLElement
      >;
      'lui-checkbox-group': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string;
          disabled?: boolean;
          required?: boolean;
          error?: string;
          'select-all'?: boolean;
        },
        HTMLElement
      >;
      'lui-radio': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          checked?: boolean;
          disabled?: boolean;
          label?: string;
          size?: 'sm' | 'md' | 'lg';
        },
        HTMLElement
      >;
      'lui-radio-group': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          name?: string;
          value?: string;
          required?: boolean;
          disabled?: boolean;
          label?: string;
          error?: string;
        },
        HTMLElement
      >;
      'lui-switch': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          checked?: boolean;
          disabled?: boolean;
          required?: boolean;
          name?: string;
          value?: string;
          label?: string;
          size?: 'sm' | 'md' | 'lg';
        },
        HTMLElement
      >;
    }
  }
}

export function LivePreview() {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mt-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Result:</p>
      <lui-button variant="primary">Click me</lui-button>
    </div>
  );
}
