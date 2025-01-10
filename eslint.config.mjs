// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import tailwind from "eslint-plugin-tailwindcss";

export default withNuxt()
  .append(tailwind.configs["flat/recommended"])
  .override("nuxt/rules", {
    rules: {
      "vue/require-default-prop": "off",
      "vue/no-multiple-template-root": "off",
    },
  });
