/*
  Log-on popup for a Panorama dashboard.
  Paste with components/logon-message.html. The build writes both into
  dist/logon-message.html for the Custom HTML object.
  Shows the first card the learner matches, while it still has visits left
  and its end date has not passed. Closing it hides it for this page view.
*/
(function () {
  var shown = false;
  var closed = false;

  /* Trims a value so ids and labels compare cleanly. */
  function clean(value) {
    return String(value == null ? "" : value).replace(/^\s+|\s+$/g, "");
  }

  /* The widget markup from logon-message.html. */
  function root() {
    return document.querySelector(".logon-messages");
  }

  /* The signed-in person, once Thought Industries has loaded them. */
  function currentUser() {
    try {
      var conf = window.CONF || {};
      var preload = conf.preload && conf.preload.currentUser;
      var candidates = [preload && preload.currentUser, preload, conf.currentUser, conf.user];
      var fallback = null;
      for (var i = 0; i < candidates.length; i++) {
        var user = candidates[i];
        if (!user || !user.id) continue;
        if (!fallback) fallback = user;
        if (user.allocatedLicenses || user.activeLicense || user.country) return user;
      }
      return fallback;
    } catch (e) {
      return null;
    }
  }

  /* Comma-separated words on a card, such as license ids or countries. */
  function listAttr(card, name) {
    var raw = clean(card.getAttribute(name));
    if (!raw) return [];
    var parts = raw.split(",");
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var bit = clean(parts[i]);
      if (bit) out.push(bit);
    }
    return out;
  }

  /* Text from a profile value, including when it is stored as an object. */
  function fieldText(value) {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number") return clean(value);
    if (typeof value !== "object") return "";
    return clean(value.name || value.label || value.value || value.code || value.country || "");
  }

  /* A custom field whose name matches, whether the list is an array or a map. */
  function customByName(user, name) {
    var wanted = clean(name).toLowerCase();
    if (!wanted) return "";
    var sources = [user.customFields, user.customFieldValues, user.profileFields];
    for (var s = 0; s < sources.length; s++) {
      var fields = sources[s];
      if (!fields) continue;
      if (Object.prototype.toString.call(fields) === "[object Array]") {
        for (var i = 0; i < fields.length; i++) {
          var field = fields[i];
          if (!field || typeof field !== "object") continue;
          var label = clean(field.label || field.name || field.key || field.slug || field.id).toLowerCase();
          if (label !== wanted) continue;
          var text = fieldText(field.value != null ? field.value : field.val || field.text);
          if (text) return text;
        }
        continue;
      }
      if (typeof fields !== "object") continue;
      for (var key in fields) {
        if (!Object.prototype.hasOwnProperty.call(fields, key)) continue;
        if (clean(key).toLowerCase() !== wanted) continue;
        var match = fieldText(fields[key]);
        if (match) return match;
      }
    }
    return "";
  }

  /* One named field, then a custom field with that same name. */
  function readNamed(user, fieldName) {
    var key = clean(fieldName);
    if (!key || !user) return "";
    if (Object.prototype.hasOwnProperty.call(user, key)) {
      var direct = fieldText(user[key]);
      if (direct) return direct;
    }
    return customByName(user, key);
  }

  /* Country from the field the widget names, or the usual profile spots. */
  function profileCountry(user, fieldName) {
    if (!user) return "";
    if (clean(fieldName)) return readNamed(user, fieldName);
    if (user.country) return fieldText(user.country);
    if (user.countryCode) return fieldText(user.countryCode);
    var address = user.address || user.shippingAddress || user.billingAddress;
    if (address && typeof address === "object" && address.country) return fieldText(address.country);
    if (user.addressCountry) return fieldText(user.addressCountry);
    return customByName(user, "country");
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

  /* True once the license lists exist, even when the person holds none. */
  function licensesKnown(user) {
    if (!user) return false;
    if (user.allocatedLicenses != null) return true;
    if (user.activeLicense != null) return true;
    return false;
  }

  /* True when the person holds one of the license ids on the card. */
  function holdsAny(user, wanted) {
    var held = {};
    var found = [];
    addLicense(user && user.allocatedLicenses, found);
    addLicense(user && user.activeLicense, found);
    for (var i = 0; i < found.length; i++) held[found[i].toLowerCase()] = true;
    for (var n = 0; n < wanted.length; n++) {
      if (held[wanted[n].toLowerCase()]) return true;
    }
    return false;
  }

  /* True when every rule on the card fits this person. */
  function matches(card, user, fieldName) {
    var licenses = listAttr(card, "data-sublicenses");
    var countries = listAttr(card, "data-countries");
    if (!licenses.length && !countries.length) return false;
    if (licenses.length && !holdsAny(user, licenses)) return false;
    if (!countries.length) return true;
    var country = profileCountry(user, fieldName).toLowerCase();
    if (!country) return false;
    for (var i = 0; i < countries.length; i++) {
      if (countries[i].toLowerCase() === country) return true;
    }
    return false;
  }

  /* How many visits may show this card. A missing number means once. */
  function maxShows(card) {
    var count = parseInt(card.getAttribute("data-max-shows"), 10);
    if (!count || count < 1) return 1;
    return count;
  }

  /* True after the card's last day, using the learner's local date. */
  function expired(card) {
    var raw = clean(card.getAttribute("data-expires"));
    if (!raw) return false;
    var parts = raw.split("-");
    if (parts.length !== 3) return false;
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);
    if (!year || !month || !day) return false;
    var end = new Date(year, month - 1, day, 23, 59, 59, 999);
    return Date.now() > end.getTime();
  }

  /* A stable name so each card keeps its own visit count. */
  function cardKey(card, index) {
    return clean(card.getAttribute("data-id")) || "message-" + index;
  }

  /* Visits already used for this person and card, in this browser. */
  function shows(user, card, index) {
    try {
      var count = parseInt(localStorage.getItem("sage-logon:" + user.id + ":" + cardKey(card, index)), 10);
      return count > 0 ? count : 0;
    } catch (e) {
      return 0;
    }
  }

  /* Counts this page view once. A later visit can show the card again. */
  function rememberShow(user, card, index) {
    if (card.getAttribute("data-counted")) return;
    card.setAttribute("data-counted", "1");
    try {
      localStorage.setItem("sage-logon:" + user.id + ":" + cardKey(card, index), String(shows(user, card, index) + 1));
    } catch (e) {}
  }

  /* Hides a button until it has a real address. */
  function hideEmptyCta(card) {
    var link = card.querySelector(".logon-message__cta");
    if (!link) return;
    var href = clean(link.getAttribute("href"));
    if (!href || href === "#") link.setAttribute("hidden", "");
    else link.removeAttribute("hidden");
  }

  /* Closes the card for the rest of this page view. */
  function dismiss() {
    closed = true;
    var overlay = document.querySelector(".logon-message-overlay");
    if (overlay) overlay.classList.remove("is-open");
  }

  /* Puts the card on the page and counts one visit. */
  function open(card, user, index) {
    if (shown || closed) return;
    hideEmptyCta(card);
    var overlay = document.querySelector(".logon-message-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "logon-message-overlay";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) dismiss();
      });
      document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        if (!overlay.classList.contains("is-open")) return;
        dismiss();
      });
    }

    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    var title = card.querySelector(".logon-message__title, .logon-message__headline");
    if (title) {
      if (!title.id) title.id = "logon-message-title-" + cardKey(card, index).replace(/[^A-Za-z0-9_-]/g, "");
      card.setAttribute("aria-labelledby", title.id);
    }

    var close = card.querySelector(".logon-message__dismiss");
    if (close && !close.getAttribute("data-bound")) {
      close.setAttribute("data-bound", "1");
      close.addEventListener("click", dismiss);
    }

    overlay.appendChild(card);
    overlay.classList.add("is-open");
    rememberShow(user, card, index);
    shown = true;
    if (close) close.focus();
  }

  /*
    Shows the first card that fits and is not finished.
    A card the learner does not match does not block the next one.
    A finished card (visit limit or end date) does not block the next one.
    Waits when an earlier card needs license ids that have not loaded yet.
  */
  function apply(lastChance) {
    if (shown || closed) return true;
    var el = root();
    if (!el) return false;
    var user = currentUser();
    if (!user || !user.id) return false;

    var fieldName = el.getAttribute("data-country-field");
    var cards = el.querySelectorAll(".logon-message");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var licenses = listAttr(card, "data-sublicenses");
      var countries = listAttr(card, "data-countries");
      if (!licenses.length && !countries.length) continue;
      if (expired(card) || shows(user, card, i) >= maxShows(card)) continue;
      if (licenses.length && !licensesKnown(user) && !lastChance) return false;
      if (!matches(card, user, fieldName)) continue;
      open(card, user, i);
      return true;
    }
    return !!lastChance;
  }

  /* The person record often arrives after the page starts, so keep trying briefly. */
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (apply(tries > 80) || tries > 80) clearInterval(timer);
  }, 250);
  apply(false);
})();
