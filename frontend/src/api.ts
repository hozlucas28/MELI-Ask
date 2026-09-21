import type { Comment, Product } from "./types"

const API_URL = import.meta.env.VITE_API_URL ?? "/api/v1"

type StreamProductAnswerInput = {
    productId: string
    question: string
    signal: AbortSignal
    onDelta: (delta: string) => void
}

type StreamEvent = {
    event: string
    data: string
}

type ConsumeStreamEventInput = {
    streamEvent: StreamEvent
    onDelta: (delta: string) => void
}

async function getProducts(): Promise<Product[]> {
    return request<Product[]>("/products")
}

async function getProduct(productId: string): Promise<Product> {
    return request<Product>(`/products/${productId}`)
}

async function getProductComments(productId: string): Promise<Comment[]> {
    return request<Comment[]>(`/products/${productId}/comments`)
}

async function streamProductAnswer(input: StreamProductAnswerInput): Promise<void> {
    const response = await fetch(`${API_URL}/${input.productId}/ask`, {
        method: "POST",
        headers: {
            "Accept": "text/event-stream",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: input.question }),
        signal: input.signal
    })
    if (!response.ok) throw new Error(await getErrorMessage(response))
    if (!response.body) throw new Error("El navegador no pudo abrir el stream de respuesta.")

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
        const { done, value } = await reader.read()
        buffer += decoder.decode(value, { stream: !done })
        const frames = buffer.split(/\r?\n\r?\n/)
        buffer = frames.pop() ?? ""

        for (const frame of frames) {
            consumeStreamEvent({ streamEvent: parseStreamEvent(frame), onDelta: input.onDelta })
        }
        if (done) break
    }

    if (buffer.trim()) consumeStreamEvent({ streamEvent: parseStreamEvent(buffer), onDelta: input.onDelta })
}

async function request<T>(path: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, { headers: { Accept: "application/json" } })
    if (!response.ok) throw new Error(await getErrorMessage(response))

    return response.json() as Promise<T>
}

async function getErrorMessage(response: Response): Promise<string> {
    try {
        const body = (await response.json()) as { message?: string }

        return body.message ?? "No se pudo completar la solicitud."
    } catch {
        return "No se pudo completar la solicitud."
    }
}

function parseStreamEvent(frame: string): StreamEvent {
    let event = "message"
    const data: string[] = []

    for (const line of frame.split(/\r?\n/)) {
        if (line.startsWith("event:")) event = line.slice(6).trim()
        if (line.startsWith("data:")) data.push(line.slice(5).trimStart())
    }

    return { event, data: data.join("\n") }
}

function consumeStreamEvent(input: ConsumeStreamEventInput): void {
    const { streamEvent, onDelta } = input

    if (streamEvent.event === "answer") {
        const body = JSON.parse(streamEvent.data) as { delta?: string }
        if (body.delta) onDelta(body.delta)
    }
    if (streamEvent.event === "error") {
        const body = JSON.parse(streamEvent.data) as { message?: string }
        throw new Error(body.message ?? "No se pudo generar una respuesta.")
    }
}

export { getProduct, getProductComments, getProducts, streamProductAnswer }
