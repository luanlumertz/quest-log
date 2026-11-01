import { execFile, spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { connect, createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseEnv, promisify } from "node:util";
import {
    createConcurrently,
    KillOnSignal,
    KillOthers,
    LogError,
    Logger,
    LogOutput,
} from "concurrently";

const root = fileURLToPath(new URL("../", import.meta.url));
const backend = resolve(root, "backend");
const frontend = resolve(root, "frontend");
const execFileAsync = promisify(execFile);

export async function hasRunningInfrastructure() {
    try {
        const { stdout } = await execFileAsync(
            "docker",
            ["compose", "ps", "--status", "running", "--quiet"],
            { cwd: root, timeout: 3000, windowsHide: true },
        );
        return stdout.trim().length > 0;
    } catch {
        // Docker desligado ou indisponível: não afirma que a infraestrutura está ligada.
        return false;
    }
}

// As variáveis do terminal têm a mesma prioridade usada pelo dotenv do backend.
async function readBackendEnvironment() {
    try {
        return { ...parseEnv(await readFile(resolve(backend, ".env"), "utf8")), ...process.env };
    } catch (error) {
        if (error.code === "ENOENT") {
            throw new Error(
                "Crie backend/.env a partir de backend/.env.example antes de continuar.",
            );
        }
        throw error;
    }
}

export function validateLocalEnvironment(env) {
    if (
        (env.NODE_ENV ?? "development") !== "development" ||
        (env.APP_ENV ?? "development") !== "development"
    ) {
        throw new Error("Os comandos da raiz exigem NODE_ENV e APP_ENV de desenvolvimento.");
    }

    for (const name of ["DATABASE_URL", "DIRECT_URL"]) {
        if (name === "DIRECT_URL" && !env[name]) continue;
        let url;
        try {
            url = new URL(env[name]);
        } catch {
            throw new Error(`${name} deve conter a conexão PostgreSQL local do QuestLog.`);
        }
        if (
            !["postgres:", "postgresql:"].includes(url.protocol) ||
            !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
            (url.port && url.port !== "5432") ||
            url.pathname !== "/quest_log" ||
            [...url.searchParams.keys()].some((key) =>
                [
                    "host",
                    "hostaddr",
                    "port",
                    "database",
                    "dbname",
                    "service",
                    "servicefile",
                ].includes(key.toLowerCase()),
            )
        ) {
            throw new Error(
                `${name} deve apontar para o banco local quest_log na porta 5432. Confira também as variáveis do terminal.`,
            );
        }
    }
}

export async function assertPortsAvailable(services) {
    if (new Set(services.map(({ port }) => port)).size !== services.length) {
        throw new Error("Dois servidores foram configurados para a mesma porta.");
    }
    for (const { name, port } of services) {
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            throw new Error(`A porta de ${name} deve ser um inteiro entre 1 e 65535.`);
        }
        // Confere IPv4 e IPv6 explicitamente: um bind genérico pode coexistir com
        // um servidor restrito ao loopback no Windows e esconder o conflito.
        for (const host of ["127.0.0.1", "::1"]) {
            const occupied = await new Promise((resolveConnection, reject) => {
                const socket = connect({ host, port });
                socket.once("connect", () => {
                    // Fecha a consulta sem resetar a conexão do servidor existente.
                    socket.end();
                    socket.resume();
                    resolveConnection(true);
                });
                socket.once("error", (error) => {
                    socket.destroy();
                    if (
                        ["ECONNREFUSED", "EAFNOSUPPORT", "EADDRNOTAVAIL", "ENETUNREACH"].includes(
                            error.code,
                        )
                    )
                        resolveConnection(false);
                    else
                        reject(
                            new Error(
                                `Não foi possível consultar a porta ${port} de ${name} (${error.code}).`,
                            ),
                        );
                });
                socket.setTimeout(1500, () => {
                    socket.destroy();
                    reject(
                        new Error(
                            `A verificação da porta ${port} de ${name} excedeu o tempo limite.`,
                        ),
                    );
                });
            });
            if (occupied)
                throw new Error(
                    `A porta ${port} de ${name} já está ocupada. Encerre o servidor no outro terminal antes de continuar.`,
                );
            await new Promise((resolvePort, reject) => {
                const server = createServer();
                server.once("error", (error) => {
                    if (host === "::1" && ["EAFNOSUPPORT", "EADDRNOTAVAIL"].includes(error.code)) {
                        resolvePort();
                        return;
                    }
                    reject(
                        new Error(
                            error.code === "EADDRINUSE"
                                ? `A porta ${port} de ${name} já está ocupada. Encerre o servidor no outro terminal antes de continuar.`
                                : `Não foi possível verificar a porta ${port} de ${name} (${error.code}).`,
                        ),
                    );
                });
                server.listen({ port, host, exclusive: true }, () => server.close(resolvePort));
            });
        }
    }
}

async function run(command, args, options = {}) {
    await new Promise((resolveCommand, reject) => {
        const child = spawn(command, args, { cwd: root, stdio: "inherit", ...options });
        child.once("error", () =>
            reject(
                new Error(
                    `Não foi possível executar ${command}. Confira se a ferramenta está instalada.`,
                ),
            ),
        );
        child.once("exit", (code, signal) => {
            if (code === 0) resolveCommand();
            else
                reject(
                    new Error(
                        `A etapa ${args.join(" ")} foi interrompida (${signal ?? code}). As próximas etapas não serão iniciadas.`,
                    ),
                );
        });
    });
}

async function runNpm(args, cwd, env = process.env) {
    if (!process.env.npm_execpath) throw new Error("Execute este comando por npm run.");
    // Usa o CLI que iniciou o script, sem depender de executar npm.cmd por um shell.
    await run(process.execPath, [process.env.npm_execpath, ...args], { cwd, env });
}

async function startInfrastructure() {
    try {
        await access(resolve(root, ".env"));
    } catch {
        throw new Error("Crie o .env da raiz a partir de .env.example antes de iniciar o Docker.");
    }
    console.log("[DEV] Iniciando a infraestrutura e aguardando o PostgreSQL...");
    await run("docker", [
        "compose",
        "--progress",
        "quiet",
        "up",
        "-d",
        "--wait",
        "--wait-timeout",
        "90",
    ]);
    console.log("[DEV] Infraestrutura pronta.");
}

async function toolArguments(cwd, packageName, args) {
    const manifestPath = resolve(cwd, "node_modules", packageName, "package.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const binary = typeof manifest.bin === "string" ? manifest.bin : manifest.bin[packageName];
    return [resolve(dirname(manifestPath), binary), ...args];
}

async function main() {
    const [action, ...flags] = process.argv.slice(2);
    if (
        !["setup", "db:prepare", "dev"].includes(action) ||
        flags.some((flag) => action !== "dev" || flag !== "--storybook")
    ) {
        throw new Error("Use npm run setup, npm run db:prepare, npm run dev ou npm run dev:full.");
    }
    if (action === "setup") {
        await readBackendEnvironment();
        await runNpm(["ci"], backend);
        await runNpm(["ci"], frontend);
        await runNpm(["exec", "--", "prisma", "generate"], backend);
        console.log("[DEV] Dependências e Prisma Client prontos. Execute npm run db:prepare.");
        return;
    }

    const env = await readBackendEnvironment();
    validateLocalEnvironment(env);
    if (action === "db:prepare") {
        await startInfrastructure();
        await runNpm(["exec", "--", "prisma", "migrate", "deploy"], backend, env);
        console.log("[DEV] Banco local preparado. Execute npm run dev ou npm run dev:full.");
        return;
    }

    const port = Number(env.PORT || env.PORT_LOCAL || "3000");
    const services = [
        { name: "API", port },
        { name: "WEB", port: 5173 },
    ];
    if (flags.includes("--storybook")) services.push({ name: "STORYBOOK", port: 6006 });
    try {
        await access(resolve(backend, "src/generated/prisma/client.ts"));
        await access(resolve(frontend, "node_modules/vite/package.json"));
    } catch {
        throw new Error("Execute npm run setup antes de iniciar os servidores.");
    }
    await assertPortsAvailable(services);
    await startInfrastructure();
    // Confere novamente após a espera pelo Docker; outro terminal pode ter iniciado um servidor.
    await assertPortsAvailable(services);
    console.log(
        [
            "",
            "Aplicação: http://localhost:5173/",
            `API:       http://localhost:${port}/`,
            "Swagger:   http://localhost:5173/api/docs/",
            ...(flags.includes("--storybook") ? ["Storybook: http://localhost:6006/"] : []),
            "",
            "[DEV] Ctrl+C encerra os servidores. Depois, npm run infra:stop para a infraestrutura.",
            "",
        ].join("\n"),
    );
    const commands = [
        {
            name: "API",
            args: await toolArguments(backend, "tsx", ["watch", "src/server.ts"]),
            cwd: backend,
            prefixColor: "blue",
            env: { PORT: String(port) },
            // Evita o travamento do tsx watch com stdin capturado no Windows.
            // https://github.com/privatenumber/tsx/issues/623
            raw: process.platform === "win32",
        },
        {
            name: "WEB",
            args: await toolArguments(frontend, "vite", [
                "--port",
                "5173",
                "--strictPort",
                "--logLevel",
                "warn",
                "--clearScreen",
                "false",
            ]),
            cwd: frontend,
            prefixColor: "green",
        },
    ];
    if (flags.includes("--storybook")) {
        commands.push({
            name: "STORYBOOK",
            args: await toolArguments(frontend, "storybook", [
                "dev",
                "-p",
                "6006",
                "--no-open",
                "--exact-port",
                "--disable-telemetry",
                "--loglevel",
                "warn",
            ]),
            cwd: frontend,
            prefixColor: "magenta",
        });
    }
    try {
        await runServers(commands);
    } finally {
        if (await hasRunningInfrastructure()) {
            console.log("[DEV] A infraestrutura continua ligada.");
        }
    }
}

class DevelopmentLogger extends Logger {
    // O grupo apresenta seu próprio resumo; mantém os erros e a saída das ferramentas.
    logGlobalEvent() {}
}

export async function runServers(
    commands,
    { signalSource = process, outputStream = process.stdout } = {},
) {
    const abortController = new AbortController();
    const logger = new DevelopmentLogger({ prefixFormat: "name" });
    let interrupted = false;
    const onSignal = () => {
        if (!interrupted) outputStream.write("\n[DEV] Encerrando servidores...\n");
        interrupted = true;
    };
    for (const signal of ["SIGINT", "SIGTERM"]) signalSource.on(signal, onSignal);
    const commandByName = new Map(commands.map((command) => [command.name, command]));
    try {
        // Argumentos separados e shell desabilitado evitam camadas de npm.cmd e
        // cmd.exe, inclusive para caminhos com espaços ou caracteres especiais.
        await createConcurrently(
            commands.map((command) => ({ ...command, command: command.name })),
            {
                logger,
                outputStream,
                abortSignal: abortController.signal,
                spawn: (name, options) =>
                    spawn(process.execPath, commandByName.get(name).args, {
                        ...options,
                        shell: false,
                    }),
                controllers: [
                    new LogError({ logger }),
                    new LogOutput({ logger }),
                    new KillOnSignal({ process: signalSource, abortController }),
                    new KillOthers({
                        logger,
                        conditions: ["success", "failure"],
                        timeoutMs: 5000,
                        abortController,
                    }),
                ],
            },
        ).result;
    } catch (events) {
        if (!interrupted) {
            const first = Array.isArray(events) ? events.find((event) => !event.killed) : undefined;
            throw new Error(
                `${first?.command.name ?? "Um dos servidores"} encerrou inesperadamente (código ${first?.exitCode ?? "indisponível"}); os demais deste grupo foram encerrados. Confira os logs acima.`,
            );
        }
    } finally {
        for (const signal of ["SIGINT", "SIGTERM"]) signalSource.off(signal, onSignal);
        if (interrupted) outputStream.write("[DEV] Servidores encerrados.\n");
    }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    main().catch((error) => {
        console.error(`[DEV] ${error.message}`);
        process.exitCode = 1;
    });
}
