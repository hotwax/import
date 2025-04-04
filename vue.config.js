const path = require('path')
require("@hotwax/app-version-info")
module.exports = {
  pwa: {
    name: "Import - HotWax Commerce",
    themeColor: "#FFFFFF",
    manifestOptions: {
      short_name: "Import",
      start_url: "./"
    },
    id: "/",
    display: "standalone",
    background_color: "#000000"
  },
  configureWebpack: {
    resolve: {
      alias: {
        vue: path.resolve('./node_modules/vue')
      }
    }
  },
  runtimeCompiler: true,
  transpileDependencies: ['@hotwax/dxp-components']
}
