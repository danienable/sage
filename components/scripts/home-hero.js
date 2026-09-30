/*
  Homepage banner. Used on the main dashboard (/).
  Paste with components/home-hero.html. The ready-to-paste copy is dist/home-hero-script.html.
  Moves the banner to sit under the header and fills in the learner's first name.
*/
(function () {
  /* The signed-in person, once Thought Industries has loaded them. */
  function currentUser() {
    try {
      var preload = window.CONF && window.CONF.preload && window.CONF.preload.currentUser;
      return (preload && preload.currentUser) || preload || null;
    } catch (e) {
      return null;
    }
  }

  /* First name only. The greeting word itself stays in the HTML. */
  function firstName(user) {
    if (!user || user.firstName == null) return "";
    return String(user.firstName).replace(/^\s+|\s+$/g, "");
  }

  /* Where the banner should sit: just under the site header. */
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

  /* The banner markup from home-hero.html. */
  function hero() {
    return document.querySelector(".home-hero");
  }

  /* True when the banner is already in the right spot. */
  function isPlaced(live, mount) {
    if (!live || !live.parentNode) return false;
    if (mount.where === "afterend") return live.previousElementSibling === mount.node;
    return live.nextElementSibling === mount.node;
  }

  /* Writes the first name into the greeting and the banner label. */
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

  /* Places the banner and fills the name. Returns true once a name is showing. */
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

  /* The header often appears after this script runs, so keep trying briefly. */
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (apply() || tries > 80) clearInterval(timer);
  }, 250);
  apply();
})();
