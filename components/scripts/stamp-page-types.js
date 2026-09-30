/*
  Site-wide. Included in dist/tracking-scripts.html, which is pasted in the footer.
  Labels each lesson in the course menu with its type so the stylesheet can show the right icon.
*/
(function () {
  /* Writes the lesson type onto each row in the course menu. */
  function stampPageTypes() {
    if (!window.Ember || !Ember.View || !Ember.View.views) return;

    var items = document.querySelectorAll("li.syllabus__topic");
    for (var i = 0; i < items.length; i++) {
      var li = items[i];
      var view = Ember.View.views[li.id];
      if (!view || !view.get) continue;

      var type =
        view.get("topic.type") ||
        view.get("content.type") ||
        view.get("context.type") ||
        view.get("model.type");

      if (type) li.setAttribute("data-page-type", type);
    }
  }

  /* The course menu updates while someone moves through the course, so keep labeling rows. */
  setInterval(stampPageTypes, 500);
})();
