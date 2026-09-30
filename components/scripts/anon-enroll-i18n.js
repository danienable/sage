/*
  Site-wide. Included in dist/tracking-scripts.html, which is pasted in the footer.
  Translates the logged-out course sidebar (components/sidebars.html) to match the browser language.
  Edit the sentences in the list below. The visible English in the HTML is only the fallback.
*/
(function () {
  /* One set of sidebar sentences per language. */
  var strings = {
    en: {
      heading: "Ready to begin?",
      intro: "To browse training, access entitlements, and/or view pricing, log on.",
      existingTitle: "Existing User (Log On)",
      existingDesc: "Already have a Sage University profile, log on.",
      newTitle: "New User (Create a profile)",
      newDesc: "To access learning, create a profile using your Organization’s Account Number with Sage.",
      colleagueTitle: "Sage Colleague",
      colleagueDesc: "Access learning with your colleague log on details."
    },
    de: {
      heading: "Bereit zu starten?",
      intro: "Um Schulungen zu durchsuchen, Berechtigungen abzurufen und/oder Preise anzuzeigen, melden Sie sich an.",
      existingTitle: "Bestehender Benutzer (Anmelden)",
      existingDesc: "Sie haben bereits ein Sage University-Profil? Dann melden Sie sich an.",
      newTitle: "Neuer Benutzer (Profil erstellen)",
      newDesc: "Um auf Schulungen zuzugreifen, erstellen Sie ein Profil mit der Kontonummer Ihrer Organisation bei Sage.",
      colleagueTitle: "Sage-Kollege",
      colleagueDesc: "Greifen Sie mit Ihren Kollegendaten auf die Schulungen zu."
    },
    "fr-FR": {
      heading: "Prêt à commencer ?",
      intro: "Pour parcourir les formations, accéder à vos droits et/ou consulter les tarifs, veuillez vous connecter.",
      existingTitle: "Utilisateur existant (Connexion)",
      existingDesc: "Vous avez déjà un profil Sage University ? Connectez-vous.",
      newTitle: "Nouvel utilisateur (Créer un profil)",
      newDesc: "Pour accéder aux formations, créez un profil à l’aide du numéro de compte Sage de votre organisation.",
      colleagueTitle: "Collaborateur Sage",
      colleagueDesc: "Accédez aux formations avec vos identifiants collaborateur."
    },
    "fr-CA": {
      heading: "Prêt à commencer ?",
      intro: "Pour parcourir les formations, accéder à vos droits et/ou consulter les tarifs, veuillez ouvrir une session.",
      existingTitle: "Utilisateur existant (Ouvrir une session)",
      existingDesc: "Vous avez déjà un profil Sage University? Ouvrez une session.",
      newTitle: "Nouvel utilisateur (Créer un profil)",
      newDesc: "Pour accéder à la formation, créez un profil à l’aide du numéro de compte Sage de votre organisation.",
      colleagueTitle: "Collègue Sage",
      colleagueDesc: "Accédez à la formation avec vos informations de connexion de collègue."
    },
    es: {
      heading: "¿Listo para empezar?",
      intro: "Para explorar la formación, acceder a sus derechos y/o ver los precios, inicie sesión.",
      existingTitle: "Usuario existente (Iniciar sesión)",
      existingDesc: "Si ya tiene un perfil de Sage University, inicie sesión.",
      newTitle: "Usuario nuevo (Crear un perfil)",
      newDesc: "Para acceder a la formación, cree un perfil con el número de cuenta de Sage de su organización.",
      colleagueTitle: "Colega de Sage",
      colleagueDesc: "Acceda a la formación con sus datos de acceso de colega."
    },
    pt: {
      heading: "Pronto para começar?",
      intro: "Para navegar pelos treinamentos, acessar direitos e/ou ver preços, entre.",
      existingTitle: "Usuário existente (Entrar)",
      existingDesc: "Já tem um perfil da Sage University? Entre.",
      newTitle: "Novo usuário (Criar um perfil)",
      newDesc: "Para acessar o aprendizado, crie um perfil usando o número da conta da sua organização na Sage.",
      colleagueTitle: "Colega Sage",
      colleagueDesc: "Acesse o aprendizado com os dados de login de colega."
    }
  };

  /* Turns a browser language tag into one of the sets above. */
  function mapLang(lang) {
    if (!lang) return null;
    var l = String(lang).toLowerCase().replace("_", "-");
    if (l === "fr-ca" || l.indexOf("fr-ca") === 0) return "fr-CA";
    if (l.indexOf("fr") === 0) return "fr-FR";
    if (l.indexOf("de") === 0) return "de";
    if (l.indexOf("es") === 0) return "es";
    if (l.indexOf("pt") === 0) return "pt";
    if (l.indexOf("en") === 0) return "en";
    return null;
  }

  /* Uses the browser language, then English. */
  function detectLang() {
    var list =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || navigator.userLanguage || "en"];
    for (var i = 0; i < list.length; i++) {
      var mapped = mapLang(list[i]);
      if (mapped) return mapped;
    }
    return "en";
  }

  /* Replaces a line only when the translation is different. */
  function setText(el, value) {
    if (el && value && el.textContent !== value) el.textContent = value;
  }

  /* Writes the translated sidebar, if that block is on the page. */
  function apply() {
    var root = document.querySelector(".anon-enroll");
    if (!root) return false;

    var t = strings[detectLang()] || strings.en;
    var items = root.querySelectorAll(".anon-enroll__item");

    setText(root.querySelector(".anon-enroll__heading"), t.heading);
    setText(root.querySelector(".anon-enroll__intro"), t.intro);

    if (items[0]) {
      setText(items[0].querySelector(".anon-enroll__item-title"), t.existingTitle);
      setText(items[0].querySelector(".anon-enroll__item-desc"), t.existingDesc);
    }
    if (items[1]) {
      setText(items[1].querySelector(".anon-enroll__item-title"), t.newTitle);
      setText(items[1].querySelector(".anon-enroll__item-desc"), t.newDesc);
    }
    if (items[2]) {
      setText(items[2].querySelector(".anon-enroll__item-title"), t.colleagueTitle);
      setText(items[2].querySelector(".anon-enroll__item-desc"), t.colleagueDesc);
    }

    return true;
  }

  /* Course pages change without a full reload, so keep the translation applied. */
  setInterval(apply, 500);
  apply();
})();
