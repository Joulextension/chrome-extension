(function () {
  var DEFAULT_STATE = "signedOut";
  var STATE_KEY = "stgWebsiteMockState";
  var VALID_STATES = [
    "signedOut",
    "signedInFree",
    "signedInPremiumYearly",
    "signedInPremiumLifetime"
  ];

  var MOCK_ACCOUNTS = {
    signedOut: {
      isAuthenticated: false,
      email: null,
      plan: "Free",
      badge: "Free",
      badgeClass: "badge-free",
      planCode: "free",
      renewsOn: null,
      billingStatus: "Not subscribed",
      seatSummary: "Single browser profile",
      portalHint: "Billing portal becomes available after a paid upgrade.",
      statusMessage: "Signed out. Use the mock controls below to preview account states."
    },
    signedInFree: {
      isAuthenticated: true,
      email: "alex@smarttabgrouper.app",
      plan: "Free",
      badge: "Free",
      badgeClass: "badge-free",
      planCode: "free",
      renewsOn: null,
      billingStatus: "No active subscription",
      seatSummary: "Free features only",
      portalHint: "Upgrade to unlock premium syncing and billing controls.",
      statusMessage: "Signed in on the free tier."
    },
    signedInPremiumYearly: {
      isAuthenticated: true,
      email: "alex@smarttabgrouper.app",
      plan: "Premium Yearly",
      badge: "Premium",
      badgeClass: "badge-premium",
      planCode: "premium-yearly",
      renewsOn: "12 Mar 2027",
      billingStatus: "Active yearly subscription",
      seatSummary: "Premium features enabled",
      portalHint: "Manage renewal details, payment method and invoices in the Stripe portal.",
      statusMessage: "Premium Yearly is active. Renewal details are mocked for now."
    },
    signedInPremiumLifetime: {
      isAuthenticated: true,
      email: "alex@smarttabgrouper.app",
      plan: "Premium Lifetime",
      badge: "Premium",
      badgeClass: "badge-premium",
      planCode: "premium-lifetime",
      renewsOn: "Lifetime access",
      billingStatus: "One-time purchase complete",
      seatSummary: "Premium features enabled",
      portalHint: "Lifetime purchases would still use the billing portal for invoices and receipts.",
      statusMessage: "Premium Lifetime is active. Purchase metadata is mocked for now."
    }
  };

  function getPage() {
    return document.body.getAttribute("data-page") || "";
  }

  function getQueryState() {
    var params = new URLSearchParams(window.location.search);
    return params.get("state");
  }

  function normalizeState(state) {
    return VALID_STATES.indexOf(state) >= 0 ? state : DEFAULT_STATE;
  }

  function getState() {
    return normalizeState(getQueryState() || window.localStorage.getItem(STATE_KEY) || DEFAULT_STATE);
  }

  function setState(state) {
    var normalized = normalizeState(state);
    window.localStorage.setItem(STATE_KEY, normalized);
    return normalized;
  }

  function mockDelay(payload) {
    return new Promise(function (resolve) {
      window.setTimeout(function () {
        resolve(payload);
      }, 220);
    });
  }

  function getBasePath() {
    return "./";
  }

  function buildHeader() {
    var page = getPage();
    var links = [
      { href: "index.html", label: "Overview", key: "index" },
      { href: "account.html", label: "Account", key: "account" },
      { href: "billing.html", label: "Billing", key: "billing" },
      { href: "support.html", label: "Support", key: "support" }
    ];

    var nav = links
      .map(function (link) {
        var active = page === link.key ? " is-active" : "";
        return '<a class="nav-link' + active + '" href="' + getBasePath() + link.href + '">' + link.label + "</a>";
      })
      .join("");

    return (
      '<header class="site-header">' +
        '<a class="brand" href="' + getBasePath() + 'index.html" aria-label="Smart Tab Grouper website">' +
          '<span class="brand-mark" aria-hidden="true"></span>' +
          '<span>Smart Tab Grouper</span>' +
        "</a>" +
        '<nav class="nav" aria-label="Primary">' + nav + "</nav>" +
        '<div class="header-actions">' +
          '<a class="button button-secondary" href="' + getBasePath() + 'account.html">Open account</a>' +
          '<a class="button button-primary" href="' + getBasePath() + 'billing.html">Upgrade to Premium</a>' +
        "</div>" +
      "</header>"
    );
  }

  function buildFooter() {
    return (
      '<footer class="site-footer">' +
        "<div>Smart Tab Grouper account surface for GitHub Pages deployment.</div>" +
        '<div class="footer-links">' +
          '<a href="' + getBasePath() + 'privacy.html">Privacy</a>' +
          '<a href="' + getBasePath() + 'terms.html">Terms</a>' +
          '<a href="' + getBasePath() + 'support.html">Support</a>' +
        "</div>" +
      "</footer>"
    );
  }

  function renderShell() {
    var headerTarget = document.querySelector("[data-site-header]");
    var footerTarget = document.querySelector("[data-site-footer]");

    if (headerTarget) {
      headerTarget.innerHTML = buildHeader();
    }

    if (footerTarget) {
      footerTarget.innerHTML = buildFooter();
    }
  }

  function updateStateChips(activeState) {
    document.querySelectorAll("[data-state-chip]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-state-chip") === activeState);
    });
  }

  function updateText(selector, value) {
    document.querySelectorAll(selector).forEach(function (node) {
      node.textContent = value == null ? "-" : value;
    });
  }

  function updateBadge(selector, label, className) {
    document.querySelectorAll(selector).forEach(function (node) {
      node.textContent = label;
      node.className = "badge " + className;
    });
  }

  function updateVisibility(selector, shouldShow) {
    document.querySelectorAll(selector).forEach(function (node) {
      node.classList.toggle("hidden", !shouldShow);
    });
  }

  function applyAccountState(account) {
    updateText("[data-account-email]", account.email || "Not signed in");
    updateText("[data-account-plan]", account.plan);
    updateText("[data-account-status]", account.billingStatus);
    updateText("[data-account-renews]", account.renewsOn || "No renewal");
    updateText("[data-account-seat]", account.seatSummary);
    updateText("[data-account-hint]", account.portalHint);
    updateText("[data-account-message]", account.statusMessage);
    updateBadge("[data-account-badge]", account.badge, account.badgeClass);
    updateVisibility("[data-signed-in-only]", account.isAuthenticated);
    updateVisibility("[data-signed-out-only]", !account.isAuthenticated);
    updateVisibility("[data-premium-only]", account.planCode !== "free");
  }

  function applyBillingState(account) {
    updateText("[data-billing-email]", account.email || "No active user");
    updateText("[data-billing-plan]", account.plan);
    updateText("[data-billing-status]", account.billingStatus);
    updateText("[data-billing-renews]", account.renewsOn || "No renewal");
    updateText("[data-billing-hint]", account.portalHint);
    updateBadge("[data-billing-badge]", account.badge, account.badgeClass);
    updateVisibility("[data-billing-premium-only]", account.planCode !== "free");
    updateVisibility("[data-billing-signed-in-only]", account.isAuthenticated);
  }

  function renderStateFromStorage() {
    var currentState = getState();
    updateStateChips(currentState);
    return fetchAccount().then(function (account) {
      applyAccountState(account);
      applyBillingState(account);
      return account;
    });
  }

  function bindStateChips() {
    document.querySelectorAll("[data-state-chip]").forEach(function (button) {
      button.addEventListener("click", function () {
        setState(button.getAttribute("data-state-chip"));
        renderStateFromStorage();
      });
    });
  }

  function bindActions() {
    document.querySelectorAll("[data-action='sign-in']").forEach(function (button) {
      button.addEventListener("click", function () {
        signInWithGoogle().then(function () {
          renderStateFromStorage();
        });
      });
    });

    document.querySelectorAll("[data-action='checkout']").forEach(function (button) {
      button.addEventListener("click", function () {
        createCheckout(button.getAttribute("data-plan-code"));
      });
    });

    document.querySelectorAll("[data-action='billing-portal']").forEach(function (button) {
      button.addEventListener("click", function () {
        openBillingPortal();
      });
    });
  }

  function setStatusMessage(text) {
    document.querySelectorAll("[data-runtime-message]").forEach(function (node) {
      node.textContent = text;
      node.classList.remove("hidden");
    });
  }

  function signInWithGoogle() {
    // Future integration point: Firebase Auth Google provider sign-in.
    setState("signedInFree");
    setStatusMessage("Mock sign-in complete. Replace signInWithGoogle() with Firebase Auth.");
    return mockDelay({
      ok: true,
      state: "signedInFree",
      provider: "google"
    });
  }

  function fetchAccount() {
    // Future integration point: Cloudflare Worker API returning account + subscription state.
    var state = getState();
    return mockDelay(MOCK_ACCOUNTS[state]);
  }

  function createCheckout(planCode) {
    // Future integration point: call Worker API, create Stripe Checkout Session, redirect.
    var nextState = planCode === "premium-lifetime" ? "signedInPremiumLifetime" : "signedInPremiumYearly";
    setState(nextState);
    setStatusMessage(
      "Mock checkout for " + planCode + " completed. Replace createCheckout(planCode) with Worker -> Stripe checkout flow."
    );
    return mockDelay({
      ok: true,
      checkoutUrl: "https://example.com/mock-checkout",
      planCode: planCode
    }).then(function (response) {
      renderStateFromStorage();
      return response;
    });
  }

  function openBillingPortal() {
    // Future integration point: call Worker API and redirect to Stripe Billing Portal.
    setStatusMessage("Mock billing portal opened. Replace openBillingPortal() with a Stripe portal session redirect.");
    return mockDelay({
      ok: true,
      portalUrl: "https://example.com/mock-billing-portal"
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderShell();
    bindStateChips();
    bindActions();
    renderStateFromStorage();
  });

  window.STGWebsite = {
    signInWithGoogle: signInWithGoogle,
    fetchAccount: fetchAccount,
    createCheckout: createCheckout,
    openBillingPortal: openBillingPortal,
    setMockState: function (state) {
      setState(state);
      return renderStateFromStorage();
    }
  };
})();
