require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");
const { startScheduler } = require("./src/scheduler");

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  "https://secret-santa-1-jfeb.onrender.com",
  "https://secret-santa-1-lyk0.onrender.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS: " + origin));
  },
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
