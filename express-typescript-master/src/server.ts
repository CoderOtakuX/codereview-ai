import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { healthCheckRouter } from "@/api/healthCheck/healthCheckRouter";
import { userRouter } from "@/api/user/userRouter";
import { openAPIRouter } from "@/api-docs/openAPIRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Setup to allow frontend connections
const originsFromEnv = env.CORS_ORIGIN.split(",").map(o => o.trim()).filter(Boolean);
const defaultOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"];
const allowedOrigins = [...originsFromEnv, ...defaultOrigins];

app.use(cors({
  origin: (origin, callback) => {
    // If no origin (like mobile apps or curl requests) allow it
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

import { authRouter } from "@/api/auth/authRouter";
import { reviewRouter } from "@/api/reviews/reviewRouter";

// Routes
app.use("/health-check", healthCheckRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);
app.use("/reviews", reviewRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
