import { Router } from "express";
import prisma from "../config/prisma";

const router = Router();

router.route("/").get().post();
router.route("/:id").get().put().delete();

export default router;
