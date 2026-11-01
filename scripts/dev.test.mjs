import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { connect, createServer } from "node:net";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import { assertPortsAvailable, runServers, validateLocalEnvironment } from "./dev.mjs";

const local = { DATABASE_URL: "postgresql://questlog:senha@localhost:5432/quest_log" };

test("aceita as conexões locais de desenvolvimento, inclusive uma DIRECT_URL local", () => {
    for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
        const connection = `postgresql://questlog:senha@${host}:5432/quest_log`;
        assert.doesNotThrow(() =>
            validateLocalEnvironment({ DATABASE_URL: connection, DIRECT_URL: connection }),
        );
    }
});

test("recusa migrations em bancos remotos, de teste ou sandbox sem revelar a conexão", () => {
    for (const connection of [
        "postgresql://user:segredo@production.example.com/quest_log",
        "postgresql://user:segredo@localhost/quest_log_test",
        "postgresql://user:segredo@localhost/quest_log_sandbox",
        "postgresql://user:segredo@localhost:5433/quest_log",
        "postgresql://user:segredo@localhost/quest_log?host=production.example.com",
        "postgresql://user:segredo@localhost/quest_log?dbname=quest_log_test",
        "https://localhost/quest_log",
        "conexao-invalida",
        "",
    ]) {
        for (const name of ["DATABASE_URL", "DIRECT_URL"]) {
            assert.throws(
                () =>
                    validateLocalEnvironment({
                        ...local,
                        [name]: connection || (name === "DIRECT_URL" ? "invalida" : ""),
                    }),
                (error) => {
                    assert.ok(error.message.includes(name));
                    assert.ok(!error.message.includes("segredo"));
                    assert.ok(!error.message.includes("production.example.com"));
                    return true;
                },
            );
        }
    }
});

test("recusa ambientes de produção e sandbox", () => {
    for (const env of [{ NODE_ENV: "production" }, { APP_ENV: "sandbox" }, { NODE_ENV: "test" }]) {
        assert.throws(() => validateLocalEnvironment({ ...local, ...env }), /desenvolvimento/);
    }
});

test("uma porta ocupada é recusada e o servidor existente continua respondendo", async () => {
    const existing = createServer((socket) => socket.end("existente"));
    await new Promise((resolve) => existing.listen(0, "127.0.0.1", resolve));
    const port = existing.address().port;
    try {
        await assert.rejects(assertPortsAvailable([{ name: "WEB", port }]), /já está ocupada/);
        const response = await new Promise((resolve, reject) => {
            const socket = connect(port, "127.0.0.1");
            let data = "";
            socket.on("data", (chunk) => {
                data += chunk;
            });
            socket.once("end", () => resolve(data));
            socket.once("error", reject);
        });
        assert.equal(response, "existente");
    } finally {
        await new Promise((resolve) => existing.close(resolve));
    }
    await assertPortsAvailable([{ name: "WEB", port }]);
});

for (const host of ["0.0.0.0", "::1"]) {
    test(`detecta também um servidor escutando em ${host}`, async (t) => {
        const existing = createServer((socket) => socket.end());
        try {
            await new Promise((resolveListen, reject) => {
                existing.once("error", reject);
                existing.listen(0, host, resolveListen);
            });
        } catch (error) {
            if (["EAFNOSUPPORT", "EADDRNOTAVAIL"].includes(error.code)) {
                t.skip("IPv6 não está disponível neste sistema.");
                return;
            }
            throw error;
        }
        try {
            await assert.rejects(
                assertPortsAvailable([{ name: "API", port: existing.address().port }]),
                /já está ocupada/,
            );
        } finally {
            await new Promise((resolveClose) => existing.close(resolveClose));
        }
    });
}

test("recusa portas inválidas ou compartilhadas entre dois servidores", async () => {
    for (const port of [0, -1, 65536, NaN, 1.5]) {
        await assert.rejects(assertPortsAvailable([{ name: "API", port }]), /inteiro/);
    }
    await assert.rejects(
        assertPortsAvailable([
            { name: "API", port: 5173 },
            { name: "WEB", port: 5173 },
        ]),
        /mesma porta/,
    );
});

for (const exitCode of [0, 1, "SIGINT"]) {
    test(
        exitCode === "SIGINT"
            ? "Ctrl+C encerra o grupo sem indicar falha ou deixar processos e listeners ativos"
            : `encerra os três servidores do grupo quando um comando sai com código ${exitCode}`,
        { timeout: 20000 },
        async (t) => {
            const fixturesRoot = fileURLToPath(new URL("./", import.meta.url));
            const fixture = await mkdtemp(resolve(fixturesRoot, ".tmp-dev-test-"));
            t.after(async () => {
                for (const file of await readdir(fixture)) {
                    if (!file.endsWith(".pid")) continue;
                    const pid = Number(await readFile(resolve(fixture, file), "utf8"));
                    try {
                        process.kill(pid);
                    } catch (error) {
                        if (error.code !== "ESRCH") throw error;
                    }
                }
                if (!fixture.startsWith(resolve(fixturesRoot, ".tmp-dev-test-")))
                    throw new Error("Pasta temporária inesperada.");
                await rm(fixture, { recursive: true, force: true });
            });
            await writeFile(
                resolve(fixture, "server.mjs"),
                `
            import { createServer } from 'node:net';
            import { existsSync, writeFileSync } from 'node:fs';
            const name = process.env.FIXTURE_NAME;
            createServer().listen(0, '127.0.0.1', () => {
                writeFileSync(name + '.pid', String(process.pid));
                setInterval(() => {
                    if (name === 'API' && existsSync('exit')) {
                        if (${exitCode === 0 ? "false" : "true"}) console.error('falha de teste');
                        process.exit(${typeof exitCode === "number" ? exitCode : 0});
                    }
                }, 30);
            });
        `,
            );
            const signals = new EventEmitter();
            const output = new PassThrough();
            let text = "";
            output.on("data", (chunk) => {
                text += chunk;
            });
            const group = runServers(
                ["API", "WEB", "STORYBOOK"].map((name) => ({
                    name,
                    cwd: fixture,
                    args: ["server.mjs"],
                    env: { FIXTURE_NAME: name },
                })),
                { signalSource: signals, outputStream: output },
            ).then(
                () => null,
                (error) => error,
            );
            const deadline = Date.now() + 10000;
            while ((await readdir(fixture)).filter((file) => file.endsWith(".pid")).length < 3) {
                if (Date.now() > deadline) throw new Error("Os servidores de teste não iniciaram.");
                await new Promise((resolveWait) => setTimeout(resolveWait, 30));
            }
            if (exitCode === "SIGINT") {
                signals.emit("SIGINT", "SIGINT");
                assert.equal(await group, null);
                assert.match(text, /Servidores encerrados/);
                assert.ok(!text.includes("A infraestrutura continua ligada"));
                assert.ok(!text.includes("exited with code"));
                assert.ok(!text.includes("Sending SIGTERM"));
            } else {
                await writeFile(resolve(fixture, "exit"), "");
                assert.match((await group).message, /API encerrou inesperadamente/);
                if (exitCode === 1) assert.match(text, /falha de teste/);
            }
            for (const name of ["API", "WEB", "STORYBOOK"]) {
                const pid = Number(await readFile(resolve(fixture, name + ".pid"), "utf8"));
                assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
            }
            assert.equal(signals.listenerCount("SIGINT"), 0);
            assert.equal(signals.listenerCount("SIGTERM"), 0);
        },
    );
}
