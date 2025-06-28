import typescript from "@rollup/plugin-typescript";
export default {
  input: "src/index.ts",
  output: [
    { file: "dist/ddg-ai.cjs.js", format: "cjs" },
    { file: "dist/ddg-ai.esm.js", format: "esm" },
    { file: "dist/ddg-ai.umd.js", format: "umd", globals: {jsdom: 'jsdom'}, name: "DuckDuckGoAI" },
  ],
  plugins: [typescript()],
};
