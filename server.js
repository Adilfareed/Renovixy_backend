require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middlewares/errorHandler');
const routes = require('./src/routes'); // modular index that exports router
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const ErrorResponse = require("./src/utils/errorResponse");
connectDB();
const app = express();
app.use(express.json());



// ------------------------------------
// 🌐 CORS (Allow frontend communication)
// ------------------------------------
app.use(
  cors({
    origin: "http://localhost:3000", // You can replace this with your frontend domain later
    methods: "GET,POST,PUT,DELETE",
  })
);

// -----------------------------
// 📦 Body Parser
// -----------------------------
app.use(express.json());

// -------------------------------------------
// 🔐 Rate Limiting (Prevents brute-force)
// -------------------------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  message: "Too many requests, please try again later.",
});
app.use(limiter);
// mount API under /api
app.use('/api', routes);

// health
app.get('/health', (req,res)=>res.json({ok:true, time: new Date().toISOString(), message: "Server is running"}));

app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
