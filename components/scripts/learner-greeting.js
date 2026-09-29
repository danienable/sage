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

  function greeting() {
    return document.querySelector(".learner-greeting");
  }

  function findMount() {
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
    if (title && title.textContent.indexOf("{name}") !== -1) {
      title.setAttribute("data-template", String(title.textContent || ""));
    }
    if (title && title.getAttribute("data-template")) {
      var rendered = renderedTitle(title.getAttribute("data-template"), name);
      if (title.textContent !== rendered) title.textContent = rendered;
    }

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
