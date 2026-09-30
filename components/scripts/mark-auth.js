/*
  Site-wide. Included in dist/tracking-scripts.html, which is pasted in the footer.
  Marks the page as logged-in or anonymous so the course sidebar can show the right block.
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
  /* Adds is-logged-in or is-anonymous on the page. The stylesheet reads those. */
  function markAuth() {
    var user = currentUser();
    var loggedIn = !!(user && user.id);
    document.documentElement.classList.toggle("is-logged-in", loggedIn);
    document.documentElement.classList.toggle("is-anonymous", !loggedIn);
  }
  /* The person record can arrive after the first paint, so check a few times. */
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    markAuth();
    if ((currentUser() && currentUser().id) || tries > 40) clearInterval(timer);
  }, 250);
})();
