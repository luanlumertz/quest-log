import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { routes } from "./routes/index.js"
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.middleware.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(urlencoded({ extended: true }));
app.disable("x-powered-by");
app.use(express.json());
app.use(cookieParser());

app.use(routes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
