(function () {
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

  function clean(value) {
    return String(value == null ? "" : value).replace(/^\s+|\s+$/g, "");
  }

  function root() {
    return document.querySelector(".entitlement-ack");
  }

  function displayName(code) {
    var el = root();
    if (!el) return code;
    var nodes = el.querySelectorAll(".entitlement-ack__catalog [data-code]");
    for (var i = 0; i < nodes.length; i++) {
      if (clean(nodes[i].getAttribute("data-code")) === code) {
        return clean(nodes[i].textContent) || code;
      }
    }
    return code;
  }

  function messageTemplate() {
    var el = root();
    if (!el) return "";
    var lang = detectLang();
    var node =
      el.querySelector('.entitlement-ack__templates [data-lang="' + lang + '"]') ||
      el.querySelector('.entitlement-ack__templates [data-lang="en"]');
    return node ? clean(node.textContent) : "";
  }

  function currentUser() {
    try {
      var preload = window.CONF && window.CONF.preload && window.CONF.preload.currentUser;
      return (preload && preload.currentUser) || preload || null;
    } catch (e) {
      return null;
    }
  }

  function addToken(value, out) {
    var text = clean(value);
    if (!text) return;
    var matches = text.match(/ENT_[A-Za-z0-9_]+/g);
    if (matches) {
      for (var i = 0; i < matches.length; i++) out.push(matches[i]);
      return;
    }
    out.push(text);
  }

  function addLicense(item, out) {
    if (item == null) return;
    if (typeof item === "string") {
      addToken(item, out);
      return;
    }
    if (typeof item !== "object") return;
    addToken(item.sku, out);
    addToken(item.code, out);
    addToken(item.name, out);
    addToken(item.externalId, out);
    addToken(item.productCode, out);
    if (item.license) addLicense(item.license, out);
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

  function heldTokens(user) {
    var found = [];
    if (!user) return found;
    var licenses = user.allocatedLicenses;
    if (Object.prototype.toString.call(licenses) === "[object Array]") {
      for (var i = 0; i < licenses.length; i++) addLicense(licenses[i], found);
    }
    addLicense(user.activeLicense, found);
    return unique(found);
  }

  // Show a catalog row only when the user holds that code or its display name.
  function entitlements(user) {
    var el = root();
    if (!el || !user) return [];
    var held = {};
    var tokens = heldTokens(user);
    for (var i = 0; i < tokens.length; i++) held[tokens[i].toLowerCase()] = true;

    var names = [];
    var nodes = el.querySelectorAll(".entitlement-ack__catalog [data-code]");
    for (var n = 0; n < nodes.length; n++) {
      var code = clean(nodes[n].getAttribute("data-code"));
      var label = clean(nodes[n].textContent);
      if ((code && held[code.toLowerCase()]) || (label && held[label.toLowerCase()])) {
        names.push(label || code);
      }
    }
    return unique(names);
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

  function isPlaced(live, mount) {
    if (!live || !live.parentNode) return false;
    if (mount.where === "afterend") return live.previousElementSibling === mount.node;
    return live.nextElementSibling === mount.node;
  }

  function hide() {
    var el = root();
    if (el) el.classList.remove("is-ready");
  }

  function lineText(templateText, name) {
    return templateText.split("{name}").join(name);
  }

  function render(names) {
    var live = root();
    var templateText = messageTemplate();
    var mount = findMount();
    if (!live || !templateText || !mount) return false;

    if (!isPlaced(live, mount)) {
      mount.node.insertAdjacentElement(mount.where, live);
    }

    var messages = [];
    for (var i = 0; i < names.length; i++) messages.push(lineText(templateText, names[i]));

    var proto =
      live.querySelector('.entitlement-ack__templates [data-lang="' + detectLang() + '"]') ||
      live.querySelector('.entitlement-ack__templates [data-lang="en"]');
    var lines = live.querySelector(".entitlement-ack__lines");
    if (!proto || !lines) return false;

    var existing = lines.querySelectorAll(".entitlement-ack__text");
    var same = existing.length === messages.length;
    for (var n = 0; same && n < messages.length; n++) {
      if (existing[n].textContent !== messages[n]) same = false;
    }
    if (same) {
      live.classList.add("is-ready");
      return true;
    }

    while (lines.firstChild) lines.removeChild(lines.firstChild);
    for (var m = 0; m < messages.length; m++) {
      var line = proto.cloneNode(true);
      line.removeAttribute("data-lang");
      line.textContent = messages[m];
      lines.appendChild(line);
    }
    live.classList.add("is-ready");
    return true;
  }

  function apply() {
    var live = root();
    if (!live) return false;
    var user = currentUser();
    var loggedIn = !!(user && user.id) || document.documentElement.classList.contains("is-logged-in");
    if (!loggedIn) {
      hide();
      return false;
    }
    var names = entitlements(user);
    if (!names.length) {
      hide();
      return false;
    }
    return render(names);
  }

  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (apply() || tries > 80) clearInterval(timer);
  }, 250);
  apply();
})();
