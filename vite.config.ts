import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

// 自动导入 vue 中 hook reactive ref 等
import AutoImport from "unplugin-auto-import/vite";

// 自动导入 UI 组件
import Components from "unplugin-vue-components/vite";

// element
import {
  ElementPlusResolver,
  AntDesignVueResolver,
} from "unplugin-vue-components/resolvers";

export default defineConfig({
  // ⭐ GitHub Pages 项目路径
  base: "/my_vue-ts-pina-pc/",

  plugins: [
    vue(),

    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), "src/icons")],
      symbolId: "icon-[dir]-[name]",
    }),

    AutoImport({
      imports: ["vue", "vue-router"],
      dts: "src/auto-import.d.ts",
      resolvers: [ElementPlusResolver(), AntDesignVueResolver()],
    }),

    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: "sass",
        }),
        AntDesignVueResolver(),
      ],
    }),
  ],

  build: {
    // ⭐ 你的项目不是默认 dist
    outDir: "me-test",

    assetsDir: "static",

    target: "esnext",
  },

  server: {
    port: 5173,

    proxy: {
      "/api": {
        target: "http://192.168.1.104:8999/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },

    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue", "png"],
  },
});
