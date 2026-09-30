/*
  Learner dashboard welcome banner. Used on /learn/dashboard.
  Paste with components/learner-greeting.html. Both dashboard scripts are
  combined in dist/learner-dashboard-script.html.
  Places the banner under the teal entitlement bar, then fills the first name
  and the sentence that matches the learner's language.
*/
(function () {
  /* Prefer the record that actually has a first name. */
  function currentUser() {
    try {
      var conf = window.CONF || {};
      var preload = conf.preload && conf.preload.currentUser;
      var candidates = [preload && preload.currentUser, preload, conf.currentUser, conf.user];
      var fallback = null;
      for (var i = 0; i < candidates.length; i++) {
        var user = candidates[i];
        if (!user) continue;
        if (!fallback && user.id) fallback = user;
        if (user.firstName) return user;
      }
      return fallback;
    } catch (e) {
      return null;
    }
  }

  /* First name only. "Welcome" and the punctuation stay in the HTML. */
  function firstName(user) {
    if (!user || user.firstName == null) return "";
    return String(user.firstName).replace(/^\s+|\s+$/g, "");
  }

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

  /* The banner markup from learner-greeting.html. */
  function greeting() {
    return document.querySelector(".learner-greeting");
  }

  /* The hidden translation for one piece, such as the question or a button. */
  function partTemplate(live, part) {
    var lang = detectLang();
    var node =
      live.querySelector('.learner-greeting__templates [data-lang="' + lang + '"][data-part="' + part + '"]') ||
      live.querySelector('.learner-greeting__templates [data-lang="en"][data-part="' + part + '"]');
    return node ? String(node.textContent || "").replace(/^\s+|\s+$/g, "") : "";
  }

  /* Sit under the entitlement bar when it is on the page, otherwise under the header. */
  function findMount() {
    var ack = document.querySelector(".entitlement-ack");
    if (ack && ack.parentNode) return { node: ack, where: "afterend" };

    var wrapper = document.querySelector(".header-wrapper, #header-wrapper");
    if (wrapper) return { node: wrapper, where: "afterend" };

    var header = document.querySelector(
      "header.header, header.site-header, body > header, header[role='banner'], .header, #header"
    );
    if (header) return { node: header, where: "afterend" };

    var main = document.querySelector("main, .dashboard, .dashboard__main, #main-content");
    if (main) return { node: main, where: "beforebegin" };
    return null;
  }

  /* True when the banner is already in the right spot. */
  function isPlaced(live, mount) {
    if (!live || !live.parentNode) return false;
    if (mount.where === "afterend") return live.previousElementSibling === mount.node;
    return live.nextElementSibling === mount.node;
  }

  /* Replaces visible text only when the translation is different. */
  function setText(node, text) {
    if (!node || !text || node.textContent === text) return;
    node.textContent = text;
  }

  /* Applies the translated lines and the learner's first name. */
  function fill(live, name) {
    var hello = live.querySelector(".learner-greeting__hello");
    setText(hello, partTemplate(live, "hello"));

    var nameEl = live.querySelector(".learner-greeting__name");
    if (nameEl && nameEl.textContent !== name) nameEl.textContent = name;

    setText(live.querySelector(".learner-greeting__prompt"), partTemplate(live, "prompt"));
    setText(live.querySelector(".learner-greeting__lead"), partTemplate(live, "lead"));

    var links = live.querySelectorAll(".learner-greeting__link");
    for (var i = 0; i < links.length; i++) {
      setText(links[i], partTemplate(live, links[i].getAttribute("data-part")));
    }

    var nav = live.querySelector(".learner-greeting__actions");
    var navLabel = partTemplate(live, "nav");
    if (nav && navLabel) nav.setAttribute("aria-label", navLabel);

    var helloText = hello ? String(hello.textContent || "").replace(/^\s+|\s+$/g, "") : "";
    var label = helloText && name ? helloText + " " + name + "!" : helloText || name;
    if (label) live.setAttribute("aria-label", label);
    live.setAttribute("data-name", name);
    live.classList.add("is-ready");
    return !!name && !!nameEl && nameEl.textContent.indexOf(name) !== -1;
  }

  /* Places the banner and fills it. Returns true once the name is showing. */
  function apply() {
    var live = greeting();
    var mount = findMount();
    if (!live || !mount) return false;

    if (!isPlaced(live, mount)) {
      mount.node.insertAdjacentElement(mount.where, live);
    }

    return fill(live, firstName(currentUser()));
  }

  /* The dashboard redraws itself, so keep the name and language filled in for a while. */
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    var ready = apply();
    if (tries > 240 || (tries > 120 && ready)) clearInterval(timer);
  }, 250);
  apply();
})();
