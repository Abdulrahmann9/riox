/* ==========================================================================
   RIOX SPOR — site scripts (vanilla JS, no dependencies)
   ========================================================================== */

var currentLang = "tr";

document.addEventListener("DOMContentLoaded", function () {
  initLanguageToggle();
  initStickyHeader();
  initMobileMenu();
  initHeroSlider();
  initCampaignGallery();
  initScrollSpy();
  initReadMore();
  initQuoteForms();
  initBackToTop();
  initFadeUpAnimations();
  initFooterYear();
  initCategoryFilter();
});

/* ---------------------------------------------------------------------- */
/* TR / EN language toggle                                                  */
/* ---------------------------------------------------------------------- */
function initLanguageToggle() {
  var STORAGE_KEY = "riox-lang";
  var trBtn = document.getElementById("lang-tr");
  var enBtn = document.getElementById("lang-en");

  function setActiveStyles(lang) {
    if (!trBtn || !enBtn) return;
    var isEn = lang === "en";
    trBtn.classList.toggle("text-white", !isEn);
    trBtn.classList.toggle("border-accent", !isEn);
    trBtn.classList.toggle("text-navy-300", isEn);
    trBtn.classList.toggle("border-transparent", isEn);
    enBtn.classList.toggle("text-white", isEn);
    enBtn.classList.toggle("border-accent", isEn);
    enBtn.classList.toggle("text-navy-300", !isEn);
    enBtn.classList.toggle("border-transparent", !isEn);
  }

  function applyLang(lang) {
    lang = lang === "en" ? "en" : "tr";
    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-tr]").forEach(function (el) {
      var text = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-tr");
      if (text != null) el.textContent = text;
    });

    document.querySelectorAll("[data-tr-html]").forEach(function (el) {
      var html = lang === "en" ? el.getAttribute("data-en-html") : el.getAttribute("data-tr-html");
      if (html != null) el.innerHTML = html;
    });

    document.querySelectorAll("[data-tr-ph]").forEach(function (el) {
      var ph = lang === "en" ? el.getAttribute("data-en-ph") : el.getAttribute("data-tr-ph");
      if (ph != null) el.setAttribute("placeholder", ph);
    });

    var metaDesc = document.getElementById("meta-description");
    if (metaDesc) {
      var descText = lang === "en" ? metaDesc.getAttribute("data-en") : metaDesc.getAttribute("data-tr");
      if (descText != null) metaDesc.setAttribute("content", descText);
    }

    setActiveStyles(lang);
    refreshReadMoreLabel();
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* localStorage unavailable (e.g. file:// in some browsers) — safe to ignore */
    }
  }

  if (trBtn) trBtn.addEventListener("click", function () { applyLang("tr"); });
  if (enBtn) enBtn.addEventListener("click", function () { applyLang("en"); });

  var saved = "tr";
  try {
    saved = localStorage.getItem(STORAGE_KEY) || "tr";
  } catch (e) {
    saved = "tr";
  }
  applyLang(saved);
}

/* ---------------------------------------------------------------------- */
/* Sticky header shadow on scroll                                          */
/* ---------------------------------------------------------------------- */
function initStickyHeader() {
  var header = document.getElementById("site-header");
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 12) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------------------------------------------------------------------- */
/* Mobile hamburger menu                                                    */
/* ---------------------------------------------------------------------- */
function initMobileMenu() {
  var toggle = document.getElementById("menu-toggle");
  var menu = document.getElementById("mobile-menu");
  var iconOpen = document.getElementById("icon-menu-open");
  var iconClose = document.getElementById("icon-menu-close");
  if (!toggle || !menu) return;

  function closeMenu() {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    if (iconOpen) iconOpen.classList.remove("hidden");
    if (iconClose) iconClose.classList.add("hidden");
  }

  toggle.addEventListener("click", function () {
    var isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (iconOpen) iconOpen.classList.toggle("hidden", isOpen);
    if (iconClose) iconClose.classList.toggle("hidden", !isOpen);
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
}

/* ---------------------------------------------------------------------- */
/* Hero slider                                                              */
/* ---------------------------------------------------------------------- */
function initHeroSlider() {
  var slider = document.getElementById("hero-slider");
  if (!slider) return;

  var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
  var dotsWrap = document.getElementById("hero-dots");
  var prevBtn = document.getElementById("hero-prev");
  var nextBtn = document.getElementById("hero-next");
  var current = 0;
  var autoplayMs = 6500;
  var timer = null;

  if (!slides.length) return;

  var dots = slides.map(function (_, i) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Slayt " + (i + 1));
    dot.addEventListener("click", function () {
      goTo(i);
      restart();
    });
    if (dotsWrap) dotsWrap.appendChild(dot);
    return dot;
  });

  function goTo(index) {
    slides[current].classList.remove("active");
    dots[current] && dots[current].classList.remove("active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current] && dots[current].classList.add("active");
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function start() {
    timer = setInterval(next, autoplayMs);
  }

  function stop() {
    if (timer) clearInterval(timer);
  }

  function restart() {
    stop();
    start();
  }

  if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
  if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  start();
}

/* ---------------------------------------------------------------------- */
/* "Okula Dönüş Koleksiyonu" horizontal gallery — prev/next scroll buttons */
/* ---------------------------------------------------------------------- */
function initCampaignGallery() {
  var track = document.getElementById("campaign-track");
  var prevBtn = document.getElementById("campaign-prev");
  var nextBtn = document.getElementById("campaign-next");
  if (!track) return;

  function scrollByCard(direction) {
    var card = track.querySelector(":scope > div");
    var step = card ? card.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  if (prevBtn) prevBtn.addEventListener("click", function () { scrollByCard(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { scrollByCard(1); });

  function updateButtonState() {
    if (!prevBtn || !nextBtn) return;
    var maxScroll = track.scrollWidth - track.clientWidth - 2;
    prevBtn.classList.toggle("opacity-40", track.scrollLeft <= 2);
    nextBtn.classList.toggle("opacity-40", track.scrollLeft >= maxScroll);
  }

  track.addEventListener("scroll", updateButtonState, { passive: true });
  updateButtonState();

  /* Allow click-and-drag panning with a mouse (not just touch/trackpad swipe) */
  var isDown = false;
  var startX = 0;
  var startScroll = 0;

  track.addEventListener("mousedown", function (e) {
    isDown = true;
    track.classList.add("cursor-grabbing");
    startX = e.pageX;
    startScroll = track.scrollLeft;
  });

  ["mouseleave", "mouseup"].forEach(function (evt) {
    track.addEventListener(evt, function () {
      isDown = false;
      track.classList.remove("cursor-grabbing");
    });
  });

  track.addEventListener("mousemove", function (e) {
    if (!isDown) return;
    e.preventDefault();
    track.scrollLeft = startScroll - (e.pageX - startX);
  });
}

/* ---------------------------------------------------------------------- */
/* Highlight active nav link based on scroll position                      */
/* ---------------------------------------------------------------------- */
function initScrollSpy() {
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  if (!sections.length || !links.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          var isMatch = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("active", isMatch);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
}

/* ---------------------------------------------------------------------- */
/* About section "Read More" toggle                                        */
/* ---------------------------------------------------------------------- */
var READ_MORE_LABELS = {
  tr: { more: "Devamını Oku", less: "Daha Az Göster" },
  en: { more: "Read More", less: "Show Less" },
};

function refreshReadMoreLabel() {
  var btn = document.getElementById("read-more-btn");
  var extra = document.getElementById("about-extra");
  if (!btn || !extra) return;
  var labels = READ_MORE_LABELS[currentLang] || READ_MORE_LABELS.tr;
  var isHidden = extra.classList.contains("hidden");
  var span = btn.querySelector("span");
  if (span) span.textContent = isHidden ? labels.more : labels.less;
}

function initReadMore() {
  var btn = document.getElementById("read-more-btn");
  var extra = document.getElementById("about-extra");
  if (!btn || !extra) return;

  btn.addEventListener("click", function () {
    var isHidden = extra.classList.toggle("hidden");
    refreshReadMoreLabel();
    var icon = btn.querySelector("svg");
    if (icon) icon.style.transform = isHidden ? "rotate(0deg)" : "rotate(180deg)";
  });
}

/* ---------------------------------------------------------------------- */
/* Quote / contact forms (no backend — front-end confirmation only)        */
/* ---------------------------------------------------------------------- */
var QUOTE_SUCCESS_MESSAGES = {
  tr: "Teşekkürler! Talebiniz alındı, en kısa sürede size dönüş yapacağız.",
  en: "Thank you! Your request has been received, we'll get back to you shortly.",
};

function initQuoteForms() {
  var forms = document.querySelectorAll("form[data-quote-form]");
  forms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      showToast(QUOTE_SUCCESS_MESSAGES[currentLang] || QUOTE_SUCCESS_MESSAGES.tr);
      form.reset();
    });
  });
}

function showToast(message) {
  var toast = document.getElementById("toast");
  if (!toast) return;
  toast.querySelector("span").textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(function () {
    toast.classList.remove("show");
  }, 4200);
}

/* ---------------------------------------------------------------------- */
/* Back to top button                                                       */
/* ---------------------------------------------------------------------- */
function initBackToTop() {
  var btn = document.getElementById("back-to-top");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    function () {
      btn.classList.toggle("show", window.scrollY > 500);
    },
    { passive: true }
  );

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------------------------------------------------------------------- */
/* Fade-up reveal animations on scroll                                     */
/* ---------------------------------------------------------------------- */
function initFadeUpAnimations() {
  var items = document.querySelectorAll(".fade-up");
  if (!items.length) return;

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach(function (item) {
    observer.observe(item);
  });
}

/* ---------------------------------------------------------------------- */
/* Footer year                                                              */
/* ---------------------------------------------------------------------- */
function initFooterYear() {
  var el = document.getElementById("current-year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------------------------------------------------------------------- */
/* Featured products category filter                                       */
/* ---------------------------------------------------------------------- */
function initCategoryFilter() {
  var buttons = document.querySelectorAll("[data-filter]");
  var cards = document.querySelectorAll("[data-category]");
  var jumpLinks = document.querySelectorAll("[data-filter-jump]");
  if (!buttons.length || !cards.length) return;

  function applyFilter(filter) {
    buttons.forEach(function (b) {
      var isMatch = b.getAttribute("data-filter") === filter;
      b.classList.toggle("bg-navy-900", isMatch);
      b.classList.toggle("text-white", isMatch);
      b.classList.toggle("bg-gray-100", !isMatch);
      b.classList.toggle("text-navy-900", !isMatch);
    });

    cards.forEach(function (card) {
      var show = filter === "all" || card.getAttribute("data-category") === filter;
      card.classList.toggle("hidden", !show);
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  jumpLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      applyFilter(link.getAttribute("data-filter-jump"));
    });
  });
}
