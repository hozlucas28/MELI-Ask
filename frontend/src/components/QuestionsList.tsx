import type { Comment } from "../types"

type QuestionsListProps = {
    comments: Comment[]
    ownerId: string
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" })

function QuestionsList({ comments, ownerId }: QuestionsListProps) {
    if (comments.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <p className="text-lg font-bold">Todavía no hay preguntas</p>
                <p className="mt-2 text-sm text-slate-500">Sé la primera persona en consultar sobre este producto.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {comments.map(comment => (
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" key={comment.id}>
                    <div className="flex gap-4">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-black text-blue-700">P</span>
                        <div className="min-w-0 flex-1">
                            <p className="leading-6 text-slate-900">{comment.content}</p>
                            <p className="mt-2 text-xs text-slate-400">Usuario {shortId(comment.authorId)} · {dateFormatter.format(new Date(comment.createdAt))}</p>
                        </div>
                    </div>

                    {comment.replies.length > 0 && (
                        <div className="ml-4 mt-5 space-y-3 border-l-2 border-[#ffe600] pl-5 sm:ml-11">
                            {comment.replies.map(reply => (
                                <div className="rounded-xl bg-slate-50 p-4" key={reply.id}>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-700">
                                            {reply.authorId === ownerId ? "Respuesta del vendedor" : `Usuario ${shortId(reply.authorId)}`}
                                        </p>
                                        {reply.authorId === ownerId && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Verificado</span>}
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-700">{reply.content}</p>
                                    <p className="mt-2 text-xs text-slate-400">{dateFormatter.format(new Date(reply.createdAt))}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            ))}
        </div>
    )
}

function shortId(id: string): string {
    return id.slice(0, 8)
}

export { QuestionsList }
