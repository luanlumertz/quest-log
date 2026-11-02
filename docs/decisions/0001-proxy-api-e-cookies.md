# 0001 — Proxy da API e autenticação por cookies

[Índice das decisões](README.md)

**Situação:** em uso, documentada retrospectivamente.

## Contexto

O frontend React é hospedado na Vercel e a API Express executa no Render. A aplicação precisa manter a sessão do usuário nas chamadas ao backend e permitir sua renovação pelo navegador.

O uso de cookies depende dos caminhos e da origem das requisições. Também é necessário distinguir o acesso encaminhado pela infraestrutura da produção da autenticação de cada usuário.

## Decisão

Na produção, o navegador chama a API por `/api` no domínio do frontend. A Vercel encaminha essas chamadas para o Render, removendo esse prefixo e acrescentando `X-QuestLog-Origin-Secret`, cujo valor vem de uma variável privada da infraestrutura.

O backend emite os tokens de acesso e renovação em cookies `HttpOnly`, com `SameSite=Lax` e `Secure` na execução de produção. Os caminhos dos cookies acompanham `/api` e `/api/auth`, vistos pelo navegador. O cliente HTTP envia as credenciais, coordena a renovação de sessão e repete uma chamada elegível quando a renovação é bem-sucedida.

A autenticação do usuário, a proteção CSRF e a conferência do segredo do proxy têm responsabilidades próprias e permanecem combinadas no fluxo.

## Consequências

- O navegador faz as chamadas da aplicação pela mesma origem e gerencia os cookies sem o React precisar ler seus valores.
- O segredo do proxy fica nas configurações da Vercel e do Render, fora do código entregue ao navegador.
- A publicação depende de manter o destino do proxy, o segredo compartilhado, a origem confiável e os caminhos dos cookies coerentes.
- O proxy acrescenta uma etapa à comunicação, que precisa ser considerada na configuração de IPs e nos limites por requisição.
- O desenvolvimento e o sandbox têm caminhos próprios. Usar o Swagger local por `/api` exige alinhar o prefixo dos cookies e o endereço usado pelo frontend.

## Referências

- [Proxy de produção](../../frontend/vercel.json).
- [Configuração dos cookies](../../backend/src/lib/authCookies.ts) e [proteção do proxy](../../backend/src/middlewares/origin.middleware.ts).
- [Cliente HTTP do frontend](../../frontend/src/services/api.ts).
- [Guia de autenticação](../../backend/docs/authentication.md) e [configuração das hospedagens](../deployment.md).
