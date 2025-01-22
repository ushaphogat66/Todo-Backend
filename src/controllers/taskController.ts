import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

/**
 * Create a new task
 */
export const createTask = async (req: Request, res: Response) => {
  const { title, priority, dueDate ,repeat,reminder,favorite , description} = req.body;

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const key = process.env.JWT_SECRET;
  const decoded = jwt.verify(token, key as string);
  const userId = (decoded as jwt.JwtPayload).id;


  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const task = await prisma.task.create({
      data: {
        title,
        priority,
        dueDate,
        userId,
        repeat,
        reminder,
        favorite, 
        description,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all tasks for the authenticated user
 */
export const getTasks = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const key = process.env.JWT_SECRET;
  const decoded = jwt.verify(token, key as string);
  const userId = (decoded as jwt.JwtPayload).id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });


  try {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a task by its ID
 */
export const updateTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const key = process.env.JWT_SECRET;
  const decoded = jwt.verify(token, key as string);
  const userId = (decoded as jwt.JwtPayload).id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const task = await prisma.task.updateMany({
      where: { id:taskId, userId },
      data: { repeat: req.body.repeat, reminder: req.body.reminder, favorite: req.body.favorite, completed: req.body.completed , description: req.body.text

      },
    });

    if (task.count === 0)
      return res
        .status(404)
        .json({ error: "Task not found or not authorized" });

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a task by its ID
 */
export const deleteTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const key = process.env.JWT_SECRET;
  const decoded = jwt.verify(token, key as string);
  const userId = (decoded as jwt.JwtPayload).id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const task = await prisma.task.deleteMany({
      where: { id:taskId, userId },
    });

    if (task.count === 0)
      return res
        .status(404)
        .json({ error: "Task not found or not authorized" });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a specific task by ID
 */
export const getTaskById = async (req: Request, res: Response) => {
  const { taskId, userId } = req.params;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const task = await prisma.task.findFirst({
      where: { id:taskId, userId },
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
