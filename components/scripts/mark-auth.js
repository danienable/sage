(function () {
  function currentUser() {
    try {
      var preload = window.CONF && window.CONF.preload && window.CONF.preload.currentUser;
      return (preload && preload.currentUser) || preload || null;
    } catch (e) {
      return null;
    }
  }
  function markAuth() {
    var user = currentUser();
    var loggedIn = !!(user && user.id);
    document.documentElement.classList.toggle("is-logged-in", loggedIn);
    document.documentElement.classList.toggle("is-anonymous", !loggedIn);
  }
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    markAuth();
    if ((currentUser() && currentUser().id) || tries > 40) clearInterval(timer);
  }, 250);
})();
