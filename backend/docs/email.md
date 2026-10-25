# Envio de e-mails

Todos os fluxos passam por `src/integrations/mail.ts`: cadastro, reenvio,
recuperação e aviso de alteração de senha. Os serviços continuam responsáveis
por invalidar códigos após falhas e preservar a consistência de cada operação.

## Desenvolvimento local

O Mailpit continua recebendo os e-mails por SMTP:

```dotenv
EMAIL_PROVIDER=smtp
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_FROM="QuestLog <noreply@questlog.local>"
```

Sem `EMAIL_PROVIDER`, o padrão é `smtp`, exceto quando `NODE_ENV=production`.

## Produção no Render

No serviço do **backend**, abra **Environment** e configure:

```dotenv
NODE_ENV=production
EMAIL_PROVIDER=brevo
BREVO_API_KEY=SUA_CHAVE_DE_API
BREVO_SENDER_EMAIL=questlog.notificacoes@outlook.com
BREVO_SENDER_NAME=QuestLog
FRONTEND_URL=https://quest-log-omega-jade.vercel.app
```

Use a chave de **API**, com acesso de envio a e-mails transacionais, e o endereço
de remetente já verificado na Brevo. Não use uma chave SMTP. Não coloque a chave
em variáveis `VITE_*`, no frontend, no Git ou em capturas de tela públicas.

Preserve as outras variáveis existentes, como banco, JWT e RAWG. As variáveis
`SMTP_*` não são necessárias quando o provedor é `brevo`.

Faça o deploy desta versão do backend. O envio usa `POST https://api.brevo.com/v3/smtp/email`
com timeout de dez segundos, sem tentativas automáticas adicionais. O HTML e o
texto são enviados pelo mesmo ponto de integração.

### Logo

O SMTP local mantém a imagem inline por CID. No envio pela API da Brevo, a
referência é substituída pela URL HTTPS pública:

```text
FRONTEND_URL/favicon/android-chrome-192x192.png
```

O layout permanece o mesmo; alguns clientes de e-mail podem pedir autorização
para carregar imagens externas. O build do frontend deve disponibilizar esse
arquivo, que já existe em `frontend/public/favicon`.

## Validação após o deploy

1. Faça um cadastro com um endereço ao qual você tenha acesso.
2. Confira a resposta `202`, o recebimento do código e a confirmação do cadastro.
3. Valide reenvio, recuperação e aviso de senha alterada.
4. Confira também a pasta de spam e os registros de entrega/rejeição da Brevo.

Uma resposta bem-sucedida da API significa que a Brevo aceitou o envio, não que
o provedor do destinatário já o entregou. Remetente verificado e domínio
autenticado são verificações distintas; os avisos de DKIM/DMARC devem continuar
sendo acompanhados.

Em caso de erro, os logs indicam configuração incompleta, falha de comunicação,
resposta inválida ou o status HTTP retornado pela Brevo. O corpo da resposta do
provedor e a chave não são registrados pela integração. O cadastro continua
retornando `503` se o envio falhar.

Referência: [API de envio transacional da Brevo](https://developers.brevo.com/reference/send-transac-email).
