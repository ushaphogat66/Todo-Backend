"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskById = exports.deleteTask = exports.updateTask = exports.getTasks = exports.createTask = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
/**
 * Create a new task
 */
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, priority, dueDate, repeat, reminder, favorite, description } = req.body;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token)
        return res.status(401).json({ error: "Unauthorized" });
    const key = process.env.JWT_SECRET;
    const decoded = jsonwebtoken_1.default.verify(token, key);
    const userId = decoded.id;
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });
    try {
        const task = yield prisma.task.create({
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
    }
    catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.createTask = createTask;
/**
 * Get all tasks for the authenticated user
 */
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token)
        return res.status(401).json({ error: "Unauthorized" });
    const key = process.env.JWT_SECRET;
    const decoded = jsonwebtoken_1.default.verify(token, key);
    const userId = decoded.id;
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });
    try {
        const tasks = yield prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(tasks);
    }
    catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getTasks = getTasks;
/**
 * Update a task by its ID
 */
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { taskId } = req.params;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token)
        return res.status(401).json({ error: "Unauthorized" });
    const key = process.env.JWT_SECRET;
    const decoded = jsonwebtoken_1.default.verify(token, key);
    const userId = decoded.id;
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });
    try {
        const task = yield prisma.task.updateMany({
            where: { id: taskId, userId },
            data: { repeat: req.body.repeat, reminder: req.body.reminder, favorite: req.body.favorite, completed: req.body.completed, description: req.body.text
            },
        });
        if (task.count === 0)
            return res
                .status(404)
                .json({ error: "Task not found or not authorized" });
        res.status(200).json({ message: "Task updated successfully" });
    }
    catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateTask = updateTask;
/**
 * Delete a task by its ID
 */
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { taskId } = req.params;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token)
        return res.status(401).json({ error: "Unauthorized" });
    const key = process.env.JWT_SECRET;
    const decoded = jsonwebtoken_1.default.verify(token, key);
    const userId = decoded.id;
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });
    try {
        const task = yield prisma.task.deleteMany({
            where: { id: taskId, userId },
        });
        if (task.count === 0)
            return res
                .status(404)
                .json({ error: "Task not found or not authorized" });
        res.status(200).json({ message: "Task deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.deleteTask = deleteTask;
/**
 * Get a specific task by ID
 */
const getTaskById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId, userId } = req.params;
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });
    try {
        const task = yield prisma.task.findFirst({
            where: { id: taskId, userId },
        });
        if (!task)
            return res.status(404).json({ error: "Task not found" });
        res.status(200).json(task);
    }
    catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getTaskById = getTaskById;
