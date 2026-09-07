import dotenv from "dotenv";
import app from "./app.js";
dotenv.config();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server is running on PORT ${PORT}`);
});
//# sourceMappingURL=server.js.map