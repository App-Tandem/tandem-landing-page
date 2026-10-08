(function () {
  "use strict";

  var POSTHOG_KEY = "phc_NEEtRGtNyCHZqLUzncdPGIFfXWXe9t4OroAXnhY8JRC";
  var POSTHOG_HOST = "https://eu.i.posthog.com";
  // App Store Connect > Apps > Tandem > App Analytics > Acquisition > Campaigns:
  // the `pt` value of a generated campaign link. Not a secret. While empty,
  // App Store links stay unchanged (Apple ignores `ct` without `pt`).
  var APP_STORE_PROVIDER_TOKEN = "";

  if (!window.posthog) {
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2===o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once reset group groups register register_once unregister opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing start_session_recording stop_session_recording isFeatureEnabled getFeatureFlag getFeatureFlagPayload reloadFeatureFlags onFeatureFlags sendFeatureFlags getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getEarlyAccessFeature enrollInEarlyAccessFeature getExperiments getActiveFeatureFlags onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  }

  window.posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    persistence: "localStorage+cookie"
  });

  var path = window.location.pathname || "/";
  var params = new URLSearchParams(window.location.search);
  var isGuide = path.indexOf("/guides/") === 0 && path !== "/guides/" && path !== "/guides/index.html";
  var isFeatureHub = path === "/features/" || path === "/features/index.html";
  var isFeature = path.indexOf("/features/") === 0 && path !== "/features/" && path !== "/features/index.html";
  var pageType = isGuide
    ? "guide"
    : isFeature
      ? "feature"
      : isFeatureHub
        ? "feature_hub"
        : path.indexOf("/pair") === 0
          ? "invite"
          : path === "/" || path === "/index.html" || path === "/hr/" || path === "/hr/index.html"
            ? "homepage"
            : "supporting";

  function safeCampaignValue(name) {
    var value = params.get(name);
    return value ? value.slice(0, 120) : null;
  }

  function referrerHost() {
    if (!document.referrer) return null;
    try {
      return new URL(document.referrer).hostname;
    } catch (_error) {
      return null;
    }
  }

  function devicePlatform() {
    var userAgent = navigator.userAgent || "";
    if (/android/i.test(userAgent)) return "android";
    if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
    return "desktop_or_other";
  }

  function firstTouch() {
    var storageKey = "tandem_landing_first_touch";
    var current = {
      first_entry_path: path,
      first_referrer_host: referrerHost(),
      first_utm_source: safeCampaignValue("utm_source"),
      first_utm_medium: safeCampaignValue("utm_medium"),
      first_utm_campaign: safeCampaignValue("utm_campaign")
    };

    try {
      var stored = window.localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
      window.localStorage.setItem(storageKey, JSON.stringify(current));
    } catch (_error) {
      // Analytics must never interfere with navigation when storage is unavailable.
    }

    return current;
  }

  var sharedProperties = Object.assign({
    page_type: pageType,
    page_path: path,
    page_title: document.title,
    platform: devicePlatform(),
    referrer_host: referrerHost(),
    utm_source: safeCampaignValue("utm_source"),
    utm_medium: safeCampaignValue("utm_medium"),
    utm_campaign: safeCampaignValue("utm_campaign"),
    utm_content: safeCampaignValue("utm_content")
  }, firstTouch());

  window.posthog.capture("landing_page_viewed", sharedProperties);

  // ── Install attribution (TANAA-26) ─────────────────────────────────
  // Store links carry the campaign into the install. Google Play keeps the
  // `referrer=` value and the app reads it once (Play Install Referrer) as
  // `initial_utm_*`. Only campaign fields, no personal data. The invite page
  // builds its own Play referrer, so it is skipped here.
  var SOCIAL_REFERRER_HOSTS = [["tiktok.com", "tiktok"], ["instagram.com", "instagram"]];

  function campaignToken(value) {
    if (!value) return null;
    var token = String(value).toLowerCase().replace(/[^a-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60);
    return token || null;
  }

  function socialSourceFromHost(host) {
    if (!host) return null;
    for (var i = 0; i < SOCIAL_REFERRER_HOSTS.length; i++) {
      var domain = SOCIAL_REFERRER_HOSTS[i][0];
      if (host === domain || host.slice(-(domain.length + 1)) === "." + domain) return SOCIAL_REFERRER_HOSTS[i][1];
    }
    return null;
  }

  function installCampaign() {
    // This visit's UTM wins; else the first visit's UTM; else a TikTok or
    // Instagram referrer (in-app browsers often send none).
    var useCurrent = !!sharedProperties.utm_source;
    var source = campaignToken(useCurrent ? sharedProperties.utm_source : sharedProperties.first_utm_source);
    if (source) {
      return {
        source: source,
        medium: campaignToken(useCurrent ? sharedProperties.utm_medium : sharedProperties.first_utm_medium),
        campaign: campaignToken(useCurrent ? sharedProperties.utm_campaign : sharedProperties.first_utm_campaign)
      };
    }
    var social = socialSourceFromHost(sharedProperties.referrer_host) || socialSourceFromHost(sharedProperties.first_referrer_host);
    return social ? { source: social, medium: "referral", campaign: null } : null;
  }

  var campaign = pageType === "invite" ? null : installCampaign();

  function decorateStoreLink(link) {
    if (!campaign || !link || !link.href) return;
    var url;
    try {
      url = new URL(link.href);
    } catch (_error) {
      return;
    }

    if (url.hostname === "play.google.com" && url.pathname === "/store/apps/details") {
      if (url.searchParams.has("referrer")) return;
      var referrer = new URLSearchParams();
      referrer.set("utm_source", campaign.source);
      if (campaign.medium) referrer.set("utm_medium", campaign.medium);
      if (campaign.campaign) referrer.set("utm_campaign", campaign.campaign);
      url.searchParams.set("referrer", referrer.toString());
      link.href = url.toString();
    } else if (url.hostname === "apps.apple.com" && APP_STORE_PROVIDER_TOKEN) {
      if (url.searchParams.has("ct")) return;
      url.searchParams.set("pt", APP_STORE_PROVIDER_TOKEN);
      url.searchParams.set("ct", [campaign.source, campaign.campaign].filter(Boolean).join("_").slice(0, 40));
      url.searchParams.set("mt", "8");
      link.href = url.toString();
    }
  }

  if (campaign) {
    var storeLinks = document.querySelectorAll('a[href*="play.google.com"], a[href*="apps.apple.com"]');
    for (var linkIndex = 0; linkIndex < storeLinks.length; linkIndex++) decorateStoreLink(storeLinks[linkIndex]);
  }

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;

    var href = link.getAttribute("href") || "";
    var destination = href.indexOf("apps.apple.com") !== -1
      ? "app_store"
      : href.indexOf("play.google.com") !== -1
        ? "play_store"
        : null;

    // Links set later by main.js (sticky download bar) are decorated here.
    if (destination) decorateStoreLink(link);

    if (destination && pageType !== "invite") {
      window.posthog.capture("landing_store_cta_clicked", Object.assign({}, sharedProperties, {
        destination: destination,
        cta_location: link.getAttribute("data-cta-location") || "content"
      }));
    }

    if (isGuide && (href.indexOf("../index.html#download") !== -1 || destination)) {
      window.posthog.capture("guide_download_cta_clicked", {
        guide_path: path,
        destination: destination || "download_section"
      });
    }

    var featureName = link.getAttribute("data-feature");
    if (featureName) {
      window.posthog.capture("landing_feature_link_clicked", Object.assign({}, sharedProperties, {
        feature_name: featureName,
        link_path: link.pathname || href,
        cta_location: link.getAttribute("data-cta-location") || "content"
      }));
    }
  });
})();
