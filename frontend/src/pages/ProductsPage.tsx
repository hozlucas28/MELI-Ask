import { useEffect, useState } from "react"
import { getProducts } from "../api"
import { ProductCard } from "../components/ProductCard"

import type { Product } from "../types"

function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const controller = new AbortController()

        getProducts()
            .then(setProducts)
            .catch(requestError => {
                if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : "No se pudieron cargar los productos.")
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsLoading(false)
            })

        return () => controller.abort()
    }, [])

    return (
        <>
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
                    <div className="max-w-3xl">
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-600">Catálogo inteligente</p>
                        <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">Encontrá el producto y preguntá lo que necesites.</h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                            Explorá los productos, revisá consultas reales y obtené respuestas basadas en lo que ya confirmó cada vendedor.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Disponibles ahora</p>
                        <h2 className="mt-1 text-2xl font-black tracking-tight">Productos</h2>
                    </div>
                    {!isLoading && !error && <span className="text-sm font-medium text-slate-500">{products.length} resultados</span>}
                </div>

                {isLoading && <ProductsSkeleton />}
                {error && <ErrorMessage message={error} />}
                {!isLoading && !error && (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map(product => <ProductCard key={product.id} product={product} />)}
                    </div>
                )}
            </section>
        </>
    )
}

function ProductsSkeleton() {
    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cargando productos">
            {[0, 1, 2].map(item => <div className="h-72 animate-pulse rounded-2xl bg-slate-200" key={item} />)}
        </div>
    )
}

function ErrorMessage({ message }: { message: string }) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">{message}</div>
}

export { ProductsPage }
