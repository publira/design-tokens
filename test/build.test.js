import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

/** The Tailwind CLI, run through this Node rather than looked up on `PATH`. */
const TAILWIND_CLI = fileURLToPath(
  new URL(
    "dist/index.mjs",
    import.meta.resolve("@tailwindcss/cli/package.json")
  )
);

const ROLES = [
  "background",
  "foreground",
  "surface",
  "surface-foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "accent",
  "accent-foreground",
  "muted",
  "muted-foreground",
  "border",
  "input",
  "ring",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "destructive",
  "destructive-foreground",
  "info",
  "info-foreground",
];

/** Builds a fixture through the package's own `exports` with the Tailwind CLI. */
const build = (fixture) => {
  const output = path.join(
    mkdtempSync(path.join(tmpdir(), "design-tokens-")),
    "out.css"
  );
  execFileSync(
    process.execPath,
    [
      TAILWIND_CLI,
      "--input",
      path.join(import.meta.dirname, fixture),
      "--output",
      output,
    ],
    { stdio: "pipe" }
  );
  return readFileSync(output, "utf-8");
};

const css = build("fixture.css");

test("every semantic role has a color token and utilities", () => {
  for (const role of ROLES) {
    assert.match(css, new RegExp(`--color-${role}: #[0-9a-f]{6};`, "u"), role);
    assert.match(
      css,
      new RegExp(String.raw`\.bg-${role} \{`, "u"),
      `bg-${role}`
    );
    assert.match(
      css,
      new RegExp(String.raw`\.text-${role} \{`, "u"),
      `text-${role}`
    );
  }
});

test("font stacks are replaced with the Publira stacks", () => {
  assert.match(css, /--font-sans: ['"]Hiragino Sans['"],/u);
  assert.match(css, /--font-serif: ['"]Hiragino Mincho ProN['"],/u);
});

test("the rest of Tailwind's default theme is left alone", () => {
  assert.match(css, /--font-mono: ui-monospace,/u);
  assert.match(css, /--spacing: 0\.25rem;/u);
  assert.match(css, /--radius-md: 0\.375rem;/u);
  assert.match(css, /--text-sm: 0\.875rem;/u);
});

const readTokens = (file) =>
  JSON.parse(
    readFileSync(path.join(import.meta.dirname, "../tokens", file), "utf-8")
  );

test("the token files define only color and font groups", () => {
  assert.deepEqual(Object.keys(readTokens("color.tokens.json")), ["color"]);
  assert.deepEqual(Object.keys(readTokens("font.tokens.json")), ["font"]);
});

test("every color token is a DTCG sRGB color whose hex matches its components", () => {
  const { color } = readTokens("color.tokens.json");
  assert.equal(color.$type, "color");
  const tokens = Object.entries(color).filter(
    ([name]) => !name.startsWith("$")
  );
  assert.deepEqual(
    tokens.map(([name]) => name),
    ROLES
  );
  for (const [name, { $value }] of tokens) {
    assert.equal($value.colorSpace, "srgb", name);
    const hex = `#${$value.components
      .map((c) =>
        Math.round(c * 255)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")}`;
    assert.equal(hex, $value.hex, name);
  }
});

test("every font token is a DTCG font family stack", () => {
  const { font } = readTokens("font.tokens.json");
  assert.equal(font.$type, "fontFamily");
  for (const name of ["sans", "serif"]) {
    assert.ok(Array.isArray(font[name].$value), name);
  }
});

/** WCAG 2.1 relative luminance of an sRGB color given as `components`. */
const luminance = (components) => {
  const [r, g, b] = components.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [dark, light] = [luminance(a), luminance(b)].toSorted((x, y) => x - y);
  return (light + 0.05) / (dark + 0.05);
};

test("every fill and its foreground reach 4.5:1", () => {
  const { color } = readTokens("color.tokens.json");
  for (const role of ROLES.filter((name) =>
    ROLES.includes(`${name}-foreground`)
  )) {
    const ratio = contrast(
      color[role].$value.components,
      color[`${role}-foreground`].$value.components
    );
    assert.ok(ratio >= 4.5, `${role}: ${ratio.toFixed(2)}:1`);
  }
});

test("the input edge reaches 3:1 against every surface a control sits on", () => {
  const { color } = readTokens("color.tokens.json");
  for (const surface of ["background", "surface", "card", "popover"]) {
    const ratio = contrast(
      color.input.$value.components,
      color[surface].$value.components
    );
    assert.ok(ratio >= 3, `${surface}: ${ratio.toFixed(2)}:1`);
  }
});
