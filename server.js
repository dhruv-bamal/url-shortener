import express from "express";
import dotenv from "dotenv";

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

dotenv.config();

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
