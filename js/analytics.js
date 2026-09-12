(function () {
  "use strict";

  var POSTHOG_KEY = "phc_NEEtRGtNyCHZqLUzncdPGIFfXWXe9t4OroAXnhY8JRC";
  var POSTHOG_HOST = "https://eu.i.posthog.com";

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

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;

    var href = link.getAttribute("href") || "";
    var destination = href.indexOf("apps.apple.com") !== -1
      ? "app_store"
      : href.indexOf("play.google.com") !== -1
        ? "play_store"
        : null;

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
