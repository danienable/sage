# Sage University theme

This is the custom look and the extra page pieces for Sage University in Thought Industries.

You paste finished files into Thought Industries. You do not need to write code to change wording, translations, button links, or which products appear in the teal bar.

## What gets pasted where

Thought Industries has a few different boxes. Each file below belongs in one of them.

| What you want to update | File to paste | Where it goes in Thought Industries |
| --- | --- | --- |
| Colors, fonts, header, course page, widgets | `styles/custom-code.css` | Custom CSS for the site |
| Log-on sidebar, membership message, lesson icons | `dist/tracking-scripts.html` | Footer / tracking scripts. This runs on every page |
| Course sidebar wording (English) | `components/sidebars.html` | The course sidebar content |
| Homepage banner | `components/home-hero.html` and `dist/home-hero-script.html` | The main dashboard, the page at `/` |
| Learner dashboard banner and teal bar | `components/learner-greeting.html`, `components/entitlement-ack.html`, and `dist/learner-dashboard-script.html` | The learner dashboard, the page at `/learn/dashboard` |
| Log-on popup on a Panorama dashboard | `dist/logon-message.html` | A Custom HTML object on that dashboard. Also paste `styles/custom-code.css` into the site custom CSS |

Paste the whole file. On the learner dashboard, paste the script file once. It already contains both scripts.

## The pieces, in plain language

### Custom CSS

`styles/custom-code.css` is the whole visual theme: the black header, Sage green, fonts, course page, catalog cards, and the banners we added. One file covers the site.

### Footer scripts

`dist/tracking-scripts.html` is pasted once, in the footer, so it is present on every page. It does four jobs:

- Marks whether the visitor is logged in.
- On a course, shows either the normal enroll button or the membership-only message.
- Translates the log-on sidebar and the membership message to the browser language.
- Labels each lesson in the course menu so the right icon can show.

### Homepage banner

On `/`, the banner says hello and offers three shortcuts.

- `components/home-hero.html` is the banner itself. Change the greeting word, the question, and the button labels and links here.
- `dist/home-hero-script.html` moves that banner under the header and inserts the learner's first name. Do not type a person's name into the HTML. The empty name spot is filled automatically.

This banner is English only.

### Learner dashboard

On `/learn/dashboard`, two pieces stack under the header.

1. A teal bar, one line for each product the learner is entitled to. For example, "You are a Sage 50 Holder".
2. A black welcome banner: "Welcome Dani!", a question, a short line, and three buttons.

Files:

- `components/entitlement-ack.html` is the teal bar.
- `components/learner-greeting.html` is the welcome banner.
- `dist/learner-dashboard-script.html` places both pieces and fills in the name, the language, and the products. Paste this once.

### Course sidebar

`components/sidebars.html` has two blocks:

- Logged-out visitors see the log-on choices (existing user, new user, Sage colleague).
- Logged-in visitors who cannot start or buy the course see the membership message.

The footer scripts show the right block and swap in the translation.

### Log-on popup

On a Panorama dashboard, a card can pop up for learners who hold a certain product or live in a certain country.

`dist/logon-message.html` is the whole widget. Paste it into a Custom HTML object on that dashboard. Paste `styles/custom-code.css` into the site custom CSS as well.

The card stays hidden until the script can see the learner. It shows the first card in the file that fits that person, still has visits left, and has not passed its end date. A card that does not fit does not block the next one. Closing the card hides it for this visit. It comes back on a later visit until the visit limit or the end date.

The count is kept in that browser only. Another computer starts the count again.

The words on the card are what the learner reads. This popup does not translate them.

## Changing words

### Welcome banner and homepage banner

Edit the HTML file, then paste that file again on the page.

On the learner dashboard banner, the translations are the hidden lines at the top of `components/learner-greeting.html`. Each line is labeled with a language and which part of the banner it is:

- `hello` is the welcome word. The first name is added beside it. Do not type the name into this line.
- `prompt` is the question.
- `lead` is the sentence under the question.
- `learning`, `products`, and `strategy` are the three buttons.
- `nav` is the label for screen readers, not visible text.

Languages in use: `en`, `de`, `fr-FR`, `fr-CA`, `es`, `pt`.

The English lines lower down in the file are what shows for a moment before the script runs. Keep those in English, and keep them in step with the English translation lines.

Button links are the web addresses on those three buttons. Change the address there if a button should go somewhere else.

### Log-on popup

Open `components/logon-message.html`. Each card is one message. Learners see the first card in the file that still fits them.

- `data-id` is the card's name. Change it when you want the visit count to start over.
- `data-sublicenses` is the license ids, separated by commas. The id has to match the sublicense on the person, the same kind of id used on the teal bar. Leave this empty to ignore products.
- `data-countries` is the countries, separated by commas. Write every form the profile might use, such as `South Africa,ZA`. Capital letters do not matter. Leave this empty to ignore country.
- If you fill in both, the learner must match both. If you leave both empty, the card never shows.
- `data-max-shows` is how many visits may show the card. If you leave it off, the card shows once.
- `data-expires` is the last day the card may appear, written as `2026-12-31`. That day is still included. Leave it off for no end date.
- `data-variant` is `notice` for the webinar look, or `glow` for the assessment look.
- The button address is the link on the button. Leave it empty and the button stays hidden.

The two cards already in the file are examples. Replace the license id `REPLACE_WITH_MEMBERSHIP_LICENSE_ID`, the visit limit, the end date, and the button address before you use them.

If country on the profile is stored under a different name, add `data-country-field` on the outer `logon-messages` block with that field name.

After you change a card, ask a developer to rebuild, then paste `dist/logon-message.html` again. A look change is a separate paste of `styles/custom-code.css`.

### Teal entitlement bar

Open `components/entitlement-ack.html`.

The catalog is the list of products. Each item has a license id and the name learners should see. The id has to match the sublicense on the person. The name is what gets dropped into the sentence. To add a product, add another line in that list with its license id and display name.

The templates are the sentence in each language. `{name}` is the spot where the product name goes. Keep `{name}` in every sentence.

The bar stays hidden if the learner holds none of the licenses in the catalog.

### Course sidebar translations

The English fallback is in `components/sidebars.html`.

The other languages are written inside the footer scripts:

- Log-on sidebar: `components/scripts/anon-enroll-i18n.js`
- Membership message: `components/scripts/entitlement-gate-i18n.js`

Those two files are combined into `dist/tracking-scripts.html` when the scripts are rebuilt. After a wording change there, paste the new `dist/tracking-scripts.html` into the footer.

## How the language is chosen

On the learner dashboard (welcome banner and teal bar):

1. The language saved on the learner, if there is one.
2. Otherwise the browser language.
3. Otherwise English.

On the course sidebar, the browser language is used, then English.

French Canada (`fr-CA`) is kept separate from French in France (`fr-FR`).

## What not to edit by hand

The files in `dist/` are the paste-ready files. They are built from the files in `components/`.

- Changing banner HTML or the CSS does not need a rebuild. Paste the HTML or CSS file you edited.
- Changing a script does need a rebuild, then a fresh paste of the matching file in `dist/`. Ask a developer to run the build if you are not set up to do that.
- Changing the log-on popup does need a rebuild. The paste file is `dist/logon-message.html`, and it includes the script.

Do not type a learner's name into the HTML. The script reads the first name from their profile.

## If something looks wrong

- The first name is missing. The profile has no first name yet, or the page script was not pasted.
- The teal bar is missing. That learner does not hold one of the licenses listed in the catalog, or the license id on the catalog line does not match.
- The wrong language is showing. A language saved on the learner wins over the browser on the dashboard. The course sidebar follows the browser.
- The account menu sits in the wrong place, or the header looks off. That lives in `styles/custom-code.css`. Paste the latest copy of that file.
- The log-on popup never appears. That learner does not match the license or country on a card that still has visits left, the end date has passed, or this browser has already used the visit limit. A card with no license and no country stays hidden.
- The log-on popup shows to the wrong people. Check the license id against the sublicense on the person, and list every country spelling the profile uses.
