import {
    ArgTypes,
    Controls,
    Description,
    Primary,
    Stories,
    Subtitle,
    Title,
    useOf,
} from "@storybook/addon-docs/blocks";

export function DocsPage() {
    const { story } = useOf("story", ["story"]);
    const isolated = story.parameters.docs?.story?.inline === false;

    return (
        <>
            <Title />
            <Subtitle />
            <Description />
            <Primary />
            {isolated ? (
                <>
                    <p>
                        Esta prévia usa um iframe para isolar o exemplo. Para editar as propriedades
                        no painel Controls, abra o{" "}
                        <a href={`./?path=/story/${encodeURIComponent(story.id)}`} target="_top">
                            Canvas deste componente
                        </a>
                        . A tabela abaixo apresenta as propriedades disponíveis.
                    </p>
                    <ArgTypes />
                </>
            ) : (
                <Controls />
            )}
            <Stories />
        </>
    );
}
