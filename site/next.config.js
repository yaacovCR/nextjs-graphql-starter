const withPlugins = require('next-compose-plugins');
const bundleAnalyzer = require('@zeit/next-bundle-analyzer');

const nextConfig = {
  publicRuntimeConfig: {
    // Will be available on both server and client
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
    WS_ENDPOINT: process.env.WS_ENDPOINT,
  },
};

module.exports = withPlugins(
  [
    [
      bundleAnalyzer,
      {
        analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
        analyzeBrowser: ['browser', 'both'].includes(
          process.env.BUNDLE_ANALYZE
        ),
        bundleAnalyzerConfig: {
          server: {
            analyzerMode: 'static',
            reportFilename: '../analysis/server-bundle-analysis.html',
          },
          browser: {
            analyzerMode: 'static',
            reportFilename: '../analysis/browser-bundle-analysis.html',
          },
        },
      },
    ],
  ],
  nextConfig
);
