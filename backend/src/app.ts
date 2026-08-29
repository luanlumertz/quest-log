import express, { urlencoded } from "express";
import helmet from "helmet";
import cors from "cors";
import { routes } from "./routes/index.js"
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(urlencoded({ extended: true }));
app.disable("x-powered-by");
app.use(express.json());

app.use(routes);

app.use(errorHandler);

export default app;