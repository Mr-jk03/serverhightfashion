
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json()); // ✅ Xử lý JSON từ request body
app.use(express.urlencoded({ extended: true })); // ✅ Hỗ trợ form-urlencoded

app.use("/api", routes);
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
