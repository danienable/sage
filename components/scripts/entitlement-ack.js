/*
  Teal entitlement bar on the learner dashboard (/learn/dashboard).
  Paste with components/entitlement-ack.html. Combined with the welcome banner
  in dist/learner-dashboard-script.html.
  Shows one line per sublicense the learner holds. The license id in the HTML
  must match the license on the person. The words learners see come from that HTML.
*/
(function () {
  /* Turns a language tag such as fr-ca or de-DE into one of our template languages. */
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

  /* Reads one cookie. Used only if the profile has no language saved. */
  function cookieValue(name) {
    var parts = document.cookie ? document.cookie.split(";") : [];
    for (var i = 0; i < parts.length; i++) {
      var bit = parts[i].replace(/^\s+/, "");
      if (bit.indexOf(name + "=") !== 0) continue;
      try {
        return decodeURIComponent(bit.slice(name.length + 1));
      } catch (e) {
        return "";
      }
    }
    return "";
  }

  /* Language the learner chose, before we look at the browser. */
  function selectedLang() {
    try {
      var conf = window.CONF || {};
      var preload = conf.preload && conf.preload.currentUser;
      var users = [preload && preload.currentUser, preload, conf.currentUser, conf.user];
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        if (user && user.lang) return String(user.lang);
      }
      if (conf.lang) return String(conf.lang);
      if (conf.locale) return String(conf.locale);
    } catch (e) {}
    return cookieValue("lang") || cookieValue("locale") || cookieValue("language") || "";
  }

  /* Chosen language first, then the browser language, then English. */
  function detectLang() {
    var selected = mapLang(selectedLang());
    if (selected) return selected;
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

  /* Trims a value so ids and labels compare cleanly. */
  function clean(value) {
    return String(value == null ? "" : value).replace(/^\s+|\s+$/g, "");
  }

  /* The bar markup from entitlement-ack.html. */
  function root() {
    return document.querySelector(".entitlement-ack");
  }

  /* The sentence for this language. {name} is replaced with the product name. */
  function messageTemplate() {
    var el = root();
    if (!el) return "";
    var lang = detectLang();
    var node =
      el.querySelector('.entitlement-ack__templates [data-lang="' + lang + '"]') ||
      el.querySelector('.entitlement-ack__templates [data-lang="en"]');
    return node ? clean(node.textContent) : "";
  }

  /* The signed-in person, once Thought Industries has loaded them. */
  function currentUser() {
    try {
      var preload = window.CONF && window.CONF.preload && window.CONF.preload.currentUser;
      return (preload && preload.currentUser) || preload || null;
    } catch (e) {
      return null;
    }
  }

  /* The license id on one entitlement, whether it is stored as text or an object. */
  function licenseId(item) {
    if (typeof item === "string") return clean(item);
    if (!item || typeof item !== "object") return "";
    if (typeof item.license === "string") return clean(item.license);
    if (typeof item.id === "string" && item.id.indexOf("--") !== -1) return clean(item.id.split("--").pop());
    return "";
  }

  /* Collects license ids, including when they arrive in a list. */
  function addLicense(item, out) {
    if (item == null) return;
    if (Object.prototype.toString.call(item) === "[object Array]") {
      for (var i = 0; i < item.length; i++) addLicense(item[i], out);
      return;
    }
    var id = licenseId(item);
    if (id) out.push(id);
  }

  /* Drops blank and repeated names without caring about letter case. */
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

  /* License ids currently assigned to this person. */
  function heldTokens(user) {
    var found = [];
    if (!user) return found;
    addLicense(user.allocatedLicenses, found);
    addLicense(user.activeLicense, found);
    return unique(found);
  }

  /* Product names from the HTML catalog whose license id this person holds. */
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
      if (code && held[code.toLowerCase()]) names.push(label || code);
    }
    return unique(names);
  }

  /* Sit directly under the site header, above the welcome banner. */
  function findMount() {
    var header = document.querySelector(
      "header.header, header.site-header, body > header, header[role='banner'], .header, #header"
    );
    if (header) return { node: header, where: "afterend" };

    var dashboard = document.querySelector(".dashboard, .dashboard__main, main");
    if (dashboard) return { node: dashboard, where: "beforebegin" };
    return null;
  }

  /* True when the bar is already in the right spot. */
  function isPlaced(live, mount) {
    if (!live || !live.parentNode) return false;
    if (mount.where === "afterend") return live.previousElementSibling === mount.node;
    return live.nextElementSibling === mount.node;
  }

  /* Hides the bar when there is nothing to say. */
  function hide() {
    var el = root();
    if (el) el.classList.remove("is-ready");
  }

  /* Drops the product name into the sentence in place of {name}. */
  function lineText(templateText, name) {
    return templateText.split("{name}").join(name);
  }

  /* Builds one visible line per product and reveals the bar. */
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

  /* Shows the bar only for a signed-in learner who holds a listed license. */
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

  /* The learner record often arrives after the page starts, so keep trying briefly. */
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (apply() || tries > 80) clearInterval(timer);
  }, 250);
  apply();
})();
