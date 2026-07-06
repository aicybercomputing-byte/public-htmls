(function () {
  "use strict";

  function normalizePreviewPath(raw) {
    const decoded = decodeURIComponent(String(raw || "")).trim();
    if (!decoded) return null;
    if (decoded.includes("..") || decoded.startsWith("/") || /^[a-z]+:/i.test(decoded)) {
      return null;
    }
    return decoded;
  }

  function directoryFor(filePath) {
    const slash = filePath.lastIndexOf("/");
    return slash === -1 ? "" : filePath.slice(0, slash + 1);
  }

  function injectBaseHref(html, filePath) {
    const baseUrl = new URL(directoryFor(filePath), location.href).href;
    const tag = `<base href="${baseUrl}">`;
    if (/<head[\s>]/i.test(html)) {
      return html.replace(/<head(\s[^>]*)?>/i, (match) => match + tag);
    }
    return tag + html;
  }

  async function fetchPageHtml(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error("HTTP " + response.status + " loading " + filePath);
    }
    return injectBaseHref(await response.text(), filePath);
  }

  async function loadIntoIframe(iframe, filePath) {
    iframe.removeAttribute("src");
    iframe.srcdoc = await fetchPageHtml(filePath);
  }

  function previewUrl(filePath) {
    return "preview.html?f=" + encodeURIComponent(filePath);
  }

  async function loadLazyPreviews(root) {
    const scope = root || document;
    const frames = scope.querySelectorAll("iframe[data-preview-src]:not([data-preview-loaded])");
    await Promise.all(
      Array.from(frames).map(async (iframe) => {
        const filePath = normalizePreviewPath(iframe.getAttribute("data-preview-src"));
        if (!filePath) return;
        try {
          await loadIntoIframe(iframe, filePath);
          iframe.setAttribute("data-preview-loaded", "true");
        } catch (error) {
          iframe.srcdoc =
            "<p style='font:14px sans-serif;padding:16px;color:#9a3b2e'>Preview failed: " +
            String(error.message).replace(/</g, "&lt;") +
            "</p>";
        }
      })
    );
  }

  function bindPreviewDetails(root) {
    const scope = root || document;
    scope.querySelectorAll("details").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        loadLazyPreviews(details);
      });
    });
  }

  window.AssetPreview = {
    normalizePreviewPath,
    injectBaseHref,
    fetchPageHtml,
    loadIntoIframe,
    previewUrl,
    loadLazyPreviews,
    bindPreviewDetails,
  };
})();
