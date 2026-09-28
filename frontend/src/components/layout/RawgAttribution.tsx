export function RawgAttribution() {
    return (
        <p className="text-xs text-ink-mute">
            Dados e imagens fornecidos por{" "}
            <a
                href="https://rawg.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="
                    text-ink-dim
                    underline
                    underline-offset-2
                    transition-colors
                    hover:text-ink
                "
            >
                RAWG
            </a>
        </p>
    );
}
