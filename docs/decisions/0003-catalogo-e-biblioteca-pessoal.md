# 0003 — Catálogo compartilhado e biblioteca pessoal

[Índice das decisões](README.md)

**Situação:** em uso, documentada retrospectivamente.

## Contexto

Várias pessoas podem acompanhar o mesmo jogo. Título, capa, lançamento e plataformas disponíveis descrevem o jogo, enquanto progresso, nota, tempo e datas descrevem a experiência de cada pessoa.

O modelo precisa representar esses dois conjuntos de dados e permitir que os registros pessoais sejam consultados, alterados e removidos por usuário.

## Decisão

Separar `Game`, que guarda os dados compartilhados do catálogo local, de `LibraryEntry`, que guarda o registro pessoal e referencia um usuário e um jogo.

`Game.externalId` identifica o título na RAWG e é único. A adição à biblioteca reutiliza o jogo já importado quando ele existe. `LibraryEntry` usa a chave composta `(userId, gameId)`, permitindo um registro daquele jogo por usuário.

As plataformas disponíveis pertencem a `GamePlatform`; as selecionadas pela pessoa pertencem a `LibraryEntryPlatform`. Status, nota, minutos jogados e datas ficam na entrada pessoal. As buscas e os detalhes externos continuam sendo consultados pela integração RAWG.

## Consequências

- O mesmo jogo pode ser compartilhado por várias bibliotecas sem duplicar seus dados básicos para cada usuário.
- Cada pessoa mantém seu próprio progresso, nota, tempo e datas, independentemente das demais.
- Uma entrada reúne as plataformas selecionadas para aquele jogo. Os dados de progresso pertencem à entrada, sem um registro de progresso separado por plataforma.
- Excluir uma entrada ou a conta remove os dados pessoais relacionados, preservando o catálogo compartilhado.
- O acesso aos dados exige relacionamentos e consultas que combinem jogo, entrada pessoal e plataformas. A compatibilidade das plataformas selecionadas é validada pelo serviço.
- O frontend precisa distinguir o ID externo da RAWG do ID interno usado nos registros da biblioteca.

## Referências

- [Modelo Prisma](../../backend/prisma/schema.prisma).
- [Obtenção do jogo](../../backend/src/services/library-game.service.ts) e [persistência do catálogo](../../backend/src/repositories/game.repository.ts).
- [Serviço da biblioteca](../../backend/src/services/library.service.ts).
- [Guia do banco de dados](../../backend/docs/database.md) e [fluxo de adição](../architecture.md#exemplo-de-fluxo-adicionar-um-jogo-à-biblioteca).
