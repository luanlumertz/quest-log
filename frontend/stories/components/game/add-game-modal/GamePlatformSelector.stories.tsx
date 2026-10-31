import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { GamePlatformSelector } from "../../../../src/components/game/add-game-modal/GamePlatformSelector";
import { demoSearchGame } from "../../../fixtures/games";

const meta = {
    title: "Componentes/Jogos/Adicionar/GamePlatformSelector",
    component: GamePlatformSelector,
    args: { platforms: demoSearchGame.platforms, selectedPlatforms: [], onToggle: fn() },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        return (
            <div className="max-w-md">
                <GamePlatformSelector
                    {...args}
                    onToggle={(platform) => {
                        args.onToggle(platform);
                        updateArgs({
                            selectedPlatforms: args.selectedPlatforms.includes(platform)
                                ? args.selectedPlatforms.filter((value) => value !== platform)
                                : [...args.selectedPlatforms, platform],
                        });
                    }}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Seleção opcional de uma ou mais plataformas por nome. É controlada por selectedPlatforms e onToggle; as stories sincronizam a seleção com Controls. Botões usam aria-pressed, e error marca o grupo como inválido com descrição associada. A lista recebida deve ter nomes únicos; a remoção de duplicatas é feita pelo modal pai. Sem plataformas, apresenta Nenhuma plataforma disponível. Não consulta dados nem salva alterações.",
            },
        },
    },
    argTypes: {
        platforms: { control: "object", description: "Nomes únicos das plataformas disponíveis." },
        selectedPlatforms: {
            control: "object",
            description: "Nomes selecionados, pertencentes à lista disponível.",
        },
        error: { control: "text", description: "Mensagem opcional de validação." },
        onToggle: {
            control: false,
            description: "Recebe o nome clicado. O pai decide se adiciona ou remove a seleção.",
        },
    },
} satisfies Meta<typeof GamePlatformSelector>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Interativo: Story = {};
export const Selecionadas: Story = { args: { selectedPlatforms: ["PC", "PlayStation 5"] } };
export const SemPlataformas: Story = { name: "Sem plataformas", args: { platforms: [] } };
export const ComErro: Story = {
    name: "Com erro",
    args: { error: "Verifique as plataformas selecionadas." },
};
