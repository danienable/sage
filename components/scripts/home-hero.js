(function () {
  function currentUser() {
    try {
      var preload = window.CONF && window.CONF.preload && window.CONF.preload.currentUser;
      return (preload && preload.currentUser) || preload || null;
    } catch (e) {
      return null;
    }
  }

  function clean(value) {
    return String(value == null ? "" : value).replace(/^\s+|\s+$/g, "");
  }

  function pick(obj, keys) {
    if (!obj) return "";
    for (var i = 0; i < keys.length; i++) {
      var value = clean(obj[keys[i]]);
      if (value) return value;
    }
    return "";
  }

  function firstName(user) {
    if (!user) return "";
    var name = pick(user, ["firstName", "first_name", "firstname", "givenName", "given_name"]);
    if (name) return name;
    var nested = user.profile || user.user || user.account;
    name = pick(nested, ["firstName", "first_name", "firstname", "givenName", "given_name"]);
    if (name) return name;
    var full = pick(user, ["name", "fullName", "full_name", "displayName", "display_name"]);
    if (!full) full = pick(nested, ["name", "fullName", "full_name", "displayName", "display_name"]);
    if (!full) return "";
    return clean(full.split(/\s+/)[0]);
  }

  function nameFromHeader() {
    var selectors = [
      ".header-user-name",
      ".user-menu__name",
      ".user-name",
      "[data-testid='user-name']",
      ".avatar-menu__name",
      ".navbar-user-name"
    ];
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      var text = el ? clean(el.textContent) : "";
      if (text) return clean(text.split(/\s+/)[0]);
    }

    var buttons = document.querySelectorAll("header button, header [role='button'], .header button");
    for (var n = 0; n < buttons.length; n++) {
      var label = clean(buttons[n].textContent).replace(/\s+/g, " ");
      if (!label || label.length > 60) continue;
      if (/sign\s*in|log\s*in|menu|search|catalog/i.test(label)) continue;
      var parts = label.split(" ");
      if (parts.length >= 2 && parts.length <= 4) return parts[0];
    }
    return "";
  }

  function findMount() {
    var wrapper = document.querySelector(".header-wrapper, #header-wrapper");
    if (wrapper) return { node: wrapper, where: "afterend" };

    var header = document.querySelector(
      "header.header, header.site-header, body > header, header[role='banner'], .header, #header"
    );
    if (header) return { node: header, where: "afterend" };

    var main = document.querySelector("main, .dashboard, .dashboard__main");
    if (main) return { node: main, where: "beforebegin" };
    return null;
  }

  function hero() {
    return document.querySelector(".home-hero");
  }

  function isPlaced(live, mount) {
    if (!live || !live.parentNode) return false;
    if (mount.where === "afterend") return live.previousElementSibling === mount.node;
    return live.nextElementSibling === mount.node;
  }

  function fill(live, name) {
    var nameEl = live.querySelector(".home-hero__name");
    if (nameEl && nameEl.textContent !== name) nameEl.textContent = name;
    var hello = live.querySelector(".home-hero__hello");
    var helloText = hello ? clean(hello.textContent) : "";
    var label = helloText && name ? helloText + " " + name : helloText || name;
    if (label) live.setAttribute("aria-label", label);
    live.setAttribute("data-name", name);
    live.classList.add("is-ready");
  }

  function apply() {
    var live = hero();
    var mount = findMount();
    if (!live || !mount) return false;

    if (!isPlaced(live, mount)) {
      mount.node.insertAdjacentElement(mount.where, live);
    }

    var name = firstName(currentUser()) || nameFromHeader();
    fill(live, name);
    return !!name;
  }

  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (apply() || tries > 80) clearInterval(timer);
  }, 250);
  apply();
})();
