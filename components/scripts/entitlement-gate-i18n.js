(function () {
  var strings = {
    en: {
      heading: "Exclusive Learning Membership Access",
      body: "This learning is reserved for Learning Membership holders. Unlock this course and our full premium catalog with a Learning Membership.",
      noteBefore: "Explore the ",
      link: "Membership",
      noteAfter: " tab to learn more."
    },
    de: {
      heading: "Exklusiver Zugang zur Learning Membership",
      body: "Diese Schulung ist Inhabern einer Learning Membership vorbehalten. Schalten Sie diesen Kurs und unseren gesamten Premium-Katalog mit einer Learning Membership frei.",
      noteBefore: "Weitere Informationen finden Sie im Tab ",
      link: "Membership",
      noteAfter: "."
    },
    "fr-FR": {
      heading: "Accès exclusif Learning Membership",
      body: "Cette formation est réservée aux titulaires d’une Learning Membership. Débloquez ce cours et l’ensemble de notre catalogue premium avec une Learning Membership.",
      noteBefore: "Consultez l’onglet ",
      link: "Membership",
      noteAfter: " pour en savoir plus."
    },
    "fr-CA": {
      heading: "Accès exclusif Learning Membership",
      body: "Cette formation est réservée aux titulaires d’une Learning Membership. Débloquez ce cours et l’ensemble de notre catalogue premium avec une Learning Membership.",
      noteBefore: "Consultez l’onglet ",
      link: "Membership",
      noteAfter: " pour en savoir plus."
    },
    es: {
      heading: "Acceso exclusivo Learning Membership",
      body: "Esta formación está reservada a los titulares de una Learning Membership. Desbloquee este curso y todo nuestro catálogo premium con una Learning Membership.",
      noteBefore: "Consulte la pestaña ",
      link: "Membership",
      noteAfter: " para obtener más información."
    },
    pt: {
      heading: "Acesso exclusivo Learning Membership",
      body: "Este aprendizado é reservado aos titulares da Learning Membership. Desbloqueie este curso e todo o nosso catálogo premium com uma Learning Membership.",
      noteBefore: "Explore a aba ",
      link: "Membership",
      noteAfter: " para saber mais."
    }
  };

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

  function setText(el, value) {
    if (el && value != null) el.textContent = value;
  }

  function apply() {
    var root = document.querySelector(".entitlement-gate");
    if (!root) return false;
    var t = strings[detectLang()] || strings.en;
    setText(root.querySelector(".entitlement-gate__heading"), t.heading);
    setText(root.querySelector(".entitlement-gate__body"), t.body);
    setText(root.querySelector(".entitlement-gate__note-before"), t.noteBefore);
    setText(root.querySelector(".entitlement-gate__link"), t.link);
    setText(root.querySelector(".entitlement-gate__note-after"), t.noteAfter);
    return true;
  }

  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (apply() || tries > 40) clearInterval(timer);
  }, 250);
})();
