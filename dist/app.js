import express from "express";
import authRoutes from "./routes/auth.routes.js";
import urlRoutes from "./routes/url.routes.js";
import { redirectUrl } from "./controllers/url.controller.js";
const app = express();
app.use(express.json());
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
    });
});
app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);
app.get("/:shortCode", redirectUrl);
export default app;
