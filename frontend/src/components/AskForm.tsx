import { useRef, useState } from "react"
import { streamProductAnswer } from "../api"

type AskFormProps = {
    productId: string
}

function AskForm({ productId }: AskFormProps) {
    const [question, setQuestion] = useState("")
    const [answer, setAnswer] = useState("")
    const [error, setError] = useState("")
    const [isStreaming, setIsStreaming] = useState(false)
    const controllerRef = useRef<AbortController | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault()
        const normalizedQuestion = question.trim()
        if (normalizedQuestion.length < 4) {
            setError("La pregunta debe tener al menos 4 caracteres.")

            return
        }

        controllerRef.current?.abort()
        const controller = new AbortController()
        controllerRef.current = controller
        setAnswer("")
        setError("")
        setIsStreaming(true)

        try {
            await streamProductAnswer({
                productId,
                question: normalizedQuestion,
                signal: controller.signal,
                onDelta: delta => setAnswer(current => current + delta)
            })
        } catch (streamError) {
            if (controller.signal.aborted) return
            setError(streamError instanceof Error ? streamError.message : "No se pudo generar una respuesta.")
        } finally {
            if (controllerRef.current === controller) setIsStreaming(false)
        }
    }

    return (
        <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-slate-950/10">
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
                <div>
                    <span className="inline-flex rounded-full bg-[#ffe600] px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-slate-950">Respuesta inteligente</span>
                    <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight">¿Tenés una duda sobre este producto?</h2>
                    <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                        Preguntá en lenguaje natural. El asistente consulta las respuestas verificadas del vendedor y te responde en tiempo real.
                    </p>
                </div>

                <div>
                    <form onSubmit={handleSubmit}>
                        <label className="sr-only" htmlFor="product-question">Tu pregunta</label>
                        <textarea
                            id="product-question"
                            className="min-h-32 w-full resize-none rounded-2xl border border-white/15 bg-white/10 p-4 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-[#ffe600] focus:ring-4 focus:ring-[#ffe600]/10"
                            maxLength={1024}
                            minLength={4}
                            onChange={event => setQuestion(event.target.value)}
                            placeholder="Ej.: ¿Cuánto dura la batería con la cancelación de ruido activada?"
                            value={question}
                        />
                        <div className="mt-3 flex items-center justify-between gap-4">
                            <span className="text-xs text-slate-400">{question.length}/1024</span>
                            <button
                                className="rounded-xl bg-[#ffe600] px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={isStreaming || question.trim().length < 4}
                                type="submit"
                            >
                                {isStreaming ? "Consultando…" : "Preguntar ahora"}
                            </button>
                        </div>
                    </form>

                    {(answer || isStreaming) && (
                        <div className="mt-6 rounded-2xl border border-white/10 bg-white p-5 text-slate-900">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                                <span className={`size-2 rounded-full bg-blue-600 ${isStreaming ? "animate-pulse" : ""}`} />
                                Respuesta del asistente
                            </div>
                            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7">
                                {answer || "Buscando en las respuestas del vendedor…"}
                                {isStreaming && answer && <span className="ml-1 inline-block h-5 w-0.5 animate-pulse bg-blue-600 align-middle" />}
                            </p>
                        </div>
                    )}

                    {error && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
                </div>
            </div>
        </section>
    )
}

export { AskForm }
