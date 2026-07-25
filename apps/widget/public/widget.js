/* global document, window */
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) {
    var scripts = document.querySelectorAll('script[src*="widget.js"]');
    script = scripts[scripts.length - 1];
  }

  if (!script) {
    console.error("[Helora] Could not locate the widget script element.");
    return;
  }

  var organizationId = (script.dataset.orgId || "").trim();
  if (!organizationId || organizationId.length > 200) {
    console.error("[Helora] A valid data-org-id is required.");
    return;
  }

  if (document.getElementById("helora-widget-root")) {
    console.warn("[Helora] The widget is already installed on this page.");
    return;
  }

  var widgetUrl;
  try {
    widgetUrl = new URL(script.dataset.widgetUrl || script.src).origin;
  } catch {
    console.error("[Helora] data-widget-url must be a valid URL.");
    return;
  }

  var position = script.dataset.position === "left" ? "left" : "right";
  var host = document.createElement("div");
  host.id = "helora-widget-root";
  host.setAttribute("data-position", position);
  document.body.appendChild(host);

  var shadow = host.attachShadow({ mode: "open" });
  var style = document.createElement("style");
  style.textContent = [
    ":host{all:initial}",
    '.root{position:fixed;right:20px;bottom:20px;z-index:2147483000;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
    ".root.left{right:auto;left:20px}",
    ".launcher{width:58px;height:58px;padding:0;border:1px solid rgba(255,255,255,.18);border-radius:18px;background:#0b0a12;box-shadow:0 18px 45px rgba(15,23,42,.28);cursor:pointer;display:grid;place-items:center;transition:transform .2s ease,box-shadow .2s ease}",
    ".launcher:hover{transform:translateY(-2px);box-shadow:0 22px 55px rgba(15,23,42,.34)}",
    ".launcher:focus-visible{outline:3px solid #67e8f9;outline-offset:3px}",
    ".launcher img{width:42px;height:42px;display:block}",
    ".panel{position:absolute;right:0;bottom:72px;width:min(400px,calc(100vw - 40px));height:min(680px,calc(100dvh - 112px));overflow:hidden;border:1px solid rgba(15,23,42,.14);border-radius:16px;background:#fff;box-shadow:0 28px 80px rgba(15,23,42,.3);opacity:0;visibility:hidden;pointer-events:none;transform:translateY(12px) scale(.98);transform-origin:bottom right;transition:opacity .2s ease,transform .2s ease,visibility .2s ease}",
    ".left .panel{right:auto;left:0;transform-origin:bottom left}",
    ".panel.open{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0) scale(1)}",
    ".panel iframe{width:100%;height:100%;display:block;border:0;background:#fff}",
    "@media(max-width:480px){.root,.root.left{right:12px;left:12px;bottom:12px}.launcher{margin-left:auto}.root.left .launcher{margin-left:0}.panel,.left .panel{position:fixed;right:12px;left:12px;bottom:82px;width:auto;height:min(680px,calc(100dvh - 100px));transform-origin:bottom center}}",
    "@media(prefers-reduced-motion:reduce){.launcher,.panel{transition:none}}",
  ].join("");

  var root = document.createElement("div");
  root.className = position === "left" ? "root left" : "root";

  var panel = document.createElement("div");
  panel.className = "panel";
  panel.id = "helora-widget-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Helora customer support");

  var frame = document.createElement("iframe");
  var frameUrl = new URL(widgetUrl);
  frameUrl.searchParams.set("organizationId", organizationId);
  frame.src = frameUrl.toString();
  frame.title = "Helora customer support";
  frame.allow = "microphone";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.loading = "lazy";
  panel.appendChild(frame);

  var launcher = document.createElement("button");
  launcher.className = "launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-controls", panel.id);
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-label", "Open Helora customer support");

  var logo = document.createElement("img");
  logo.src = new URL("/logo.svg", widgetUrl).toString();
  logo.alt = "";
  logo.setAttribute("aria-hidden", "true");
  launcher.appendChild(logo);

  root.appendChild(panel);
  root.appendChild(launcher);
  shadow.appendChild(style);
  shadow.appendChild(root);

  var isOpen = false;
  var setOpen = function (nextOpen) {
    isOpen = Boolean(nextOpen);
    panel.classList.toggle("open", isOpen);
    launcher.setAttribute("aria-expanded", String(isOpen));
    launcher.setAttribute(
      "aria-label",
      isOpen ? "Close Helora customer support" : "Open Helora customer support"
    );
    if (isOpen) {
      frame.loading = "eager";
      window.setTimeout(function () {
        frame.focus();
      }, 220);
    } else {
      launcher.focus();
    }
  };

  var toggle = function () {
    setOpen(!isOpen);
  };
  var onKeyDown = function (event) {
    if (event.key === "Escape" && isOpen) {
      setOpen(false);
    }
  };
  var onMessage = function (event) {
    if (event.origin !== widgetUrl || !event.data) {
      return;
    }
    if (event.data.type === "helora:close") {
      setOpen(false);
    }
  };

  launcher.addEventListener("click", toggle);
  document.addEventListener("keydown", onKeyDown);
  window.addEventListener("message", onMessage);

  window.HeloraWidget = {
    close: function () {
      setOpen(false);
    },
    destroy: function () {
      launcher.removeEventListener("click", toggle);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("message", onMessage);
      host.remove();
      delete window.HeloraWidget;
    },
    open: function () {
      setOpen(true);
    },
    toggle: toggle,
  };

  if (script.dataset.open === "true") {
    setOpen(true);
  }
})();
