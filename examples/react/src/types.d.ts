import type { Button, Dialog } from 'lit-ui';
import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Type helper for custom elements in React JSX.
 * Picks only the public properties we need and adds React attributes.
 */
interface UIButtonProps extends HTMLAttributes<HTMLElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

interface UIDialogProps extends HTMLAttributes<HTMLElement> {
  open?: boolean;
  size?: 'sm' | 'md' | 'lg';
  dismissible?: boolean;
  'show-close-button'?: boolean;
  children?: ReactNode;
  onClose?: (event: CustomEvent<{ reason: string }>) => void;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ui-button': UIButtonProps;
      'ui-dialog': UIDialogProps;
    }
  }
}
