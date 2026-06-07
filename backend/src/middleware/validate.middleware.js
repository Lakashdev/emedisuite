/**
 * Simple validation helpers — avoids pulling in a full validation library.
 * Usage: router.post("/route", validate(mySchema), controller)
 */

/**
 * validate(schema) — schema is an object like:
 *   { name: { required: true, type: "string", minLength: 2 },
 *     email: { required: false, type: "email" } }
 */
export function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body?.[field];

      if (rules.required && (value === undefined || value === null || value === "")) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value === undefined || value === null || value === "") continue;

      if (rules.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field} must be a valid email`);
      }

      if (rules.type === "string" && typeof value !== "string") {
        errors.push(`${field} must be a string`);
      }

      if (rules.type === "number" && isNaN(Number(value))) {
        errors.push(`${field} must be a number`);
      }

      if (rules.minLength && String(value).length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }

      if (rules.maxLength && String(value).length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }

      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(", ")}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    next();
  };
}

/* ── Common schemas ── */
export const loginSchema = {
  identifier: { required: true, type: "string", minLength: 3, maxLength: 100 },
  password:   { required: true, type: "string", minLength: 6, maxLength: 128 },
};

export const registerSchema = {
  name:     { required: true,  type: "string", minLength: 2, maxLength: 80 },
  password: { required: true,  type: "string", minLength: 6, maxLength: 128 },
};
