import "dotenv/config";
import app from "./app.js";
import pool from "./db/index.js";

const PORT = process.env.PORT || 3000;

pool
  .query("SELECT NOW()")
  .then((result) => {
    console.log("DATABASE CONNECTED: ", result.rows[0]);
  })
  .catch((error) => {
    console.error("DATABASE CONNECTION FAILED: ", error);
  });

app.listen(PORT, () => {
  console.log(`server is running on PORT ${PORT}`);
});
