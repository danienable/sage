(function () {
  function currentUser() {
    try {
      var preload = window.CONF && window.CONF.preload && window.CONF.preload.currentUser;
      return (preload && preload.currentUser) || preload || null;
    } catch (e) {
      return null;
    }
  }

  function firstName(user) {
    if (!user || user.firstName == null) return "";
    return String(user.firstName).replace(/^\s+|\s+$/g, "");
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
    var helloText = hello ? String(hello.textContent || "").replace(/^\s+|\s+$/g, "") : "";
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

    var name = firstName(currentUser());
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
