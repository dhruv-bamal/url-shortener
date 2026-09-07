import { Router } from "express";
import {
  createUrl,
  getUrls,
  getUrl,
  updateUrl,
  deleteUrl,
} from "../controllers/url.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, createUrl);
router.get("/", authenticate, getUrls);
router.get("/:id", authenticate, getUrl);
router.put("/:id", authenticate, updateUrl);
router.delete(":id", authenticate, deleteUrl);

export default router;
