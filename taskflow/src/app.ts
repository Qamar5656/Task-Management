import express from "express";
import { errorHandler } from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.routes.js"
import taskRoutes from "./routes/task.routes.js"
import workspaceRoutes from "./routes/workspace.routes.js"
import projectRoutes from "./routes/projects.routes.js"
import commentRoutes from "./routes/comments.routes.js"
import labelRoutes from "./routes/label.routes.js"
import activityRoutes from "./routes/activity.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"
import userRoutes from "./routes/user.routes.js"
import cors from 'cors';

const app= express()
app.use(cors())
app.use(express.json())

//API Routes
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/workspaces", workspaceRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/comment",commentRoutes)
app.use("/api/labels", labelRoutes)
app.use("/api/activities", activityRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/user", userRoutes)

app.use(errorHandler);

export default app;