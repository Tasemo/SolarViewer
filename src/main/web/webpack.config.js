const path = require("path");

module.exports = {
  mode: "production",
  entry: "./js/main.js",
  devtool: 'source-map',
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "js")
  }
};