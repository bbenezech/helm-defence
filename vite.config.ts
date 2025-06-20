import { defineConfig } from "vite";
import bodyParser from "body-parser";
import react from "@vitejs/plugin-react";
import { IncomingMessage } from "http";

const prod = process.env.NODE_ENV === "production";
const dev = !prod;
const host = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "9000");
const ReactCompilerConfig = {};

export default defineConfig(({ mode }) => ({
  base: mode === "gh-pages" ? `/helm-defense/` : "./",
  server: {
    host,
    port,
    open: mode === "web",
    strictPort: true,
    sourcemapIgnoreList: () => true,
    watch: {
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/build/**",
        "**/.github/**",
        "**/.vscode/**",
        "**/assets/**",
        "**/public/**",
      ],
    },
  },
  clearScreen: false,
  build: { chunkSizeWarningLimit: 2000, sourcemap: false },
  hmr: host ? { protocol: "ws", host, port: port + 1 } : undefined,
  esbuild: { sourcemap: false },
  plugins: dev
    ? [
        react({ babel: { plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]] } }),
        {
          name: "log-viewer-middleware",
          configureServer(server) {
            server.middlewares.use(bodyParser.json());
            server.middlewares.use("/api/log", (req: IncomingMessage, res, next) => {
              if (req.method === "POST") {
                // @ts-expect-error no body in IncomingMessage?
                console.log("[Client]:", ...(req.body?.messages ?? []));
                res.statusCode = 200;
                res.end();
              } else {
                next();
              }
            });
          },
        },
      ]
    : [react({ babel: { plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]] } })],
}));
