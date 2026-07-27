import express from "express";

import authRoutes from "./routes/auth.routes.js"
import taskRoutes from "./routes/task.routes.js"

const app= express()
app.use(express.json())

//API Routes
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)

export default app;