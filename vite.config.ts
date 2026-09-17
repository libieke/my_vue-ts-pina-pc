import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

import AutoImport from "unplugin-auto-import/vite";

import Components from "unplugin-vue-components/vite";

import {
  ElementPlusResolver,
  AntDesignVueResolver,
} from "unplugin-vue-components/resolvers";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: env.VITE_BASE_URL || "/",

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
  };
});