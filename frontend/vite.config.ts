import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
    const environment = loadEnv(mode, ".", "")

    return {
        plugins: [react(), tailwindcss()],
        server: {
            host: "0.0.0.0",
            port: 5173,
            proxy: {
                "/api": {
                    changeOrigin: true,
                    target: environment.VITE_API_PROXY_TARGET || "http://localhost:3000"
                }
            }
        }
    }
})
