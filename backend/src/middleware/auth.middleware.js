import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const token = header.split(" ")[1];
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      return res.status(500).json({ message: "server misconfigured" });
    }

    const payload = jwt.verify(token, secret);

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({ message: "invalid or expired token" });
  }
};



export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "forbidden" });
    }

    next();
  };
};

