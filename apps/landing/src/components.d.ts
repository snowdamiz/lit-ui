/**
 * JSX type declarations for Lit UI components used in React.
 * These augment the global JSX namespace to provide type safety.
 */

import type { Button, ButtonVariant, ButtonSize, ButtonType } from '@lit-ui/button'
import type { Dialog, DialogSize, CloseReason } from '@lit-ui/dialog'

// Augment React's intrinsic elements to support the 'slot' attribute on all elements
// This is needed for web component slot assignment
declare module 'react' {
  interface HTMLAttributes<T> {
    slot?: string
  }
  interface SVGProps<T> {
    slot?: string
  }
}

interface LuiButtonAttributes {
  variant?: ButtonVariant
  size?: ButtonSize
  type?: ButtonType
  disabled?: boolean
  loading?: boolean
  'btn-class'?: string
  onClick?: (e: MouseEvent) => void
  children?: React.ReactNode
}

interface LuiDialogAttributes {
  open?: boolean
  size?: DialogSize
  dismissible?: boolean
  'show-close-button'?: boolean
  'dialog-class'?: string
  ref?: React.Ref<Dialog>
  children?: React.ReactNode
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lui-button': React.DetailedHTMLProps<
        React.HTMLAttributes<Button> & LuiButtonAttributes,
        Button
      >
      'lui-dialog': React.DetailedHTMLProps<
        React.HTMLAttributes<Dialog> & LuiDialogAttributes,
        Dialog
      >
    }
  }
}

export {}
