(function () {
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

  function firstName(user) {
    if (!user || user.firstName == null) return "";
    return String(user.firstName).replace(/^\s+|\s+$/g, "");
  }

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

  function greeting() {
    return document.querySelector(".learner-greeting");
  }

  function partTemplate(live, part) {
    var lang = detectLang();
    var node =
      live.querySelector('.learner-greeting__templates [data-lang="' + lang + '"][data-part="' + part + '"]') ||
      live.querySelector('.learner-greeting__templates [data-lang="en"][data-part="' + part + '"]');
    return node ? String(node.textContent || "").replace(/^\s+|\s+$/g, "") : "";
  }

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

  function isPlaced(live, mount) {
    if (!live || !live.parentNode) return false;
    if (mount.where === "afterend") return live.previousElementSibling === mount.node;
    return live.nextElementSibling === mount.node;
  }

  function renderedTitle(template, name) {
    return template.split("{name}").join(name).replace(/[ \t]{2,}/g, " ").replace(/^\s+|\s+$/g, "");
  }

  function fill(live, name) {
    var nameEl = live.querySelector(".learner-greeting__name");
    if (nameEl) {
      var nameText = name ? " " + name : "";
      if (name && nameEl.textContent !== nameText) nameEl.textContent = nameText;
    }

    var title = live.querySelector(".learner-greeting__title");
    var titleTemplate = partTemplate(live, "title");
    if (!titleTemplate && title && title.textContent.indexOf("{name}") !== -1) {
      titleTemplate = String(title.textContent || "");
    }
    if (title && titleTemplate) {
      var rendered = renderedTitle(titleTemplate, name);
      if (title.textContent !== rendered) title.textContent = rendered;
    }

    var prompt = live.querySelector(".learner-greeting__prompt");
    var promptTemplate = partTemplate(live, "prompt");
    if (prompt && promptTemplate && prompt.textContent !== promptTemplate) prompt.textContent = promptTemplate;

    var labelSource = title ? title.textContent : "";
    var label = String(labelSource || "").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
    if (label && label.indexOf("{name}") === -1) live.setAttribute("aria-label", label);
    live.setAttribute("data-name", name);
    live.classList.add("is-ready");
    if (!name) return false;
    if (nameEl) return nameEl.textContent.indexOf(name) !== -1;
    return !!title && title.textContent.indexOf(name) !== -1 && title.textContent.indexOf("{name}") === -1;
  }

  function apply() {
    var live = greeting();
    var mount = findMount();
    if (!live || !mount) return false;

    if (!isPlaced(live, mount)) {
      mount.node.insertAdjacentElement(mount.where, live);
    }

    return fill(live, firstName(currentUser()));
  }

  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    var ready = apply();
    if (tries > 240 || (tries > 120 && ready)) clearInterval(timer);
  }, 250);
  apply();
})();
