(function () {
  var strings = {
    en: "You are a {name} Holder",
    de: "Sie sind Inhaber von {name}",
    "fr-FR": "Vous êtes titulaire de {name}",
    "fr-CA": "Vous êtes titulaire de {name}",
    es: "Es titular de {name}",
    pt: "Você é titular de {name}"
  };

  var displayNames = {
    ENT_NA_50_US_CustomerLearningMembership_C: "Sage 50 Customer Learning Membership",
    ENT_NA_50_US_ProductSubscription_C: "Sage 50 US Product Subscription"
  };

  var homePaths = {
    "/learn/dashboard": true
  };

  function mapLang(lang) {
    if (!lang) return null;
    var l = String(lang).toLowerCase().replace("_", "-");
    if (l === "fr-ca" || l.indexOf("fr-ca") === 0) return "fr-CA";
    if (l.indexOf("fr") === 0) return "fr-FR";
    if (l.indexOf("de") === 0) return "de";
    if (l.indexOf("es") === 0) return "es";
    if (l.indexOf("pt") === 0) return "pt";
    if (l.indexOf("en") === 0) return "en";
    return null;
  }

  function detectLang() {
    var list =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || navigator.userLanguage || "en"];
    for (var i = 0; i < list.length; i++) {
      var mapped = mapLang(list[i]);
      if (mapped) return mapped;
    }
    return "en";
  }

  function message(name) {
    var template = strings[detectLang()] || strings.en;
    return template.replace("{name}", name);
  }

  function label(value) {
    var text = String(value == null ? "" : value).replace(/^\s+|\s+$/g, "");
    return displayNames[text] || text;
  }

  function currentUser() {
    try {
      var preload = window.CONF && window.CONF.preload && window.CONF.preload.currentUser;
      return (preload && preload.currentUser) || preload || null;
    } catch (e) {
      return null;
    }
  }

  function isLearnerHome() {
    var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
    return !!homePaths[path];
  }

  function collectCodes(value, out, depth, seen) {
    if (value == null || depth > 8) return;
    if (typeof value === "string") {
      var trimmed = value.replace(/^\s+|\s+$/g, "");
      if (/^ENT_[A-Za-z0-9_]+$/.test(trimmed)) out.push(trimmed);
      return;
    }
    if (typeof value !== "object") return;
    for (var i = 0; i < seen.length; i++) {
      if (seen[i] === value) return;
    }
    seen.push(value);
    if (Object.prototype.toString.call(value) === "[object Array]") {
      for (var n = 0; n < value.length; n++) collectCodes(value[n], out, depth + 1, seen);
      return;
    }
    for (var key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        collectCodes(value[key], out, depth + 1, seen);
      }
    }
  }

  function unique(list) {
    var seen = {};
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var name = String(list[i] == null ? "" : list[i]).replace(/^\s+|\s+$/g, "");
      if (!name) continue;
      var key = name.toLowerCase();
      if (seen[key]) continue;
      seen[key] = true;
      out.push(name);
    }
    return out;
  }

  function previewNames() {
    var one = ["ENT_NA_50_US_CustomerLearningMembership_C"];
    var both = ["ENT_NA_50_US_CustomerLearningMembership_C", "ENT_NA_50_US_ProductSubscription_C"];

    function fromValue(value) {
      if (value === 1 || value === "1") return one.slice();
      if (value === 2 || value === "2") return both.slice();
      return null;
    }

    var preset = fromValue(window.SAGE_ACK_PREVIEW);
    if (preset) return preset;
    if (typeof window.SAGE_ACK_PREVIEW === "string") return unique([window.SAGE_ACK_PREVIEW]);
    if (Object.prototype.toString.call(window.SAGE_ACK_PREVIEW) === "[object Array]") {
      return unique(window.SAGE_ACK_PREVIEW);
    }

    var query = location.search || "";
    var match = query.match(/(?:^|[?&])ackPreview=([^&]*)/);
    if (!match) return [];
    var value = decodeURIComponent(match[1].replace(/\+/g, " "));
    preset = fromValue(value);
    if (preset) return preset;
    return unique(value.split(","));
  }

  var scannedFor = null;
  var cachedCodes = [];

  // Sublicense codes on the logged-in user are mapped to display names.
  // Unmapped codes stay visible so missing names are obvious.
  // Preview on /learn/dashboard: ?ackPreview=1 for one, ?ackPreview=2 for both
  function sublicenses(user) {
    var codes = [];
    if (user && user.id) {
      if (scannedFor !== user.id || !cachedCodes.length) {
        var found = [];
        collectCodes(user, found, 0, []);
        cachedCodes = unique(found);
        scannedFor = user.id;
      }
      codes = cachedCodes;
    }
    var labeled = [];
    var combined = codes.concat(previewNames());
    for (var i = 0; i < combined.length; i++) labeled.push(label(combined[i]));
    return unique(labeled);
  }

  function findMount() {
    var header = document.querySelector(
      "header.header, header.site-header, body > header, header[role='banner'], .header, #header"
    );
    if (header) return { node: header, where: "afterend" };

    var dashboard = document.querySelector(".dashboard, .dashboard__main, main");
    if (dashboard) return { node: dashboard, where: "beforebegin" };
    return null;
  }

  function removeBars() {
    var bars = document.querySelectorAll(".entitlement-ack");
    for (var i = 0; i < bars.length; i++) bars[i].parentNode.removeChild(bars[i]);
  }

  function render(names) {
    var mount = findMount();
    if (!mount) return false;

    var existing = document.querySelectorAll(".entitlement-ack__text");
    var same = existing.length === names.length;
    for (var i = 0; same && i < names.length; i++) {
      if (existing[i].textContent !== message(names[i])) same = false;
    }
    if (same) return true;

    removeBars();
    var bar = document.createElement("div");
    bar.className = "entitlement-ack";
    bar.setAttribute("role", "status");
    for (var n = 0; n < names.length; n++) {
      var text = document.createElement("p");
      text.className = "entitlement-ack__text";
      text.textContent = message(names[n]);
      bar.appendChild(text);
    }
    mount.node.insertAdjacentElement(mount.where, bar);
    return true;
  }

  function apply() {
    if (!isLearnerHome()) return true;
    var user = currentUser();
    var loggedIn = !!(user && user.id) || document.documentElement.classList.contains("is-logged-in");
    if (!loggedIn) return false;
    var names = sublicenses(user);
    if (!names.length) {
      removeBars();
      return true;
    }
    return render(names);
  }

  var timer = setInterval(function () {
    if (!isLearnerHome()) {
      clearInterval(timer);
      return;
    }
    apply();
  }, 250);
})();
