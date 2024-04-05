import express from "express";
import { createDesk, deleteDesk, getAllDesks, getDeskById, updateDesk } from "../controllers/desk.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// CREATE
router.post("/", createDesk);   

// UPDATE
router.put("/:id", verifyAdmin, updateDesk);

// DELETE
router.delete("/:id/:reservation", verifyAdmin, deleteDesk);

// GET
router.get("/:id", verifyAdmin, getDeskById);

// GET ALL
router.get("/", getAllDesks);

export default router;
