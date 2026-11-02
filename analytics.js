(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-39Q552JBKJ';
  var CONSENT_KEY = 'nfp_analytics_consent_v1';
  var choice = null;
  var started = false;
  var settingsButton;

  if (window.nfpAnalyticsInitialized) return;
  window.nfpAnalyticsInitialized = true;

  try { choice = localStorage.getItem(CONSENT_KEY); } catch (error) { /* Ask on each visit if storage is unavailable. */ }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
  window['ga-disable-' + MEASUREMENT_ID] = choice !== 'granted';

  function startAnalytics() {
    if (started) return;
    started = true;
    window['ga-disable-' + MEASUREMENT_ID] = false;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    var tag = document.createElement('script');
    tag.id = 'nfp-ga4-tag';
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    document.head.appendChild(tag);
  }

  function clearAnalyticsCookies() {
    var parts = window.location.hostname.split('.');
    var domains = [''];
    for (var i = 0; i < parts.length - 1; i++) domains.push(parts.slice(i).join('.'));
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (name !== '_ga' && name.indexOf('_ga_') !== 0) return;
      domains.forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
      });
    });
  }

  function saveChoice(nextChoice) {
    choice = nextChoice;
    try {
      localStorage.setItem(CONSENT_KEY, choice);
      // Dismiss the older hosting-injected notice; its old "1" is never analytics consent.
      localStorage.setItem('nfp_cookie_consent', '1');
    } catch (error) { /* The current choice still applies for this page. */ }
    var banner = document.getElementById('nfp-analytics-banner');
    if (banner) banner.remove();
    if (choice === 'granted') {
      startAnalytics();
    } else {
      window['ga-disable-' + MEASUREMENT_ID] = true;
      clearAnalyticsCookies();
      // Unload an already-running tag so the withdrawn choice applies immediately.
      if (started) { window.location.reload(); return; }
    }
    if (settingsButton) settingsButton.focus();
  }

  function showChoices(focusChoice) {
    var existing = document.getElementById('nfp-analytics-banner');
    if (existing) { if (focusChoice) existing.querySelector('button').focus(); return; }
    var banner = document.createElement('section');
    banner.id = 'nfp-analytics-banner';
    banner.setAttribute('aria-label', 'Analytics cookie choices');
    banner.innerHTML = '<p>Optional Google Analytics cookies help us understand website visits. ' +
      'Choose whether to allow analytics. <a href="/privacy-policy.html">Privacy Policy</a></p>' +
      '<div class="nfp-analytics-actions"><button type="button" id="nfp-essential-only">Use essential only</button>' +
      '<button type="button" id="nfp-allow-analytics">Allow analytics</button></div>';
    document.body.appendChild(banner);
    document.getElementById('nfp-essential-only').addEventListener('click', function () { saveChoice('denied'); });
    document.getElementById('nfp-allow-analytics').addEventListener('click', function () { saveChoice('granted'); });
    if (focusChoice) document.getElementById('nfp-essential-only').focus();
  }

  function initialize() {
    // Replace the former one-button notice, including on pages modified by Netlify snippet injection.
    var legacyBanner = document.getElementById('nfp-cookie-banner');
    if (legacyBanner) legacyBanner.remove();
    var style = document.createElement('style');
    style.textContent = '#nfp-analytics-banner{position:fixed;bottom:0;left:0;right:0;z-index:2147483647;' +
      'display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 24px;' +
      'background:#0b1a2f;color:#fff;box-shadow:0 -2px 12px #0006;font:14px/1.5 Arial,sans-serif;text-align:left}' +
      '#nfp-analytics-banner p{margin:0;color:#fff;font:inherit;max-width:760px}' +
      '#nfp-analytics-banner a{color:#f0d060;text-decoration:underline}' +
      '.nfp-analytics-actions{display:flex;flex-wrap:wrap;gap:10px}' +
      '#nfp-analytics-banner button{border:1px solid #d4af37;border-radius:4px;background:#d4af37;color:#080c10;' +
      'padding:10px 16px;font:600 14px Arial,sans-serif;cursor:pointer;white-space:nowrap;min-height:44px}' +
      '#nfp-analytics-banner button:focus-visible,.nfp-cookie-settings:focus-visible{outline:3px solid #fff;outline-offset:3px}' +
      '.nfp-cookie-settings{background:transparent;border:0;color:inherit;text-decoration:underline;' +
      'padding:8px;font:inherit;cursor:pointer;min-height:44px}' +
      '@media(max-width:650px){#nfp-analytics-banner{flex-direction:column;align-items:stretch;padding:16px}' +
      '.nfp-analytics-actions{display:grid;grid-template-columns:1fr 1fr}#nfp-analytics-banner button{white-space:normal}}';
    document.head.appendChild(style);
    settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className = 'nfp-cookie-settings';
    settingsButton.textContent = 'Cookie settings';
    settingsButton.addEventListener('click', function () { showChoices(true); });
    var footer = document.querySelector('footer');
    if (!footer) {
      footer = document.createElement('footer');
      footer.style.cssText = 'padding:12px;text-align:center';
      document.body.appendChild(footer);
    }
    footer.appendChild(settingsButton);
    if (choice === 'granted') startAnalytics();
    else {
      if (choice === 'denied') clearAnalyticsCookies();
      else showChoices(false);
    }
  }

  window.addEventListener('storage', function (event) {
    if (event.key === CONSENT_KEY && event.newValue !== choice) window.location.reload();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
