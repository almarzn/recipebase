// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt().override("nuxt/rules", {
  rules: {
    "vue/require-default-prop": "off",
    "vue/no-multiple-template-root": "off",
    "vue/html-self-closing": "off",
  },
});
