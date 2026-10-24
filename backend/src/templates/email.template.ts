type EmailTemplateOptions = {
    category: string;
    title: string;
    description: string;
    footer: string;
    code?: string;
    validity?: string;
};

function escapeHtml(value: string) {
    const entities: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    };
    return value.replace(/[&<>"']/g, (character) => entities[character]!);
}

export function renderEmailTemplate({
    category,
    title,
    description,
    footer,
    code,
    validity = "Válido por 10 minutos",
}: EmailTemplateOptions) {
    return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>${escapeHtml(title)} — QuestLog</title>
    <style>
      @media only screen and (max-width: 480px) {
        .email-shell { padding: 24px 12px !important; }
        .email-content { padding: 28px 24px !important; }
        .email-title { font-size: 28px !important; }
        .email-code { font-size: 34px !important; letter-spacing: 7px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#0b0d13;color:#e2e8f4;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(description)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0d13;">
      <tr>
        <td class="email-shell" align="center" style="padding:48px 24px;">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="width:100%;max-width:560px;">
            <tr>
              <td style="padding:0 0 28px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="52" style="vertical-align:middle;">
                      <img src="cid:questlog-logo" width="48" height="48" alt="" style="display:block;border:0;" />
                    </td>
                    <td style="padding-left:12px;vertical-align:middle;font-size:27px;font-weight:700;letter-spacing:-0.8px;color:#ffffff;">QuestLog</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="border:1px solid #252b3b;border-top:3px solid #7c6af7;border-radius:20px;background-color:#12151d;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td class="email-content" style="padding:36px;">
                      <p style="margin:0 0 18px;font-size:10px;line-height:16px;font-weight:700;letter-spacing:2.3px;color:#ad9fff;">${escapeHtml(category)}</p>
                      <h1 class="email-title" style="margin:0 0 16px;font-size:32px;line-height:1.2;font-weight:700;letter-spacing:-0.8px;color:#ffffff;">${escapeHtml(title)}</h1>
                      <p style="margin:0;font-size:15px;line-height:25px;color:#b4bdd0;">${escapeHtml(description)}</p>
${
    code
        ? `                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;">
                        <tr>
                          <td align="center" style="padding:24px 16px;border:1px solid #4b3e78;border-radius:14px;background-color:#1a1728;">
                            <p style="margin:0 0 14px;font-size:10px;line-height:16px;letter-spacing:1.8px;font-weight:700;color:#b4a5f5;">SEU CÓDIGO DE VERIFICAÇÃO</p>
                            <p class="email-code" style="margin:0;padding-left:8px;font-family:Consolas,'Courier New',monospace;font-size:40px;line-height:48px;font-weight:700;letter-spacing:8px;color:#e4dcff;">${escapeHtml(code)}</p>
                            <p style="margin:14px 0 0;font-size:12px;line-height:20px;color:#a9a2bb;">${escapeHtml(validity)}</p>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:22px 0 0;font-size:13px;line-height:22px;color:#a9b1c4;">Por segurança, não compartilhe este código com ninguém.</p>
`
        : ""
}
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;">
                        <tr>
                          <td style="padding-top:22px;border-top:1px solid #252b3b;">
                            <p style="margin:0;font-size:12px;line-height:21px;color:#929cb2;">${escapeHtml(footer)}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 16px 0;">
                <p style="margin:0;font-size:11px;line-height:20px;color:#7b859e;">QuestLog · Sua biblioteca de jogos, do seu jeito.</p>
                <p style="margin:6px 0 0;font-size:10px;line-height:18px;color:#626d85;">Este é um e-mail automático. Não é necessário responder.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
