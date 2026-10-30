import { getAppEnvironment } from "../../lib/appEnvironment.js";

const isSandbox = getAppEnvironment() === "sandbox";

export const swaggerExecutionInstructions = isSandbox
    ? "Para executar pelo Swagger, faça login por POST /auth/login nesta documentação e envie X-QuestLog-Request: true nas operações de escrita. O navegador envia os cookies automaticamente."
    : "Para executar pelo Swagger, faça login no frontend, abra http://localhost:5173/api/docs/, selecione o servidor /api e envie X-QuestLog-Request: true.";

export const mailDeliveryInstructions = isSandbox
    ? "Consulte o código na caixa de entrada do e-mail informado."
    : "No ambiente local, consulte o código no Mailpit em http://localhost:8025.";
