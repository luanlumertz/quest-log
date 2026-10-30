# Limpeza de contas do sandbox

A rotina é independente do servidor web e ainda não tem agendamento automático.
Não há endpoint público de limpeza nem execução automática ao iniciar a API.

Depois de instalar as dependências, gerar o Prisma Client e executar `npm run build`
na pasta `backend`, o comando é:

```sh
npm run sandbox:cleanup
```

Por padrão, somente confere e informa quantas contas são elegíveis. Para excluir:

```sh
npm run sandbox:cleanup -- --execute
```

O processo precisa receber `NODE_ENV=production`, `APP_ENV=sandbox` e uma
`DATABASE_URL` exclusiva do banco `quest_log_sandbox`. Ele não carrega o `.env`
local e não usa `DIRECT_URL`. Também confere o nome do banco na conexão real antes
de consultar ou excluir usuários. O agendamento receberá essas variáveis
separadamente, sem substituir a configuração local ou da produção.

Contas precisam ter sido criadas há mais de 30 dias e estar há mais de 30 dias sem
atividade. Quando `lastActiveAt` estiver nulo, vale a data de criação. O limite é
calculado em períodos de 24 horas: exatamente 30 dias ainda não permite exclusão.

A contagem e a exclusão usam a mesma regra. A exclusão confere novamente essa
regra no banco, preservando contas que voltaram a ter atividade antes da remoção.
O resumo informa `mode`, `database`, `inactivityDays`, `cutoff`, `candidates` e
`deleted`, sem nomes, e-mails ou tokens. A contagem pode diferir da quantidade
excluída se houver atividade concorrente.

Biblioteca, avaliações, sessões e recuperação vinculadas ao usuário são removidas
pelas relações em cascata. Jogos e plataformas compartilhados são preservados.
Falhas interrompem o comando com código de saída diferente de zero.
