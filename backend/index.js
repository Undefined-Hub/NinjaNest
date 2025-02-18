require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToMongo = require("./src/config/db");
const app = express();
const port = process.env.PORT || 3000;

connectToMongo();

app.use(cors());
app.use(express.json());

// ? Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/user", require("./src/routes/userRoutes"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
