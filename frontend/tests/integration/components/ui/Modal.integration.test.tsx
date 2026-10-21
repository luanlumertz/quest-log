import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { Modal } from "../../../../src/components/ui/Modal";

function ModalDeTeste({ preventClose = false, withControls = true }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsOpen(true)}>Abrir modal</button>
            {isOpen && (
                <Modal
                    onClose={() => setIsOpen(false)}
                    preventClose={preventClose}
                    ariaLabelledBy="modal-title"
                >
                    <h2 id="modal-title">Modal de teste</h2>
                    {withControls && (
                        <>
                            <input aria-label="Nome" />
                            <button onClick={() => setIsOpen(false)}>Fechar</button>
                        </>
                    )}
                </Modal>
            )}
        </>
    );
}

describe("Modal.tsx", () => {
    test("deve focar o primeiro controle e manter Tab e Shift+Tab dentro do modal", async () => {
        const user = userEvent.setup();
        render(<ModalDeTeste />);
        await user.click(screen.getByRole("button", { name: "Abrir modal" }));

        const nome = screen.getByRole("textbox", { name: "Nome" });
        const fechar = screen.getByRole("button", { name: "Fechar" });
        await waitFor(() => expect(nome).toHaveFocus());

        await user.tab();
        expect(fechar).toHaveFocus();
        await user.tab();
        expect(nome).toHaveFocus();
        await user.tab({ shift: true });
        expect(fechar).toHaveFocus();
    });

    test("deve fechar com Escape e restaurar o foco e o scroll anteriores", async () => {
        const user = userEvent.setup();
        const previousOverflow = document.body.style.overflow;
        render(<ModalDeTeste />);
        const abrir = screen.getByRole("button", { name: "Abrir modal" });
        await user.click(abrir);
        await waitFor(() => expect(screen.getByRole("textbox", { name: "Nome" })).toHaveFocus());
        expect(document.body.style.overflow).toBe("hidden");

        await user.keyboard("{Escape}");

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(abrir).toHaveFocus();
        expect(document.body.style.overflow).toBe(previousOverflow);
    });

    test("deve fechar ao clicar no fundo sem fechar ao clicar dentro do conteúdo", async () => {
        const user = userEvent.setup();
        render(<ModalDeTeste />);
        await user.click(screen.getByRole("button", { name: "Abrir modal" }));
        const dialog = screen.getByRole("dialog", { name: "Modal de teste" });

        await user.click(screen.getByRole("heading", { name: "Modal de teste" }));
        expect(dialog).toBeInTheDocument();

        // O fundo não tem um papel acessível; ele envolve o dialog.
        await user.click(dialog.parentElement!);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    test("deve impedir fechamento por Escape e pelo fundo quando preventClose estiver ativo", async () => {
        const user = userEvent.setup();
        render(<ModalDeTeste preventClose />);
        await user.click(screen.getByRole("button", { name: "Abrir modal" }));
        const dialog = screen.getByRole("dialog");

        await user.keyboard("{Escape}");
        expect(dialog).toBeInTheDocument();
        await user.click(dialog.parentElement!);
        expect(dialog).toBeInTheDocument();
    });

    test("deve focar o próprio dialog e reter Tab quando não houver controles", async () => {
        const user = userEvent.setup();
        render(<ModalDeTeste withControls={false} />);
        await user.click(screen.getByRole("button", { name: "Abrir modal" }));
        const dialog = screen.getByRole("dialog");

        await waitFor(() => expect(dialog).toHaveFocus());
        await user.tab();
        expect(dialog).toHaveFocus();
        await user.tab({ shift: true });
        expect(dialog).toHaveFocus();
    });
});
