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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUser = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// * Register function to create a new user in the database.
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, tasks = [] } = req.body;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 12);
        const user = yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const newUser = yield prisma.user.create({
                data: { email, name, password: hashedPassword },
            });
            if (tasks.length) {
                yield prisma.task.createMany({
                    data: tasks.map((task) => (Object.assign(Object.assign({}, task), { userId: newUser.id, id: undefined }))),
                });
            }
            return newUser;
        }));
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "12h",
        });
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(201).json({ token, user: userWithoutPassword });
    }
    catch (error) {
        console.error("Error during registration:", error);
        if (error === "P2002") {
            return res.status(409).json({ error: "Email is already registered" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.register = register;
// * Login function to generate token for the user.
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, tasks = [] } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Email and password are required" });
    try {
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user)
            return res.status(401).json({ message: "Invalid email or password" });
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(401).json({ message: "Invalid email or password" });
        if (tasks.length) {
            yield prisma.task.createMany({
                data: tasks.map((task) => (Object.assign(Object.assign({}, task), { userId: user.id, id: undefined }))),
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "12h",
        });
        res.status(200).json({ token, user });
    }
    catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.login = login;
// * Function to authenticate the user and then send the user's data using JWT token.
const authUser = (req, res) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token)
        return res.status(403).json({ message: "Login Again" });
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        if (err)
            return res.status(403).json({ message: "Login Again" });
        const user = yield prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user)
            return res.sendStatus(403);
        const newToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "12h",
        });
        req.user = user;
        res.status(200).json({ token: newToken, user });
    }));
};
exports.authUser = authUser;
