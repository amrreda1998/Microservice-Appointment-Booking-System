import { Router } from "express";
import {
  getUserNotifications,
  getStats,
} from "../controllers/notificationControllers";
import { authenticateToken, authorizeUser } from "../middleware/authMiddleware";

const router = Router();

// Apply authentication to all notification routes
router.use(authenticateToken);

// Get user notifications
router.get("/:userId", authorizeUser, getUserNotifications);

// Get notification statistics (admin only)
router.get(
  "/stats",
  (req, res, next) => {
    const user = (req as any).user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  },
  getStats
);

export default router;
