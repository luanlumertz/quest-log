import { Link } from "react-router";
import { Logo } from "../components/ui/Logo";

export function NotFound() {
    return (
        <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-backdrop px-5 py-12 text-ink sm:px-8">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(124,106,247,0.14),transparent_55%)]"
            />

            <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
                <Logo />

                <section className="relative mt-10 w-full overflow-hidden rounded-3xl border border-divider-bright bg-surface/80 px-6 py-12 shadow-2xl shadow-black/20 sm:px-12 sm:py-14">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-16 top-0 h-px bg-linear-to-r from-transparent via-brand/70 to-transparent"
                    />

                    <p
                        aria-hidden="true"
                        className="font-display text-[clamp(7rem,26vw,11rem)] leading-none font-bold tracking-[-0.045em] text-brand"
                    >
                        404
                    </p>

                    <div aria-hidden="true" className="mx-auto mt-5 h-px w-14 bg-divider-bright" />

                    <h1 className="mt-7 font-display text-3xl font-bold text-white sm:text-4xl">
                        Página não encontrada
                    </h1>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-dim sm:text-base">
                        O endereço que você tentou acessar não existe.
                    </p>

                    <Link
                        to="/"
                        className="
                            mt-9 inline-flex min-h-12 w-full 
                            items-center justify-center gap-2 
                            rounded-xl bg-brand px-6 py-3 
                            font-display text-lg font-bold text-white 
                            transition-all duration-200 hover:-translate-y-0.5 
                            hover:bg-brand-dim hover:shadow-lg hover:shadow-brand/20 
                            focus-visible:outline-2 focus-visible:outline-offset-4 
                            focus-visible:outline-brand sm:w-auto
                        "
                    >
                        <span
                            aria-hidden="true"
                            className="material-symbols-rounded text-[22px]!"
                        >
                            chevron_left
                        </span>
                        Voltar ao início
                    </Link>
                </section>
            </div>
        </main>
    );
}
