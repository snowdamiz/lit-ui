/**
 * JSX type declarations for Lit UI components used in React.
 * Each package exports its own JSX IntrinsicElements via the /jsx subpath.
 */

import '@lit-ui/button/jsx'
import '@lit-ui/dialog/jsx'
import '@lit-ui/tabs/jsx'
import '@lit-ui/input/jsx'
import '@lit-ui/select/jsx'
import '@lit-ui/switch/jsx'
import '@lit-ui/checkbox/jsx'
import '@lit-ui/accordion/jsx'
import '@lit-ui/tooltip/jsx'

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

export {}
