const express = require("express");
const userRouter = require("./routes/user-routes");
const blogRouter = require("./routes/blog-routes");
const client = require("prom-client");
require("./config/db");
const cors = require("cors");

const app = express();

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: "my-node-app",
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// Sample route
app.get("/", (req, res) => {
  res.send("Hello from Node.js app!");
});

// Expose metrics endpoint
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});
app.use(cors());

app.set("view engine", "ejs");
app.use(express.json());

// Middleware to track HTTP requests
app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer({
    method: req.method,
    route: req.path,
  });
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.path,
      status_code: res.statusCode,
    });
    end({ status_code: res.statusCode });
  });
  next();
});

app.use("/api/users", userRouter);
app.use("/api/blogs", blogRouter);

app.use("/api", (req, res, next) => {
  res.send("hello");
});

//define port

app.listen(5001, () => console.log("app started at 5001..."));
