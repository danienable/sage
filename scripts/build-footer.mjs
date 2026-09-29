import fs from "node:fs";
import path from "node:path";

const scriptDir = path.resolve("components/scripts");
const outDir = path.resolve("dist");

const footerFiles = [
  "mark-auth.js",
  "anon-enroll-i18n.js",
  "mark-course.js",
  "entitlement-gate-i18n.js",
  "stamp-page-types.js",
];

// Page-only scripts: paste with the matching HTML on that page, not in the footer.
const pageScripts = [
  {
    files: ["home-hero.js"],
    out: "home-hero-script.html",
    page: "main dashboard (/)",
    html: ["home-hero.html"],
  },
  {
    files: ["learner-greeting.js", "entitlement-ack.js"],
    out: "learner-dashboard-script.html",
    page: "learner dashboard (/learn/dashboard)",
    html: ["learner-greeting.html", "entitlement-ack.html"],
  },
];

function scriptBlock(file) {
  const src = fs.readFileSync(path.join(scriptDir, file), "utf8").trim();
  return `<script>\n${src}\n</script>`;
}

fs.mkdirSync(outDir, { recursive: true });

const footerOut = path.join(outDir, "tracking-scripts.html");
fs.writeFileSync(footerOut, `${footerFiles.map(scriptBlock).join("\n\n")}\n`);
console.log(`Wrote ${path.relative(process.cwd(), footerOut)}`);

for (const page of pageScripts) {
  const outFile = path.join(outDir, page.out);
  const html = page.html.map((name) => `components/${name}`).join(" and ");
  const note = `<!-- Paste on ${page.page} with ${html} -->\n`;
  fs.writeFileSync(outFile, `${note}${page.files.map(scriptBlock).join("\n\n")}\n`);
  console.log(`Wrote ${path.relative(process.cwd(), outFile)}`);
}
