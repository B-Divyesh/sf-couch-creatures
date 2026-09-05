import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const appRoutes = new Set(["/", "/demo", "/privacy", "/terms", "/controller"]);

export default defineConfig({
  plugins: [
    {
      name: "couch-creatures-development-404",
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          const pathname = new URL(
            request.url || "/",
            "http://couch-creatures.local",
          ).pathname;
          const wantsDocument = request.headers.accept?.includes("text/html");
          if (
            request.method === "GET" &&
            wantsDocument &&
            !appRoutes.has(pathname) &&
            !pathname.includes(".")
          ) {
            response.statusCode = 404;
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.end(
              readFileSync(resolve(process.cwd(), "public/404.html"), "utf8"),
            );
            return;
          }
          next();
        });
      },
    },
  ],
  build: { target: "es2022", sourcemap: false },
  server: {
    port: 4173,
    proxy: { "/api": "http://127.0.0.1:8787" },
  },
});
