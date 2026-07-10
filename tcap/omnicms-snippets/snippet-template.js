/* ==========================================================================
   Snippet component template — behaviors
   Generic, data-attribute-driven interactions for snippet-template.css
   components. See NAMING-CONVENTIONS.md for the full behavior contract and
   CATALOG.md for copy-pasteable markup that already wires these up.

   Everything here auto-initializes on DOMContentLoaded by scanning for its
   own data-attributes, so including this file is enough — no per-page JS
   authoring needed for the common cases (roving hover/active state, an
   info panel driven by hover, a multi-screen panel flow, inline form
   validation). Submission itself (the network call) is deliberately left
   to the page author — see initForms() below.
   ========================================================================== */
(function () {
  "use strict";

  /* -------------------------------------------------------------------
     Active groups — [data-snip-active-group] wraps [data-snip-active-item]
     children. Hovering (or tapping, on touch) an item marks it `.is-active`
     and clears any other item in the group; hovering away clears it.
     If the group also carries [data-snip-info-target="#id"], each item's
     `data-info` text is written into that target element on activate, and
     the target's original text is restored when nothing is active.
     Powers both the stage-card "which step am I on" pattern and the
     timeline/pathway "hover for details" pattern from one code path.
     ------------------------------------------------------------------- */
  function initActiveGroups() {
    document.querySelectorAll("[data-snip-active-group]").forEach(function (group) {
      var items = Array.from(group.querySelectorAll("[data-snip-active-item]"));
      if (!items.length) return;

      var targetSelector = group.getAttribute("data-snip-info-target");
      var target = targetSelector ? document.querySelector(targetSelector) : null;
      var defaultText = target ? target.textContent : "";

      function setActive(item) {
        items.forEach(function (i) { i.classList.remove("is-active"); });
        if (item) item.classList.add("is-active");
        if (target) target.textContent = item && item.dataset.info ? item.dataset.info : defaultText;
      }

      items.forEach(function (item) {
        item.addEventListener("mouseenter", function () { setActive(item); });
        item.addEventListener("mouseleave", function () { setActive(null); });
        item.addEventListener("click", function () { setActive(item); });
        item.addEventListener("touchstart", function () { setActive(item); }, { passive: true });
      });
    });
  }

  /* -------------------------------------------------------------------
     Panel flow — [data-snip-panel] wraps one or more [data-snip-screen="x"]
     sections. [data-snip-go="x"] buttons switch to screen "x" (`.is-hidden`
     toggles on every other screen); [data-snip-reset] buttons reset every
     form in the panel and return to the initial screen (the first screen
     present, or [data-snip-initial="x"] on the panel root if set).
     Powers the choose → form → success flow from the info-request panel.
     ------------------------------------------------------------------- */
  function initPanels() {
    document.querySelectorAll("[data-snip-panel]").forEach(function (panel) {
      var screens = Array.from(panel.querySelectorAll("[data-snip-screen]"));
      if (!screens.length) return;
      var initial = panel.getAttribute("data-snip-initial") || screens[0].getAttribute("data-snip-screen");

      function show(name) {
        screens.forEach(function (screen) {
          screen.classList.toggle("is-hidden", screen.getAttribute("data-snip-screen") !== name);
        });
      }

      panel.querySelectorAll("[data-snip-go]").forEach(function (btn) {
        btn.addEventListener("click", function () { show(btn.getAttribute("data-snip-go")); });
      });

      panel.querySelectorAll("[data-snip-reset]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          panel.querySelectorAll("form").forEach(function (form) {
            form.reset();
            clearFormErrors(form);
          });
          show(initial);
        });
      });

      show(initial);
    });
  }

  /* -------------------------------------------------------------------
     Form validation — <form data-snip-validate novalidate> uses the
     browser's own constraint validation (`required`, `type="email"`,
     `pattern`, etc. on each .snip-input) instead of reimplementing field
     rules in JS. The `novalidate` attribute is REQUIRED alongside
     data-snip-validate: without it, the browser's native validation UI
     intercepts the submit event before this script ever sees it (fields
     still get focused, but no `.snip-field__error` text or `snip:validated`
     event happens — checkValidity() below is what surfaces the same rules
     through this library's own error UI instead). Errors
     render into `.snip-field__error[data-snip-error-for="<name>"]` (falls
     back to the nearest following `.snip-field__error` if none is tagged)
     and `.snip-input--invalid` is added to the offending field.

     A field named via [data-snip-honeypot] is a bot trap: if it has any
     value, the form is treated as valid but flagged `honeypot: true` in
     the emitted event so the caller can no-op instead of actually
     submitting.

     This module does NOT perform the network submission — that's
     business-specific (endpoint, payload shape, redirect). On a valid
     submit it dispatches a `snip:validated` CustomEvent on the form with
     `detail = { data, honeypot }`; listen for that to send the request:

       form.addEventListener('snip:validated', function (e) {
         if (e.detail.honeypot) return; // silently treat as success
         fetch(url, { method: 'POST', body: JSON.stringify(e.detail.data) })
           .then(...).catch(function () { Snip.setBanner(form, 'message'); });
       });
     ------------------------------------------------------------------- */
  function clearFormErrors(form) {
    form.querySelectorAll(".snip-input--invalid").forEach(function (el) {
      el.classList.remove("snip-input--invalid");
    });
    form.querySelectorAll(".snip-field__error").forEach(function (el) {
      el.textContent = "";
    });
    setBanner(form, "");
  }

  function errorElFor(field) {
    var name = field.getAttribute("name");
    var tagged = name && field.closest("form").querySelector('.snip-field__error[data-snip-error-for="' + name + '"]');
    if (tagged) return tagged;
    var wrap = field.closest(".snip-field, .snip-field--tight");
    return wrap ? wrap.querySelector(".snip-field__error") : null;
  }

  function setBanner(form, message) {
    var banner = form.querySelector(".snip-banner--error");
    if (!banner) return;
    banner.textContent = message || "";
    banner.style.display = message ? "" : "none";
  }

  function setSubmitting(form, isSubmitting) {
    var btn = form.querySelector('.snip-btn--primary, [type="submit"]');
    if (btn) btn.disabled = !!isSubmitting;
    form.classList.toggle("is-loading", !!isSubmitting);
  }

  function initForms() {
    document.querySelectorAll("form[data-snip-validate]").forEach(function (form) {
      form.addEventListener("input", function (e) {
        if (e.target && e.target.classList.contains("snip-input")) {
          e.target.classList.remove("snip-input--invalid");
          var errEl = errorElFor(e.target);
          if (errEl) errEl.textContent = "";
        }
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearFormErrors(form);

        var honeypotField = form.querySelector("[data-snip-honeypot]");
        var isHoneypot = !!(honeypotField && honeypotField.value.trim());

        var fields = Array.from(form.querySelectorAll(".snip-input"));
        var firstInvalid = null;
        var valid = true;

        if (!isHoneypot) {
          fields.forEach(function (field) {
            if (field.checkValidity()) return;
            valid = false;
            field.classList.add("snip-input--invalid");
            var errEl = errorElFor(field);
            if (errEl) errEl.textContent = field.validationMessage;
            if (!firstInvalid) firstInvalid = field;
          });
        }

        if (!valid) {
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        var data = {};
        fields.forEach(function (field) {
          if (field.name) data[field.name] = field.value;
        });

        form.dispatchEvent(new CustomEvent("snip:validated", {
          detail: { data: data, honeypot: isHoneypot }
        }));
      });
    });
  }

  function init() {
    initActiveGroups();
    initPanels();
    initForms();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.Snip = { setBanner: setBanner, setSubmitting: setSubmitting };
})();
