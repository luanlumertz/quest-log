# Logs e investigação de falhas

[Voltar ao índice dos guias](../../docs/README.md) · [Deploy e operação](../../docs/deployment.md)

O backend usa Pino para registrar eventos de execução e falhas. A configuração compartilhada está em [logger.ts](../src/lib/logger.ts). Os logs ajudam a investigar o servidor e suas integrações; as respostas HTTP apresentam as mensagens apropriadas para quem está usando a aplicação.

## Formato por ambiente

| Execução                                                                | Saída                                                                    |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `NODE_ENV=development`, sem `CI` preenchida e sem destino personalizado | Formato legível com pino-pretty, horário local, nível e prefixo `[API]`. |
| Produção e sandbox                                                      | JSON, com o nível escrito como texto, como `info` e `error`.             |
| Testes                                                                  | JSON quando houver emissão; por padrão, o nível é `silent`.              |
| CI ou logger com destino personalizado                                  | JSON; o nível continua seguindo sua configuração.                        |

O formato legível usa cores quando a saída está em um terminal compatível. Ele oculta campos como `service`, `event` e `appEnvironment` na apresentação e mantém informações adicionais, como a porta. Os campos ocultos por essa apresentação continuam fazendo parte dos eventos estruturados da configuração de produção.

O logger usa `service: "questlog-backend"` e horário ISO no JSON. Um exemplo de evento de início, com valores ilustrativos:

```json
{
    "level": "info",
    "time": "2026-11-02T12:00:00.000Z",
    "service": "questlog-backend",
    "event": "server.started",
    "port": "10000",
    "appEnvironment": "sandbox",
    "msg": "Servidor iniciado"
}
```

Na execução combinada da raiz, Vite e Storybook têm apresentação própria, e os passos do executor usam `[DEV]`. Os prefixos ajudam a distinguir a origem da mensagem. A configuração de pino-pretty pertence à API e também é usada ao iniciar somente o backend em desenvolvimento. Veja os [comandos locais](../../docs/development.md#logs-e-encerramento).

## Níveis e `LOG_LEVEL`

A prioridade da configuração é:

1. `level` passado explicitamente a `createLogger`, quando informado.
2. Variável de ambiente `LOG_LEVEL`.
3. Padrão `silent` em `NODE_ENV=test` ou `info` nos demais ambientes.

Para mudar a saída local, configure no `backend/.env` e reinicie a API:

```dotenv
LOG_LEVEL=debug
```

| Nível             | Uso                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------- |
| `trace` e `debug` | Detalhes de diagnóstico, quando houver chamadas desses níveis no código.                    |
| `info`            | Eventos normais, como início e encerramento do servidor e limpezas com registros removidos. |
| `warn`            | Avisos registrados explicitamente nesse nível.                                              |
| `error`           | Falhas registradas nos pontos de tratamento.                                                |
| `fatal`           | Falhas registradas explicitamente como críticas.                                            |
| `silent`          | Desabilita a emissão pelo logger.                                                           |

O nível selecionado inclui os eventos de maior gravidade. Com `LOG_LEVEL=error`, por exemplo, os eventos `info` de início do servidor deixam de aparecer. As chamadas atuais da aplicação usam principalmente `info` e `error`; habilitar `debug` não cria novos registros de requisição ou outros eventos que não estejam instrumentados.

## Identificação das requisições

O [middleware de contexto](../src/middlewares/requestContext.middleware.ts) cria um UUID para cada requisição e o devolve no cabeçalho `X-Request-Id`. Ele é instalado antes das proteções e rotas em [app.ts](../src/app.ts).

O identificador é mantido por `AsyncLocalStorage`. O `mixin` do logger acrescenta `requestId` aos eventos emitidos dentro desse contexto, inclusive em trabalhos assíncronos que preservem a cadeia da requisição. O identificador é gerado pela API; não é copiado de um cabeçalho enviado pelo cliente.

Para investigar uma chamada:

1. Abra as ferramentas do navegador e selecione a requisição na aba **Network**.
2. Copie `X-Request-Id` dos cabeçalhos da resposta e observe o status e o horário.
3. Procure o mesmo valor nos logs da API do ambiente correspondente.
4. Leia `event`, `method`, `route`, `statusCode` e a estrutura de `err` para identificar a falha.

Eventos de inicialização, tarefas periódicas e o script de limpeza do sandbox podem executar fora de uma requisição, sem `requestId`. O cabeçalho também pode existir em uma resposta que não gerou evento de erro; o logger não funciona como um histórico de todas as chamadas HTTP.

## Falhas HTTP e integrações

O [tratamento centralizado](../src/middlewares/errorHandler.middleware.ts) registra `http.request_failed` nestas situações:

- `AppError` com status `500` ou superior.
- Erro inesperado, tratado como `500` com mensagem pública de erro interno.

Erros esperados representados por `AppError` com status `4xx`, JSON malformado e o caso Prisma `P2025` não geram esse registro nesse middleware. Os limitadores e validações também podem responder antes do controller. Por isso, uma resposta `401`, `403`, `404` ou `429` não precisa ter um evento correspondente nos logs.

O evento HTTP registra método, rota e status. Quando o padrão da rota está disponível, usa o caminho registrado no Express, como `/games/:externalId`; como alternativa, usa `req.path`, sem a query string.

### Ler a causa de uma integração

As integrações podem criar `IntegrationError` com um contexto técnico. A RAWG, por exemplo, transforma falhas de comunicação, resposta inválida ou timeout em um `AppError` para a resposta HTTP e mantém a causa para o log.

Este é um exemplo resumido de uma falha da RAWG, com identificador e horário fictícios. A stack e causas adicionais foram omitidas da ilustração:

```json
{
    "level": "error",
    "time": "2026-11-02T12:05:00.000Z",
    "service": "questlog-backend",
    "requestId": "6cd76bec-e8cf-456b-a8d6-35a79652f7a7",
    "event": "http.request_failed",
    "method": "GET",
    "route": "/games/search",
    "statusCode": 502,
    "err": {
        "type": "Error",
        "message": "Erro ao buscar jogos na RAWG",
        "statusCode": 502,
        "cause": {
            "type": "IntegrationError",
            "message": "Resposta HTTP de erro da RAWG",
            "context": {
                "service": "rawg",
                "operation": "search",
                "reason": "http",
                "upstreamStatus": 429
            }
        }
    },
    "msg": "Falha na requisição HTTP"
}
```

`statusCode` descreve a resposta da API QuestLog. `upstreamStatus`, quando existe, descreve a resposta do provedor externo; os dois valores podem ser diferentes. O `service` da raiz identifica o backend, enquanto `err.cause.context.service` identifica a integração envolvida.

Os contextos de integração usam estes campos, definidos em [IntegrationError.ts](../src/errors/IntegrationError.ts):

| Campo            | Valores ou finalidade                                                            |
| ---------------- | -------------------------------------------------------------------------------- |
| `service`        | `rawg`, `brevo`, `smtp` ou `mail`.                                               |
| `operation`      | `search`, `details` ou `send`.                                                   |
| `reason`         | `configuration`, `http`, `timeout`, `network`, `invalid_response` ou `delivery`. |
| `upstreamStatus` | Status HTTP do serviço externo, quando disponível.                               |

Os detalhes de implementação ficam nas integrações de [RAWG](../src/integrations/rawg.ts), [Brevo](../src/integrations/brevo.ts) e [e-mail/SMTP](../src/integrations/mail.ts).

## Eventos existentes

| Evento                             | Nível   | Significado                                                                         |
| ---------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| `server.started`                   | `info`  | O servidor começou a atender; inclui porta e ambiente da aplicação.                 |
| `server.stopping`                  | `info`  | O encerramento do servidor foi iniciado.                                            |
| `server.stopped`                   | `info`  | O servidor concluiu seu fluxo de encerramento.                                      |
| `http.request_failed`              | `error` | Falha HTTP registrada pelo tratamento centralizado.                                 |
| `registration.cleanup_completed`   | `info`  | A tarefa periódica removeu cadastros pendentes expirados; inclui `count`.           |
| `registration.cleanup_failed`      | `error` | A tarefa de limpeza de cadastros pendentes falhou.                                  |
| `registration.code_cleanup_failed` | `error` | Falhou a tentativa de invalidar um código de cadastro após erro no envio do e-mail. |
| `password.cleanup_completed`       | `info`  | A tarefa periódica removeu recuperações expiradas; inclui `count`.                  |
| `password.cleanup_failed`          | `error` | A tarefa de limpeza de recuperações falhou.                                         |
| `password.code_cleanup_failed`     | `error` | Falhou a tentativa de invalidar um código de recuperação após erro no envio.        |
| `password.recovery_failed`         | `error` | O processamento agendado da solicitação de recuperação falhou.                      |
| `password.notification_failed`     | `error` | O aviso por e-mail sobre uma senha já alterada não pôde ser enviado.                |
| `sandbox.cleanup_failed`           | `error` | O script de limpeza do sandbox falhou; inclui a etapa em `stage`.                   |

As tarefas periódicas só registram `cleanup_completed` quando removem pelo menos um registro. Ausência desse evento não significa que a tarefa não executou.

Uma falha na recuperação pode ser registrada depois da resposta `202`, pois o processamento é agendado no próprio processo. Já `password.notification_failed` pode ocorrer após uma troca de senha concluída: o erro do aviso não desfaz a alteração. Os fluxos estão no [guia de autenticação](authentication.md).

O resultado bem-sucedido da limpeza do sandbox é impresso diretamente como JSON pelo script, com `mode`, `database`, `inactivityDays`, `cutoff`, `candidates` e `deleted`. Ele não recebe o envelope padrão de Pino nem um evento `sandbox.cleanup_completed`. No GitHub Actions, o script também produz um resumo. Veja a [operação da limpeza](../../docs/deployment.md#limpeza-de-contas-do-sandbox).

## Campos e dados sensíveis

A configuração aplica duas formas de tratamento:

1. **Remoção de campos:** `redact` remove caminhos configurados, como `body`, `headers`, `cookies`, `req`, `res`, `url`, e-mail, senhas, códigos, tokens e algumas chaves de ambiente. Também há padrões específicos como `*.password` e `*.secret`.
2. **Serialização de `err`:** o logger conserva informações selecionadas, evitando despejar o objeto completo ou mensagens arbitrárias de bibliotecas.

Na serialização de erros:

- `type` vem do nome do erro.
- Mensagens de `AppError` e `IntegrationError` são preservadas, com status e contexto quando aplicáveis.
- Códigos técnicos são aceitos quando correspondem ao formato restrito definido no serializer.
- Em erros Zod, são mantidos os tipos e caminhos das falhas, sem os valores recebidos.
- A stack conserva os frames e substitui URLs HTTP/HTTPS encontradas neles.
- As causas são percorridas com limite de profundidade; valores lançados que não sejam `Error` recebem apenas uma indicação de tipo.

Os caminhos de remoção são específicos, e os padrões não percorrem todo objeto em qualquer profundidade. Texto livre em `msg` também não passa por uma busca automática de segredos. Ao acrescentar um registro, selecione campos técnicos e mensagens controladas: não envie o objeto de ambiente, a requisição completa, credenciais ou conteúdos de e-mail ao logger.

Passe a exceção no campo `err` para usar o serializer, como no tratamento do aviso de senha:

```ts
logger.error(
    { event: "password.notification_failed", err: error },
    "Falha no aviso de alteração de senha",
);
```

O exemplo segue [password.helpers.ts](../src/services/password.helpers.ts). Para novos eventos, mantenha nomes estáveis em `event`, mensagem curta e campos que ajudem a localizar a operação, como rota, status, quantidade ou etapa. Uma falha HTTP que será propagada até o middleware já será registrada por ele; evite registrar a mesma exceção novamente em cada camada.

## Onde consultar e como investigar

| Ambiente              | Onde consultar                                                                      |
| --------------------- | ----------------------------------------------------------------------------------- |
| Desenvolvimento       | Terminal que executa a API, individualmente ou pelo comando combinado da raiz.      |
| API hospedada         | Logs do serviço correspondente no Render: produção e sandbox têm saídas separadas.  |
| CI e limpeza agendada | Logs das etapas no GitHub Actions e resumo da execução de limpeza quando produzido. |

O logger não grava arquivos locais por padrão. O armazenamento e a consulta dos registros hospedados ficam a cargo da plataforma. Mensagens de instalação, compilação ou migrations são saídas das ferramentas e podem aparecer junto dos logs de execução, com formatos diferentes.

Para uma falha HTTP, comece por ambiente, horário e `X-Request-Id`; depois leia evento, status e causa. Para erros de início, confira o comando e as variáveis antes de procurar eventos de requisição. Algumas validações acontecem durante a importação dos módulos e podem impedir que `server.started` seja emitido.

Para a limpeza do sandbox, use `stage` para distinguir argumentos, ambiente, carregamento do cliente e execução da limpeza. Para falhas externas, examine `service`, `operation`, `reason` e `upstreamStatus`, quando presentes. Um evento de encerramento ou de limpeza pertence ao seu fluxo específico e não substitui a verificação de disponibilidade do serviço.

## Verificação da configuração

Os [testes unitários do logger](../tests/unit/lib/logger.unit.test.ts) cobrem formato local e de produção, remoção de campos, causas técnicas, contexto assíncrono e limite de serialização. Os [testes do tratamento HTTP](../tests/integration/middlewares/errorHandler.integration.test.ts) conferem o registro de falhas do servidor, a resposta pública e o identificador da requisição.

Com o ambiente de teste preparado, dentro de `backend/`:

```sh
npm test -- --project unit tests/unit/lib/logger.unit.test.ts
```

Para a integração HTTP, que usa o preparo da suíte com PostgreSQL:

```sh
npm test -- --project integration tests/integration/middlewares/errorHandler.integration.test.ts
```

A configuração dos arquivos de ambiente, bancos e migrations está no [guia de testes](../../docs/testing.md).
