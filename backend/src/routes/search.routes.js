import { Router } from "express";
import { searchCatalog } from "../controllers/search.controller.js";

export const searchRoutes = Router();

searchRoutes.get("/", searchCatalog);
