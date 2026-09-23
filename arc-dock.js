/* Arc hub dock.
 *
 * The site is a static Next export, so its nav lives in three tightly coupled
 * carriers (markup, RSC flight payload, JS chunk) and cannot be edited safely
 * per-page. Instead this appends its own element to <body>, giving one
 * consistent way into the loader, tracker, shop and admin pages from anywhere
 * on the site.
 *
 * This site hydrates the whole document (Next calls hydrateRoot(document, …)),
 * so two precautions matter:
 *   - attach on `load`, i.e. strictly AFTER hydration has finished, so the
 *     extra node can never take part in a hydration match;
 *   - watch the body and re-attach if a route change ever drops the node.
 */
(function () {
  if (window.__arcDock) return;
  window.__arcDock = true;

  var ITEMS = [
    { href: "/script/", label: "Loader", d: "M4 4h16v5H4zM4 13h16v7H4z" },
    { href: "/script/games/", label: "Games", d: "M4 6h16v12H4zM8 10h8M8 14h5" },
    { href: "/script/statistics/", label: "Stats", d: "M5 19V9M12 19V5M19 19v-6" },
    { href: "/shop/", label: "Shop", d: "M6 7h12l1.5 12H4.5L6 7ZM9 7a3 3 0 0 1 6 0" },
    { href: "/admin/", label: "Admin", d: "M12 3l7 4v5c0 4-3 7-7 9-4-2-7-5-7-9V7l7-4Z" },
  ];

  var CSS =
    ".arc-dock{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483000;" +
    "display:flex;align-items:center;gap:2px;padding:5px;border-radius:14px;" +
    "background:rgba(14,14,15,.82);border:1px solid rgba(255,255,255,.09);" +
    "backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);" +
    "box-shadow:0 14px 40px rgba(0,0,0,.55);" +
    "font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;" +
    // Base state IS the final state, with no entrance animation: a dock that
    // depends on the compositor ticking a frame can sit at opacity 0 forever.
    "opacity:1;transform:translate(-50%,0)}" +
    ".arc-dock a{position:relative;display:flex;align-items:center;gap:6px;padding:8px 11px;" +
    "border-radius:9px;color:#a3a3a3;text-decoration:none;font-size:12px;font-weight:560;" +
    "letter-spacing:.01em;white-space:nowrap;transition:color .16s ease,background .16s ease}" +
    ".arc-dock a:hover{color:#fff;background:rgba(255,255,255,.07)}" +
    ".arc-dock svg{width:15px;height:15px;flex:none;display:block}" +
    ".arc-dock .sep{width:1px;height:20px;margin:0 4px;background:rgba(255,255,255,.1)}" +
    ".arc-dock .mark{display:grid;place-items:center;width:26px;height:26px;margin:0 4px 0 3px;" +
    "place-items:center;border-radius:7px;background:#f0f0f0;color:#0d0d0d;font-size:11px;" +
    "font-weight:800;letter-spacing:.02em}" +
    "@media (max-width:620px){.arc-dock{gap:0;padding:4px}.arc-dock a{padding:8px 9px}" +
    ".arc-dock a span{display:none}.arc-dock .mark{margin:0 2px}}" +
    "@media (prefers-reduced-motion:reduce){.arc-dock a{transition:none}}";

  var style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  var dock = document.createElement("nav");
  dock.className = "arc-dock";
  dock.setAttribute("aria-label", "Arc hub");

  var mark = document.createElement("span");
  mark.className = "mark";
  mark.textContent = "A";
  dock.appendChild(mark);

  ITEMS.forEach(function (item) {
    var a = document.createElement("a");
    a.href = item.href;
    a.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' +
      item.d + '"/></svg><span></span>';
    a.querySelector("span").textContent = item.label;
    dock.appendChild(a);
  });

  var sep = document.createElement("span");
  sep.className = "sep";
  dock.appendChild(sep);

  var discord = document.createElement("a");
  discord.href = "https://discord.gg/8VxyzMMjfh";
  discord.target = "_blank";
  discord.rel = "noopener noreferrer";
  discord.innerHTML =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M19.6 5.6A16 16 0 0 0 15.7 4.4l-.2.4a13 13 0 0 0-7 0l-.2-.4a16 16 0 0 0-3.9 1.2C1.6 9.4 1 13.1 1.3 16.7a16 16 0 0 0 4.8 2.4l.6-1a11 11 0 0 1-1.7-.8l.4-.3a11 11 0 0 0 9.2 0l.4.3a11 11 0 0 1-1.7.8l.6 1a16 16 0 0 0 4.8-2.4c.4-4.2-.6-7.9-2.8-11.1ZM8.6 14.4c-1 0-1.7-.9-1.7-2s.8-2 1.7-2 1.7.9 1.7 2-.8 2-1.7 2Zm6.8 0c-1 0-1.7-.9-1.7-2s.8-2 1.7-2 1.7.9 1.7 2-.8 2-1.7 2Z"/></svg>' +
    '<span>Discord</span>';
  dock.appendChild(discord);

  function attach() {
    if (!dock.isConnected) document.body.appendChild(dock);
  }

  function start() {
    attach();
    // React owns <body> here, so if a re-render ever removes the dock, put it back.
    if (window.MutationObserver) {
      new MutationObserver(function () {
        if (!dock.isConnected && document.body) attach();
      }).observe(document.body, { childList: true });
    }
  }

  // `load` guarantees hydration is done; fall back if it already fired.
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
})();
