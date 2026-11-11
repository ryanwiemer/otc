// Instagram feed source. Instagram has no public feed for static sites, so the
// posts come from a free Behold.so feed (see README → "Instagram feed").
// Paste the feed URL from Behold here, e.g. "https://feeds.behold.so/AbC123xyz".
// While it's empty, the footer shows only the "Follow us on Instagram" link.
var INSTAGRAM_FEED_URL = "";
var INSTAGRAM_POST_COUNT = 12;

// True while a nav link is smooth-scrolling to its section (set further down)
var navScrolling = false;

// Header: slide up when scrolling down, slide back in when scrolling up
(function () {
  var header = document.querySelector(".site-header");
  var nav = document.getElementById("site-nav");
  if (!header) return;

  var lastY = window.scrollY;
  var ticking = false;
  var TOLERANCE = 6; // ignore tiny scroll jitters (px)

  function update() {
    var y = window.scrollY;
    var delta = y - lastY;
    var menuOpen = nav && nav.classList.contains("is-open");

    // Hold the header in place during nav-link scrolls; resume afterwards
    // from wherever the page ended up.
    if (navScrolling) {
      lastY = y;
      ticking = false;
      return;
    }

    if (y <= header.offsetHeight || menuOpen) {
      header.classList.remove("is-hidden");
    } else if (delta > TOLERANCE) {
      header.classList.add("is-hidden");
    } else if (delta < -TOLERANCE) {
      header.classList.remove("is-hidden");
    }
    if (Math.abs(delta) > TOLERANCE) lastY = y;
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Keyboard users tabbing into the header should always see it
  header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });
})();

// Mobile navigation drawer
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  var root = document.documentElement;
  // The overlay lives inside the header so it also dims the logo and header bar
  var overlay = document.createElement("div");
  overlay.className = "nav-overlay";
  document.querySelector(".site-header").appendChild(overlay);

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    root.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    // Keep keyboard and screen reader users inside the open drawer
    document.querySelectorAll("main, footer").forEach(function (el) { el.inert = open; });
    if (open) {
      var first = nav.querySelector("a");
      if (first) first.focus({ preventScroll: true });
    }
  }

  function isOpen() { return nav.classList.contains("is-open"); }

  toggle.addEventListener("click", function () { setOpen(!isOpen()); });
  overlay.addEventListener("click", function () { setOpen(false); });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
  // Close the drawer if the window grows to the desktop layout
  window.matchMedia("(min-width: 861px)").addEventListener("change", function (e) {
    if (e.matches) setOpen(false);
  });
})();

// Instagram feed (footer)
(function () {
  var section = document.querySelector(".ig-feed");
  if (!section) return;
  var track = section.querySelector(".ig-feed__track");
  var arrows = section.querySelectorAll(".ig-feed__arrow");

  function showFollowLinkOnly() {
    track.hidden = true;
    arrows.forEach(function (a) { a.hidden = true; });
    section.hidden = false;
  }

  if (!INSTAGRAM_FEED_URL) {
    showFollowLinkOnly();
    return;
  }

  fetch(INSTAGRAM_FEED_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("Feed request failed: " + res.status);
      return res.json();
    })
    .then(function (data) {
      var posts = (Array.isArray(data) ? data : data.posts || []).slice(0, INSTAGRAM_POST_COUNT);
      if (!posts.length) return showFollowLinkOnly();

      posts.forEach(function (post) {
        var sizes = post.sizes || {};
        var src = (sizes.medium && sizes.medium.mediaUrl) ||
          post.thumbnailUrl || post.mediaUrl;
        if (!src) return;

        var link = document.createElement("a");
        link.className = "ig-feed__item";
        link.href = post.permalink || "https://www.instagram.com/oaklandtrackclub";
        link.target = "_blank";
        link.rel = "noopener";

        var img = document.createElement("img");
        img.src = src;
        img.alt = (post.prunedCaption || post.caption || "Instagram post").slice(0, 120);
        img.loading = "lazy";

        link.appendChild(img);
        track.appendChild(link);
      });

      section.hidden = false;

      section.querySelector(".ig-feed__arrow--prev").addEventListener("click", function () {
        track.scrollBy({ left: -track.clientWidth, behavior: "smooth" });
      });
      section.querySelector(".ig-feed__arrow--next").addEventListener("click", function () {
        track.scrollBy({ left: track.clientWidth, behavior: "smooth" });
      });
    })
    .catch(function (err) {
      console.warn(err);
      showFollowLinkOnly();
    });
})();

// Photo gallery lightbox (home page)
(function () {
  var gallery = document.querySelector(".gallery");
  var dialog = document.querySelector(".lightbox");
  if (!gallery || !dialog || typeof dialog.showModal !== "function") return;

  var buttons = Array.prototype.slice.call(gallery.querySelectorAll("button"));
  var img = dialog.querySelector("img");
  var current = 0;

  function show(i) {
    current = (i + buttons.length) % buttons.length;
    img.src = buttons[current].querySelector("img").getAttribute("src");
    img.alt = buttons[current].dataset.alt || "";
  }

  buttons.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      show(i);
      dialog.showModal();
    });
  });

  dialog.querySelector(".lightbox__close").addEventListener("click", function () { dialog.close(); });
  dialog.querySelector(".lightbox__nav--prev").addEventListener("click", function () { show(current - 1); });
  dialog.querySelector(".lightbox__nav--next").addEventListener("click", function () { show(current + 1); });
  dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
})();

// In-page navigation: one smooth scroll straight to the section.
// Image sizes are reserved in the HTML, so the target doesn't move mid-scroll.
// The header stays visible for the whole scroll (sections are offset for it),
// and the nav highlight jumps to the clicked link instead of flickering
// through every section passed on the way.
(function () {
  var header = document.querySelector(".site-header");
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
  var sections = links.map(function (a) {
    return { a: a, el: document.getElementById(a.getAttribute("href").slice(1)) };
  }).filter(function (s) { return s.el && s.a.getAttribute("href") !== "#top"; });
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var settleTimer, safetyTimer, targetTop = 0, ticking = false;

  function setActive(link) {
    links.forEach(function (a) {
      if (a === link) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  function updateActive() {
    ticking = false;
    if (navScrolling || !sections.length) return;
    var probe = window.innerHeight * 0.35;
    var active = null;
    sections.forEach(function (s) {
      if (s.el.getBoundingClientRect().top <= probe) active = s.a;
    });
    setActive(active);
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateActive);
    }
  }

  function finish() {
    clearTimeout(settleTimer);
    clearTimeout(safetyTimer);
    window.removeEventListener("scroll", onNavScroll);
    navScrolling = false;
    requestUpdate();
  }

  // Finished once the page reaches the target, or has stopped moving for a
  // moment (e.g. the visitor grabbed the scroll mid-way). scrollend isn't
  // available in every browser yet, so this is detected by hand.
  function onNavScroll() {
    clearTimeout(settleTimer);
    if (Math.abs(window.scrollY - targetTop) < 2) return finish();
    settleTimer = setTimeout(finish, 200);
  }

  function scrollToTarget(el, link) {
    var offset = el === document.body ? 0 : (header ? header.offsetHeight : 0);
    var top = el === document.body ? 0 :
      el.getBoundingClientRect().top + window.scrollY - offset;
    top = Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));

    if (Math.abs(top - window.scrollY) < 2) return finishFocus(el);

    navScrolling = true;
    if (header) header.classList.remove("is-hidden");
    setActive(link && link.closest(".site-nav") && el !== document.body ? link : null);

    targetTop = top;
    window.addEventListener("scroll", onNavScroll, { passive: true });
    clearTimeout(settleTimer);
    clearTimeout(safetyTimer);
    // Fallback in case the browser never scrolls (long jumps can take ~2s)
    safetyTimer = setTimeout(finish, 4000);
    window.scrollTo({ top: top, behavior: reduceMotion.matches ? "auto" : "smooth" });
    finishFocus(el);
  }

  // Move keyboard focus to the section, like a normal anchor jump would
  function finishFocus(el) {
    if (el === document.body) return;
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    var el = id ? document.getElementById(id) : null;
    if (!el) return;
    e.preventDefault();
    if (location.hash !== "#" + id) history.pushState(null, "", "#" + id);
    scrollToTarget(el, a);
  });

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  updateActive();
})();
