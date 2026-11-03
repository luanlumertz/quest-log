import { getAppEnvironment } from "../../lib/appEnvironment.js";

const isSandbox = getAppEnvironment() === "sandbox";

export const gettingStartedInstructions = [
    "## Comece por aqui",
    isSandbox
        ? "Já cadastrou e confirmou uma conta neste sandbox nos últimos 30 dias? Se lembrar do e-mail e da senha, pode pular direto para o [login](#/Autentica%C3%A7%C3%A3o/loginUser). As contas da aplicação principal são separadas das contas deste ambiente."
        : "Já tem uma conta confirmada neste ambiente local? Pode pular direto para o [login](#/Autentica%C3%A7%C3%A3o/loginUser).",
    "1. **Cadastre sua conta:** abra [POST /auth/register](#/Cadastro/registerUser), clique em **Try it out**, preencha os dados e clique em **Execute**.",
    isSandbox
        ? "2. **Confirme o cadastro:** consulte o código recebido por e-mail e envie-o em [POST /auth/register/verify](#/Cadastro/verifyRegistration)."
        : "2. **Confirme o cadastro:** consulte o código no [Mailpit](http://localhost:8025) e envie-o em [POST /auth/register/verify](#/Cadastro/verifyRegistration).",
    "3. **Faça login:** execute [POST /auth/login](#/Autentica%C3%A7%C3%A3o/loginUser) com seu e-mail e sua senha.",
    "4. **Pronto, você está autenticado:** após o login, o navegador envia os cookies automaticamente nas próximas requisições. Agora você pode experimentar as rotas protegidas.",
    "**Quer testar como a API responde sem estar autenticado?** Execute [POST /auth/logout](#/Autentica%C3%A7%C3%A3o/logoutUser) para encerrar a sessão e depois teste uma rota protegida. As rotas públicas podem ser usadas sem fazer logout.",
    "Nas operações que exigem o cabeçalho **X-QuestLog-Request**, mantenha o valor **true**. Se o acesso expirar, execute [POST /auth/refresh](#/Autentica%C3%A7%C3%A3o/refreshAccessToken) ou faça [login](#/Autentica%C3%A7%C3%A3o/loginUser) novamente.",
].join("\n\n");

export const swaggerExecutionInstructions = isSandbox
    ? "Para executar pelo Swagger, faça login por POST /auth/login nesta documentação e envie X-QuestLog-Request: true nas operações de escrita. O navegador envia os cookies automaticamente."
    : "Para executar pelo Swagger, faça login no frontend, abra http://localhost:5173/api/docs/, selecione o servidor /api e envie X-QuestLog-Request: true.";

export const mailDeliveryInstructions = isSandbox
    ? "Consulte o código na caixa de entrada do e-mail informado."
    : "No ambiente local, consulte o código no Mailpit em http://localhost:8025.";
