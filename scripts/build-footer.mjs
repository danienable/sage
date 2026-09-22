import fs from "node:fs";
import path from "node:path";

const scriptDir = path.resolve("components/scripts");
const outFile = path.resolve("dist/tracking-scripts.html");

const files = [
  "mark-auth.js",
  "anon-enroll-i18n.js",
  "mark-course.js",
  "entitlement-gate-i18n.js",
  "stamp-page-types.js",
];

const blocks = files.map((file) => {
  const src = fs.readFileSync(path.join(scriptDir, file), "utf8").trim();
  return `<script>\n${src}\n</script>`;
});

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${blocks.join("\n\n")}\n`);
console.log(`Wrote ${path.relative(process.cwd(), outFile)}`);
