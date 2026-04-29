import jwt from "jsonwebtoken";

const SECRET_KEY = "secret_key";

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch {
    return null;
  }
}

export function generateToken(userId: string) {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: "1d" });
}

export function decodeToken(token: string) {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}