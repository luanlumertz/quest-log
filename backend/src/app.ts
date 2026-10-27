import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { routes } from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.middleware.js";
import { getTrustProxyHops } from "./lib/trustProxy.js";
import { createCsrfProtection } from "./middlewares/csrf.middleware.js";

const app = express();
const frontendOrigin = new URL(process.env.FRONTEND_URL ?? "").origin;

app.set("trust proxy", getTrustProxyHops());

app.use(helmet());
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

app.use(routes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
