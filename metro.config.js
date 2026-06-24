const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// @supabase/supabase-js imports @opentelemetry/api optionally for tracing.
// It is not needed for web and Metro can't resolve it — stub it out.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@opentelemetry/api": require.resolve("./src/stubs/opentelemetry-api.js")
};

module.exports = config;
