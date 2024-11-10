const rewire = require("rewire");
const defaults = rewire("react-scripts/scripts/build.js");
const originalConfigFactory = defaults.__get__("configFactory");

defaults.__set__("configFactory", (env) => {
  const config = originalConfigFactory(env);
  config.module.rules = config.module.rules.map((rule) => {
    if (rule.oneOf instanceof Array) {
      rule.oneOf[rule.oneOf.length - 1].exclude = [
        /\.(js|mjs|jsx|cjs|ts|tsx)$/,
        /\.html$/,
        /\.json$/,
      ];
    }
    return rule;
  });
  return config;
});
