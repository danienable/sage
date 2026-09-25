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

  function findMount() {
    var wrapper = document.querySelector(".header-wrapper, #header-wrapper");
    if (wrapper) return { node: wrapper, where: "afterend" };

    var header = document.querySelector(
      "header.header, header.site-header, body > header, header[role='banner'], .header, #header"
    );
    if (header) return { node: header, where: "afterend" };

    var main = document.querySelector("main, #skilljar-content");
    if (main) return { node: main, where: "beforebegin" };
    return null;
  }

  function source() {
    var tpl = document.getElementById("home-hero-template");
    if (!tpl || !tpl.content) return null;
    return tpl.content.querySelector(".home-hero");
  }

  function isPlaced(live, mount) {
    if (!live || !live.parentNode) return false;
    if (mount.where === "afterend") return live.previousElementSibling === mount.node;
    return live.nextElementSibling === mount.node;
  }

  function removeHero() {
    var heroes = document.querySelectorAll(".home-hero");
    for (var i = 0; i < heroes.length; i++) heroes[i].parentNode.removeChild(heroes[i]);
  }

  function fill(live, name) {
    if (live.getAttribute("data-name") === name) return;
    var nameEl = live.querySelector(".home-hero__name");
    if (nameEl) nameEl.textContent = name;
    var hello = live.querySelector(".home-hero__hello");
    var helloText = hello ? clean(hello.textContent) : "";
    var label = helloText && name ? helloText + " " + name : helloText || name;
    if (label) live.setAttribute("aria-label", label);
    live.setAttribute("data-name", name);
  }

  function apply() {
    var mount = findMount();
    var src = source();
    if (!mount || !src) return false;

    var live = document.querySelector(".home-hero");
    if (!isPlaced(live, mount)) {
      removeHero();
      live = src.cloneNode(true);
      mount.node.insertAdjacentElement(mount.where, live);
    }

    fill(live, firstName(currentUser()));
    return true;
  }

  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    apply();
    if ((currentUser() && currentUser().id) || tries > 40) clearInterval(timer);
  }, 250);
  apply();
})();
