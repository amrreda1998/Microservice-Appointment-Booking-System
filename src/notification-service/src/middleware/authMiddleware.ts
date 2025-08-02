import { Request, Response, NextFunction } from "express";
import axios from "axios";
import logger from "../utils/logger";

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn("Authentication failed: No token provided", {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    logger.debug("Verifying authentication token", {
      token: token.substring(0, 10) + "...",
    });

    // Verify the token with the auth service
    const authServiceUrl =
      process.env.AUTH_SERVICE_URL || "http://localhost:3001";
    const response = await axios.get(`${authServiceUrl}/api/auth`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000, // 5 second timeout
    });

    if (response.status !== 200) {
      logger.warn("Token verification failed", {
        status: response.status,
        statusText: response.statusText,
        userId: response.data?.user?.id,
      });
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach user info to the request
    const user = response.data.user;
    (req as any).user = user;

    logger.info("User authenticated successfully", {
      userId: user.id,
      role: user.role,
      path: req.path,
      method: req.method,
    });

    next();
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Unknown error";
    const statusCode = error.response?.status || 500;

    logger.error("Authentication error", {
      error: errorMessage,
      status: statusCode,
      path: req.path,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    });

    return res.status(statusCode).json({
      message: "Authentication failed",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : errorMessage,
    });
  }
};

export const authorizeUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedUserId = req.params.userId;
  const requestingUser = (req as any).user;

  logger.debug("Authorizing user access", {
    requestingUserId: requestingUser.id,
    requestedUserId,
    role: requestingUser.role,
    path: req.path,
  });

  // Check if user is requesting their own data or is an admin
  if (
    requestingUser.id !== requestedUserId &&
    requestingUser.role !== "admin"
  ) {
    logger.warn("Authorization failed: Insufficient permissions", {
      requestingUserId: requestingUser.id,
      requestedUserId,
      role: requestingUser.role,
      path: req.path,
    });

    return res.status(403).json({
      message: "Not authorized to access this resource",
      error: "Insufficient permissions",
    });
  }

  logger.debug("User authorized successfully", {
    userId: requestingUser.id,
    path: req.path,
  });

  next();
};
