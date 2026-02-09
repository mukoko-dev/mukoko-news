/**
 * Mukoko News Embed Widget
 * Lightweight script (~2 KB) that converts <div data-mukoko-embed> elements
 * into live news card iframes.
 *
 * Usage:
 *   <div data-mukoko-embed
 *        data-country="ZW"
 *        data-type="top"
 *        data-layout="cards"
 *        data-limit="6"
 *        data-category="politics"
 *        data-theme="auto"
 *        data-width="400"
 *        data-height="600">
 *   </div>
 *   <script src="https://news.mukoko.com/embed/widget.js" async></script>
 */
(function () {
  "use strict";

  var BASE = "https://news.mukoko.com";

  // Sizes per layout
  var LAYOUT_DEFAULTS = {
    cards:   { width: 420, height: 600 },
    compact: { width: 360, height: 500 },
    hero:    { width: 420, height: 340 },
    ticker:  { width: 600, height: 200 },
    list:    { width: 400, height: 600 },
  };

  function init() {
    var els = document.querySelectorAll("[data-mukoko-embed]");
    for (var i = 0; i < els.length; i++) {
      mount(els[i]);
    }
  }

  function mount(el) {
    // Prevent double-init
    if (el.getAttribute("data-mukoko-mounted") === "true") return;
    el.setAttribute("data-mukoko-mounted", "true");

    var layout   = el.getAttribute("data-layout") || "cards";
    var country  = el.getAttribute("data-country") || "ZW";
    var type     = el.getAttribute("data-type") || "latest";
    var limit    = el.getAttribute("data-limit") || "";
    var category = el.getAttribute("data-category") || "";
    var theme    = el.getAttribute("data-theme") || "auto";
    var width    = el.getAttribute("data-width") || "";
    var height   = el.getAttribute("data-height") || "";

    var defaults = LAYOUT_DEFAULTS[layout] || LAYOUT_DEFAULTS.cards;
    var w = width  || defaults.width;
    var h = height || defaults.height;

    // Build iframe src
    var params = [];
    params.push("country=" + encodeURIComponent(country));
    params.push("type=" + encodeURIComponent(type));
    params.push("layout=" + encodeURIComponent(layout));
    if (limit) params.push("limit=" + encodeURIComponent(limit));
    if (category) params.push("category=" + encodeURIComponent(category));
    if (theme !== "auto") params.push("theme=" + encodeURIComponent(theme));

    var src = BASE + "/embed/iframe?" + params.join("&");

    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.width = String(w);
    iframe.height = String(h);
    iframe.style.border = "none";
    iframe.style.borderRadius = "12px";
    iframe.style.maxWidth = "100%";
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("title", country + " News — Mukoko News");
    iframe.setAttribute("allow", "clipboard-write");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox");

    el.appendChild(iframe);
  }

  // Run now if DOM ready, otherwise wait
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
