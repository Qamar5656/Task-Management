import express from "express";
import { errorHandler } from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.routes.js"
import taskRoutes from "./routes/task.routes.js"
import workspaceRoutes from "./routes/workspace.routes.js"
import projectRoutes from "./routes/projects.routes.js"

const app= express()
app.use(express.json())

//API Routes
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/workspaces", workspaceRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/comment",commentRoutes)


app.use(errorHandler);

export default app;