import { BASE_URL } from "@/lib/constants";

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl bg-surface p-4">
      <pre className="overflow-x-auto text-sm">
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  );
}

export default function EmbedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading text-3xl font-bold">
        Embed News Widgets
      </h1>
      <p className="mt-4 text-text-secondary">
        Add live Zimbabwe news to any website or app. Embed a scrollable news
        feed — free, no API key required.
      </p>

      {/* iframe Embed */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">iframe Embed</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Drop this into any HTML page, CMS, or app. The widget auto-refreshes
          every 5 minutes and links open in a new tab.
        </p>
        <CodeBlock>{`<iframe
  src="${BASE_URL}/embed/iframe"
  width="400"
  height="600"
  frameborder="0"
  title="Zimbabwe News — Mukoko News"
  style="border-radius: 12px; border: 1px solid #e5e5e5;"
></iframe>`}</CodeBlock>
      </section>

      {/* Responsive Embed */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Responsive Embed</h2>
        <p className="mt-2 text-sm text-text-secondary">
          For full-width layouts, wrap the iframe in a container and use
          percentage width.
        </p>
        <CodeBlock>{`<div style="max-width: 480px; width: 100%;">
  <iframe
    src="${BASE_URL}/embed/iframe"
    width="100%"
    height="600"
    frameborder="0"
    title="Zimbabwe News — Mukoko News"
    style="border-radius: 12px; border: 1px solid #e5e5e5;"
  ></iframe>
</div>`}</CodeBlock>
      </section>

      {/* Live Preview */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Live Preview</h2>
        <p className="mt-2 text-sm text-text-secondary">
          This is how the embed looks in practice.
        </p>
        <div className="mt-4 flex justify-center">
          <iframe
            src={`${BASE_URL}/embed/iframe`}
            width="400"
            height="600"
            title="Zimbabwe News — Mukoko News"
            className="rounded-2xl border border-border"
          />
        </div>
      </section>

      {/* Configuration */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Configuration</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-4 font-semibold">Attribute</th>
                <th className="pb-2 pr-4 font-semibold">Default</th>
                <th className="pb-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs">width</td>
                <td className="py-2 pr-4">400</td>
                <td className="py-2">
                  Widget width in pixels or percentage
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs">height</td>
                <td className="py-2 pr-4">600</td>
                <td className="py-2">
                  Widget height in pixels (min 400 recommended)
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-xs">frameborder</td>
                <td className="py-2 pr-4">0</td>
                <td className="py-2">Set to 0 for a clean look</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Features */}
      <section className="mt-10 mb-10">
        <h2 className="text-xl font-semibold">Features</h2>
        <ul className="mt-4 space-y-2 text-sm text-text-secondary list-disc pl-5">
          <li>Live Zimbabwe news from multiple sources</li>
          <li>Auto-refreshes every 5 minutes</li>
          <li>Article thumbnails and source attribution</li>
          <li>Respects system dark/light theme</li>
          <li>Links open in a new tab (won&apos;t navigate away from your page)</li>
          <li>Lightweight — under 4 kB</li>
        </ul>
      </section>
    </div>
  );
}
