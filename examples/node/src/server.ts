// Express SSR server for @lit-ui components
// This demonstrates server-side rendering with Declarative Shadow DOM

import express from 'express';
import { renderToString, html } from '@lit-ui/ssr';

// Register components on the server
// Components must be imported so their templates are available to SSR
import '@lit-ui/button';
import '@lit-ui/dialog';

const app = express();
const PORT = 3000;

// Serve static files (client bundle) from public directory
app.use(express.static('public'));

// SSR route - renders components on the server
app.get('/', async (_req, res) => {
  // Render Lit components to HTML with Declarative Shadow DOM
  // The html template tag enables SSR-aware rendering
  const content = await renderToString(html`
    <div class="demo">
      <h1>@lit-ui SSR Demo</h1>
      <p>These components were server-side rendered with Declarative Shadow DOM.</p>

      <!-- Button with custom property override -->
      <lui-button
        id="demo-button"
        variant="primary"
        style="--ui-button-radius: 12px;"
      >
        Click Me
      </lui-button>

      <!-- Dialog with slots -->
      <lui-dialog id="demo-dialog">
        <span slot="title">Hello from SSR</span>
        <p>This dialog was rendered on the server and hydrated on the client.</p>
        <div slot="footer">
          <lui-button id="close-dialog" variant="secondary">Close</lui-button>
        </div>
      </lui-dialog>

      <lui-button id="open-dialog" variant="secondary">
        Open Dialog
      </lui-button>
    </div>
  `);

  // Send complete HTML document
  // The client.js script handles hydration after page load
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@lit-ui Node.js SSR Example</title>
  <script type="module" src="/client.js"></script>
  <style>
    body {
      font-family: system-ui, sans-serif;
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
    }
    .demo {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Open in browser to see SSR components with hydration');
});
