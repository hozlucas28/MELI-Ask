import { Link } from "react-router"

import type { Product } from "../types"

type ProductCardProps = {
    product: Product
}

const currencyFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
})

function ProductCard({ product }: ProductCardProps) {
    return (
        <Link
            className="group flex min-h-72 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/10"
            to={`/products/${product.id}`}
        >
            <div className="relative grid h-32 place-items-center overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="absolute -right-10 -top-12 size-32 rounded-full border-[18px] border-[#ffe600]/70" />
                <span className="relative text-5xl font-black text-blue-600/20">{product.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Producto destacado</p>
                <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-700">{product.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>
                <div className="mt-auto flex items-end justify-between pt-6">
                    <p className="text-2xl font-light tracking-tight">{currencyFormatter.format(product.price)}</p>
                    <span className="grid size-9 place-items-center rounded-full bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white" aria-hidden="true">
                        →
                    </span>
                </div>
            </div>
        </Link>
    )
}

export { ProductCard }
