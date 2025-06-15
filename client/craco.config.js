// client/craco.config.js
const webpack = require('webpack');

module.exports = {
  webpack: {
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          process: 'process/browser.js', // Cung cấp 'process'
          Buffer: ['buffer', 'Buffer'],  // Cung cấp 'Buffer' (thường cũng cần thiết)
        }),
      ],
    },
    configure: (webpackConfig, { env, paths }) => {
      // Thêm fallback cho các module Node.js core nếu cần
      // Nhiều thư viện trong hệ sinh thái Ethereum có thể cần những cái này
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback, // Giữ lại các fallback hiện có nếu có
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "assert": require.resolve("assert/"),
        "url": require.resolve("url/"),
        "zlib": require.resolve("browserify-zlib"),
        "path": require.resolve("path-browserify"),
        // "fs": false, // Nếu một thư viện nào đó cố import 'fs' và bạn không cần nó ở client
        // "net": false,
        // "tls": false,
      };
      return webpackConfig;
    },
  },
};