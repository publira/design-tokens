/**
 * Turns the DTCG token files into Tailwind CSS v4 theme variables.
 *
 * `css/variables` with `@theme` as its selector is all it takes: Tailwind
 * reads `--color-*` and `--font-*` inside `@theme` as its own namespaces.
 */
export default {
  hooks: {
    fileHeaders: {
      generated: () => [
        "Generated from tokens/*.tokens.json by Style Dictionary.",
        "Do not edit: change the token files and run `pnpm build`.",
      ],
    },
  },
  platforms: {
    tailwind: {
      buildPath: "dist/",
      files: [
        {
          destination: "theme.css",
          format: "css/variables",
          options: {
            fileHeader: "generated",
            formatting: { commentPosition: "above" },
            selector: "@theme",
          },
        },
      ],
      transformGroup: "css",
    },
  },
  source: ["tokens/**/*.tokens.json"],
};
