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
  { file: "home-hero.js", out: "home-hero-script.html", page: "main dashboard (/)" },
  { file: "learner-greeting.js", out: "learner-greeting-script.html", page: "learner dashboard (/learn/dashboard)" },
  { file: "entitlement-ack.js", out: "entitlement-ack-script.html", page: "main dashboard (/)" },
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
  const note = `<!-- Paste on ${page.page} with components/${page.file.replace(/\.js$/, ".html")} -->\n`;
  fs.writeFileSync(outFile, `${note}${scriptBlock(page.file)}\n`);
  console.log(`Wrote ${path.relative(process.cwd(), outFile)}`);
}
