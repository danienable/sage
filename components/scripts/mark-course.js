(function () {
  function getView(el) {
    if (!el || !window.Ember || !Ember.View || !Ember.View.views) return null;
    var node = el;
    while (node) {
      if (node.id && Ember.View.views[node.id]) return Ember.View.views[node.id];
      node = node.parentElement;
    }
    var inner = el.querySelector && el.querySelector(".ember-view");
    return inner && Ember.View.views[inner.id] ? Ember.View.views[inner.id] : null;
  }

  function read(view, keys) {
    if (!view || !view.get) return null;
    for (var i = 0; i < keys.length; i++) {
      try {
        var val = view.get(keys[i]);
        if (typeof val === "boolean") return val;
      } catch (e) {}
    }
    return null;
  }

  function setDisplay(els, show) {
    for (var i = 0; i < els.length; i++) {
      els[i].style.setProperty("display", show ? "block" : "none", "important");
    }
  }

  function markCourse() {
    var root = document.documentElement;
    var loggedIn = root.classList.contains("is-logged-in");
    var widget = document.querySelector(".js-enroll-native, .enroll--learning-path");
    var view = getView(widget);
    var text = widget ? (widget.textContent || "").toLowerCase() : "";

    var purchasable = read(view, [
      "purchasable",
      "course.purchasable",
      "learningPath.purchasable",
      "content.purchasable",
      "model.purchasable"
    ]);
    var hasAccess = read(view, [
      "hasAccess",
      "currentUserHasAccess",
      "course.currentUserHasAccess",
      "learningPath.currentUserHasAccess",
      "isEnrolled",
      "hasEnrollment",
      "enrolled",
      "userHasAccess",
      "canAccess"
    ]);

    if (purchasable === null) {
      purchasable = !!document.querySelector(
        ".js-enroll-native .enroll__price, .js-enroll-native .course-purchase__price, .enroll--learning-path .enroll__price"
      );
    }

    if (hasAccess === null) {
      hasAccess =
        /\bstart\b/.test(text) ||
        /\bcontinue\b/.test(text) ||
        /\bresume\b/.test(text);
    }

    var ready = !!(
      widget &&
      (purchasable === true ||
        hasAccess === true ||
        (text && text.replace(/\s+/g, " ").trim().length > 15) ||
        document.querySelector(".js-enroll-native .btn, .js-enroll-native button, .js-enroll-native .enroll, .enroll--learning-path .btn, .enroll--learning-path button"))
    );

    root.classList.toggle("course-purchasable", !!purchasable);
    root.classList.toggle("has-course-access", !!hasAccess);
    root.classList.toggle("no-course-access", !hasAccess);
    root.classList.toggle("course-state-ready", ready);

    var showGate = loggedIn && ready && !hasAccess && !purchasable;
    var showNative = loggedIn && ready && (hasAccess || purchasable);

    setDisplay(document.querySelectorAll(".entitlement-gate, .js-entitlement-gate"), showGate);
    setDisplay(
      document.querySelectorAll(".js-enroll-native, .course-purchase__mobile-button, .widget--learning-path-purchase"),
      showNative
    );
  }

  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    markCourse();
    if (tries > 40) clearInterval(timer);
  }, 250);
})();
