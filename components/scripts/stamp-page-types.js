(function () {
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

  setInterval(stampPageTypes, 500);
})();
