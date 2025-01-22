import { Router } from "express";
import { authUser, login , register} from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/auth-user", authUser);

export default router;
