import { Router } from "express";
import prisma from "../config/prisma";

const router = Router();

router.route("/").get().post();
router.route("/:id").get().post().delete().put();

export default router;
