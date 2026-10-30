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

const app = express();
const appEnvironment = getAppEnvironment();
const frontendOrigin = new URL(process.env.FRONTEND_URL ?? "").origin;

app.set("trust proxy", getTrustProxyHops());

app.use(withRequestContext);

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
    app.get("/docs/navigation.js", (_req, res) => {
        res.type("application/javascript").send(`
            const describeAuthentication = () => {
                document.querySelectorAll(".swagger-ui .authorization__btn").forEach((button) => {
                    if (button.disabled) return;
                    button.disabled = true;
                    button.title = "Exige autenticação por cookie. Faça login em POST /auth/login.";
                    button.setAttribute("aria-label", button.title);
                });
            };
            new MutationObserver(describeAuthentication).observe(document.body, {
                childList: true,
                subtree: true,
            });
            describeAuthentication();
            document.addEventListener("click", (event) => {
                const link = event.target instanceof Element
                    ? event.target.closest('.swagger-ui a[href^="#/"]')
                    : null;
                if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                window.location.hash = link.getAttribute("href");
                window.ui.layoutActions.parseDeepLinkHash(decodeURIComponent(window.location.hash));
                const operationId = decodeURIComponent(window.location.hash).split("/")[2];
                if (!operationId) return;
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const operation = Array.from(document.querySelectorAll(".swagger-ui .opblock"))
                            .find((element) => element.id.endsWith("-" + operationId));
                        operation?.scrollIntoView({ behavior: "smooth", block: "start" });
                    });
                });
            });
        `);
    });
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
            customJs: "./navigation.js",
            customCss:
                ".swagger-ui .auth-wrapper { display: none; } .swagger-ui .authorization__btn:disabled { cursor: default; opacity: 1; }",
            swaggerOptions: { withCredentials: true, deepLinking: true },
        }),
    );
}

app.use(routes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
