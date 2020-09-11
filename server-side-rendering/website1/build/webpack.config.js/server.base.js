const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const fs = require("fs");
const ModuleFederationPlugin = require("webpack").container
  .ModuleFederationPlugin;
const common = require("./common.base");
const { server: serverLoaders } = require("./loaders");
const plugins = require("./plugins");
const config = require("../config");

const { serverPath } = config[process.env.NODE_ENV || "development"];
const remotePath = path.resolve(
    __dirname,
    "../../../website2/buildServer/container.js"
)
module.exports = merge.smart(common, {
  name: "server",
  target: "async-node",
  entry: ["@babel/polyfill", path.resolve(__dirname, "../../server/index.js")],
  output: {
    path: serverPath,
    filename: "[name].js",
    libraryTarget: "commonjs2",
  },
  externals: ["enhanced-resolve"],
  module: {
    rules: serverLoaders,
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    ...plugins.server,
    new webpack.HotModuleReplacementPlugin(),
    new ModuleFederationPlugin({
      name: "website1",
      library: { type: "commonjs2" },
      filename: "container.js",
      remotes: {
        website2: {
          // we dont need to do this, just intersting to see in action
          external: `promise new Promise((resolve)=>{ console.log('requring remote');delete require.cache['${remotePath}']; resolve(require('${remotePath}')) })`
        },
      },
      shared: ["react", "react-dom"],
    }),
  ],
  stats: {
    colors: true,
  },
});
