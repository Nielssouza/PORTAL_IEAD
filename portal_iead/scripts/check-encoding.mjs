import fs from "fs";
import path from "path";

const root = process.cwd();
const targets = [path.join(root, "src")];
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".json", ".md", ".mjs"]);
const ignoreDirs = new Set(["node_modules", ".next", ".git"]);

const mojibakeRegexes = [
  /\uFFFD/,
  /\u00c3[\u00a1-\u00bf]/,
  /\u00c2[\u00a1-\u00bf]/,
];

const letterQuestionLetter = /[A-Za-z\u00c0-\u00ff]\?[A-Za-z\u00c0-\u00ff]/;
const stringLiteralRegex = /(["'`])((?:\\.|(?!\1).)*)\1/g;
const regexLiteralRegex = /\/(?:\\.|[^\/])+\/(?:[gimsuy])*/g;

const issues = [];

function shouldScan(filePath) {
  const ext = path.extname(filePath);
  return exts.has(ext);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoreDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && shouldScan(fullPath)) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  let text = "";
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    issues.push({ filePath, line: 0, message: "Falha ao ler arquivo como UTF-8." });
    return;
  }

  for (const regex of mojibakeRegexes) {
    if (regex.test(text)) {
      issues.push({ filePath, line: 0, message: "Possivel caractere corrompido (mojibake ou substituicao)." });
      break;
    }
  }

  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (!line.includes("?")) return;

    for (const match of line.matchAll(stringLiteralRegex)) {
      const content = match[2];
      if (letterQuestionLetter.test(content)) {
        issues.push({
          filePath,
          line: index + 1,
          message: "Possivel caractere perdido em string (ex: mae -> m?e).",
          snippet: content.trim().slice(0, 120),
        });
        return;
      }
    }

    const sanitized = line.replace(regexLiteralRegex, "");
    if (letterQuestionLetter.test(sanitized)) {
      issues.push({
        filePath,
        line: index + 1,
        message: "Possivel caractere perdido em texto (ex: mae -> m?e).",
        snippet: sanitized.trim().slice(0, 120),
      });
    }
  });
}

for (const target of targets) {
  if (fs.existsSync(target)) {
    walk(target);
  }
}

if (issues.length > 0) {
  console.error("\nErros de codificacao encontrados:\n");
  for (const issue of issues) {
    const location = issue.line ? `${issue.filePath}:${issue.line}` : issue.filePath;
    console.error(`- ${location}: ${issue.message}`);
    if (issue.snippet) {
      console.error(`  -> ${issue.snippet}`);
    }
  }
  process.exit(1);
} else {
  console.log("Nenhum problema de codificacao encontrado.");
}
