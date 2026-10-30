import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi.js";
import { routes } from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.middleware.js";
import { getTrustProxyHops } from "./lib/trustProxy.js";
import { createCsrfProtection } from "./middlewares/csrf.middleware.js";
import { createOriginProtection } from "./middlewares/origin.middleware.js";
import { withRequestContext } from "./middlewares/requestContext.middleware.js";
import { getAppEnvironment } from "./lib/appEnvironment.js";
import { logger } from "./lib/logger.js";

const app = express();
const appEnvironment = getAppEnvironment();
const frontendOrigin = new URL(process.env.FRONTEND_URL ?? "").origin;

app.set("trust proxy", getTrustProxyHops());

app.use(withRequestContext);

// Temporário: remover depois de validar TRUST_PROXY_HOPS no sandbox hospedado.
if (appEnvironment === "sandbox" && process.env.PROXY_DIAGNOSTICS === "true") {
    app.use((req, _res, next) => {
        if (
            req.method === "GET" &&
            req.path === "/healthz" &&
            req.query.proxyDiagnostics === "true"
        ) {
            logger.info(
                {
                    event: "proxy-diagnostics",
                    trustProxyHops: app.get("trust proxy"),
                    socketIp: req.socket.remoteAddress,
                    forwardedFor: req.get("X-Forwarded-For") ?? null,
                    resolvedIp: req.ip,
                    resolvedIps: req.ips,
                },
                "[proxy-diagnostics]",
            );
        }

        next();
    });
}

app.use(helmet());
app.use((_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});
app.use(createOriginProtection(process.env.ORIGIN_SECRET));
app.use(
    cors({
        origin: frontendOrigin,
        credentials: true,
    }),
);
app.use(createCsrfProtection(frontendOrigin));
app.disable("x-powered-by");
app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === "development" || appEnvironment === "sandbox") {
    app.use(
        "/docs",
        helmet.contentSecurityPolicy({
            directives: {
                upgradeInsecureRequests: appEnvironment === "sandbox" ? [] : null,
            },
        }),
        swaggerUi.serve,
        swaggerUi.setup(openApiDocument, {
            customSiteTitle: "QuestLog API · Documentação",
            swaggerOptions: { withCredentials: true },
        }),
    );
}

app.use(routes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
