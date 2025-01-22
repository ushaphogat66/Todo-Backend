import { Router } from "express";
import { getTaskById, createTask, deleteTask, getTasks, updateTask } from "../controllers/taskController";

const router = Router();

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:taskId", getTaskById);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);


export default router;