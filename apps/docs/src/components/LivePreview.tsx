/**
 * LivePreview component for rendering live web components in documentation
 *
 * Imports the ui-button component to register it as a custom element,
 * then renders it in a styled preview container.
 */

// Side-effect import to register the custom elements from built library
import 'lit-ui';

// TypeScript JSX declaration for ui-button
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ui-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
          size?: 'sm' | 'md' | 'lg';
          loading?: boolean;
          disabled?: boolean;
          'btn-class'?: string;
        },
        HTMLElement
      >;
    }
  }
}

export function LivePreview() {
  return (
    <div className="p-6 bg-gray-50 rounded-lg mt-4">
      <p className="text-sm text-gray-600 mb-4">Result:</p>
      <ui-button variant="primary">Click me</ui-button>
    </div>
  );
}
