import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { NowPlaying } from "../../../src/components/dashboard/NowPlaying";
import { DemoLocation } from "../../decorators/GameDemo";
import { demoNowPlayingGames } from "../../fixtures/dashboard";

const meta = {
    title: "Componentes/Dashboard/NowPlaying",
    component: NowPlaying,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/dashboard-demo"]}>
                <Story />
            </MemoryRouter>
        ),
    ],
    render: (args) => (
        <div className="min-w-0">
            <NowPlaying {...args} />
            <DemoLocation />
        </div>
    ),
    args: { games: demoNowPlayingGames },
    parameters: {
        docs: {
            story: { inline: false, iframeHeight: 520 },
            description: {
                component:
                    "Seção Jogando agora com os cartões e o carrossel reais. O pai fornece somente jogos em andamento; o componente não filtra o status nem consulta a API. Ordena por startedAt, do mais recente ao mais antigo, deixando datas ausentes por último. Sem jogos, não renderiza a seção. Exibe grade enquanto os jogos cabem: uma coluna abaixo de 768px, duas de 768px a 1279px e três a partir de 1280px. Acima dessa quantidade, ativa carrossel circular, setas e avanço automático a cada seis segundos. Pausar/Reproduzir controla a pausa manual; foco na seção, navegação pelas setas e aba oculta também interrompem o avanço. Sair do foco ou clicar fora libera a interação, preservando a pausa manual. Hover sozinho não pausa. Com preferência do sistema por movimento reduzido, inicia pausado e navega sem animação. As cópias usadas no loop ficam fora da árvore acessível e da sequência de Tab. Cada exemplo usa iframe próprio para isolar medidas, foco e timers. Redimensione a janela no Canvas para comparar grade e carrossel; na página Docs, vale a largura de cada iframe. As capas são locais e os destinos permanecem no MemoryRouter.",
            },
        },
    },
    argTypes: {
        games: {
            control: "object",
            description:
                "Entradas PLAYING com game.id únicos. O exemplo tem cinco jogos, datas de início variadas, uma data ausente e casos sem capa, sem nota e com nota zero. A quantidade determina a presença dos controles conforme a largura.",
        },
    },
} satisfies Meta<typeof NowPlaying>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Carrossel: Story = {};
export const UmJogo: Story = { name: "Um jogo", args: { games: demoNowPlayingGames.slice(0, 1) } };
export const DoisJogos: Story = {
    name: "Dois jogos: grade ou carrossel",
    args: { games: demoNowPlayingGames.slice(0, 2) },
};
export const TresJogos: Story = {
    name: "Três jogos: grade ou carrossel",
    args: { games: demoNowPlayingGames.slice(0, 3) },
};
export const SemJogos: Story = {
    name: "Sem jogos em andamento",
    args: { games: [] },
    parameters: {
        docs: {
            description: {
                story: "A seção fica ausente. O texto com a rota abaixo pertence apenas à demonstração.",
            },
        },
    },
};
