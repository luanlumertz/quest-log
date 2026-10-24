import { describe, test, assert } from "vitest";
import { renderEmailTemplate } from "../../../src/templates/email.template.js";

const content = {
    category: "VERIFICAÇÃO",
    title: "Confirme seu e-mail.",
    description: "Digite o código para continuar.",
    footer: "Ignore caso não tenha solicitado.",
};

describe("renderEmailTemplate", () => {
    test("deve apresentar o código, validade e logo embutida", () => {
        const html = renderEmailTemplate({ ...content, code: "012345" });

        assert.include(html, "012345");
        assert.include(html, "Válido por 10 minutos");
        assert.include(html, 'src="cid:questlog-logo"');
        assert.include(html, content.description);
    });

    test("deve respeitar a validade específica do reenvio", () => {
        const html = renderEmailTemplate({
            ...content,
            code: "123456",
            validity: "Válido por até 10 minutos, respeitando o prazo do cadastro",
        });

        assert.include(html, "respeitando o prazo do cadastro");
    });

    test("deve omitir código e instruções de código nas notificações", () => {
        const html = renderEmailTemplate({ ...content, title: "Sua senha foi alterada." });

        assert.include(html, "Sua senha foi alterada.");
        assert.notInclude(html, "SEU CÓDIGO");
        assert.notInclude(html, "não compartilhe este código");
        assert.notInclude(html, "Válido por");
    });

    test("deve escapar os textos antes de inserir no HTML", () => {
        const html = renderEmailTemplate({
            ...content,
            description: `<script>"&'teste</script>`,
        });

        assert.include(html, "&lt;script&gt;&quot;&amp;&#39;teste&lt;/script&gt;");
        assert.notInclude(html, "<script>");
    });
});
