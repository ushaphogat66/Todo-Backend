import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import Joi from "joi";

interface CustomRequest extends Request {
  user?: any;
}

const prisma = new PrismaClient(); 

// * Register function to create a new user in the database.
export const register = async (req: Request, res: Response) => {


  const { email, password, name, tasks = [] } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: { email, name, password: hashedPassword },
      });

      if (tasks.length) {
        await prisma.task.createMany({
          data: tasks.map((task : object) => ({
            ...task,
            userId: newUser.id,
            id: undefined, 
          })),
        });
      }

      return newUser;
    });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, {
      expiresIn: "12h",
    });


    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error("Error during registration:", error);

    if (error === "P2002") {
      return res.status(409).json({ error: "Email is already registered" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

// * Login function to generate token for the user.
export const login = async (req: Request, res: Response) => {
  const { email, password, tasks =[] } = req.body;

  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid email or password" });

    if (tasks.length) {
      await prisma.task.createMany({
        data: tasks.map((task: { title: string; priority: string; text?: string }) => ({
          ...task,
          userId: user.id,
          id: undefined, 
        })),
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, {
      expiresIn: "12h",
    });
    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// * Function to authenticate the user and then send the user's data using JWT token.
export const authUser = (req: CustomRequest, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Login Again" });

  jwt.verify(token, process.env.JWT_SECRET as string, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Login Again" });

    const user = await prisma.user.findUnique({
      where: { id: (decoded as any).id },
    });

    if (!user) return res.sendStatus(403);

    const newToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, {
      expiresIn: "12h",
    });


    req.user = user;
    res.status(200).json({ token: newToken, user });
  });
};