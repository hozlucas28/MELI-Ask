import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import { getProduct, getProductComments } from "../api"
import { AskForm } from "../components/AskForm"
import { QuestionsList } from "../components/QuestionsList"

import type { Comment, Product } from "../types"

const currencyFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
})

function ProductPage() {
    const { productId } = useParams()
    const [product, setProduct] = useState<Product | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!productId) return
        let isActive = true

        Promise.all([getProduct(productId), getProductComments(productId)])
            .then(([nextProduct, nextComments]) => {
                if (!isActive) return
                setProduct(nextProduct)
                setComments(nextComments)
            })
            .catch(requestError => {
                if (isActive) setError(requestError instanceof Error ? requestError.message : "No se pudo cargar el producto.")
            })
            .finally(() => {
                if (isActive) setIsLoading(false)
            })

        return () => {
            isActive = false
        }
    }, [productId])

    if (!productId) return null

    return (
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800" to="/">
                <span aria-hidden="true">←</span> Volver a productos
            </Link>

            {isLoading && <div className="mt-8 h-80 animate-pulse rounded-3xl bg-slate-200" aria-label="Cargando producto" />}
            {error && <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">{error}</div>}

            {product && (
                <>
                    <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                            <div className="relative grid min-h-64 place-items-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-yellow-50 lg:min-h-96">
                                <div className="absolute -left-14 -top-20 size-52 rounded-full border-[28px] border-blue-100" />
                                <div className="absolute -bottom-16 -right-10 size-48 rounded-full bg-[#ffe600]/60 blur-sm" />
                                <span className="relative text-8xl font-black text-blue-600/15">{product.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="p-7 sm:p-10">
                                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">Información del producto</p>
                                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{product.name}</h1>
                                <p className="mt-5 text-lg leading-8 text-slate-600">{product.description}</p>
                                <p className="mt-8 text-4xl font-light tracking-tight">{currencyFormatter.format(product.price)}</p>

                                <dl className="mt-8 grid gap-4 border-t border-slate-100 pt-6 text-sm sm:grid-cols-2">
                                    <div>
                                        <dt className="font-bold text-slate-400">ID del producto</dt>
                                        <dd className="mt-1 truncate font-mono text-xs text-slate-700" title={product.id}>{product.id}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-bold text-slate-400">Vendedor</dt>
                                        <dd className="mt-1 truncate font-mono text-xs text-slate-700" title={product.ownerId}>{product.ownerId}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </section>

                    <div className="mt-8">
                        <AskForm productId={product.id} />
                    </div>

                    <section className="mt-12 pb-12">
                        <div className="mb-6">
                            <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">Comunidad</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight">Preguntas y respuestas</h2>
                            <p className="mt-2 text-sm text-slate-500">{comments.length} {comments.length === 1 ? "pregunta publicada" : "preguntas publicadas"}</p>
                        </div>
                        <QuestionsList comments={comments} ownerId={product.ownerId} />
                    </section>
                </>
            )}
        </div>
    )
}

export { ProductPage }
