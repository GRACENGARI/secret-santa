require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");
const { startScheduler } = require("./src/scheduler");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "x-admin-password"],
}));

app.use(express.json());
app.use("/api", routes);

// Health check
app.get("/", (req, res) => res.json({ status: "Secret Santa API running 🎅" }));

app.listen(PORT, () => {
  console.log(`Secret Santa backend running on http://localhost:${PORT}`);
  startScheduler();
});
