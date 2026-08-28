import { Router } from "express";
import { getPong } from "../controllers/pong.controller.js";

export const pongRoute = Router();

pongRoute.get("/", getPong);