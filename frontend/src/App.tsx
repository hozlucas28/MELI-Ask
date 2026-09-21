import { Link, Route, Routes } from "react-router"
import { ProductPage } from "./pages/ProductPage"
import { ProductsPage } from "./pages/ProductsPage"

function App() {
    return (
        <div className="min-h-screen bg-[#f5f5f5] text-slate-900">
            <header className="border-b border-black/10 bg-[#ffe600]">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
                    <Link className="group flex items-center gap-3" to="/" aria-label="Ir al inicio">
                        <span className="grid size-10 place-items-center rounded-full bg-slate-900 text-lg font-black text-[#ffe600] transition-transform group-hover:-rotate-6">
                            M
                        </span>
                        <div>
                            <p className="text-xl font-black leading-none tracking-tight">MELI Ask</p>
                            <p className="mt-1 text-xs font-medium text-slate-700">Comprá con respuestas claras</p>
                        </div>
                    </Link>
                    <span className="hidden rounded-full border border-black/15 bg-white/40 px-3 py-1 text-xs font-semibold text-slate-700 sm:block">
                        Asistente con IA
                    </span>
                </div>
            </header>

            <main>
                <Routes>
                    <Route index element={<ProductsPage />} />
                    <Route path="products/:productId" element={<ProductPage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </div>
    )
}

function NotFound() {
    return (
        <section className="mx-auto max-w-3xl px-5 py-24 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">404</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Esta página no existe</h1>
            <Link className="mt-8 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700" to="/">
                Volver a productos
            </Link>
        </section>
    )
}

export { App }
