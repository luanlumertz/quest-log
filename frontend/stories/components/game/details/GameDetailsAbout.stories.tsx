import type { Meta, StoryObj } from "@storybook/react-vite";
import { GameDetailsAbout } from "../../../../src/components/game/details/GameDetailsAbout";
import { demoGameDetails, longGameDescription } from "../../../fixtures/games";

const meta = {
    title: "Componentes/Jogos/Detalhes/GameDetailsAbout",
    component: GameDetailsAbout,
    args: {
        description: demoGameDetails.description,
        releaseYear: "2022",
        developers: "FromSoftware",
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Descrição e metadados do jogo. Normaliza cabeçalhos e renderiza Markdown; não executa HTML bruto. Limita a descrição a quatro linhas e oferece Ver mais/Ver menos quando detecta conteúdo excedente. Reavalia o espaço ao redimensionar a janela. Descrição vazia usa um texto padrão e releaseYear=null mostra Não informado. developers já deve vir formatado pelo pai; uma string vazia não ganha fallback automático. Os textos longos das stories são ilustrativos.",
            },
        },
    },
    argTypes: {
        description: { control: "text", description: "Descrição em texto ou Markdown." },
        releaseYear: { control: "text", description: "Ano pronto para exibição ou null." },
        developers: {
            control: "text",
            description: "Nome ou lista de desenvolvedores já formatada.",
        },
    },
} satisfies Meta<typeof GameDetailsAbout>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Curta: Story = {};
export const LongaComMarkdown: Story = {
    name: "Longa com Markdown",
    args: { description: longGameDescription },
};
export const SemDescricao: Story = { name: "Sem descrição", args: { description: "" } };
export const MetadadosAusentes: Story = {
    name: "Metadados ausentes",
    args: { releaseYear: null, developers: "Não informado" },
};
