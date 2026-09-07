import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/index.js";
export async function register(req, res) {
    try {
        const { email, password } = req.body();
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(`INSERT INTO users (email, password_hash)
            VALUES ($1, $2)
            RETURNING id, email, created_at`, [email, passwordHash]);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
export async function login(req, res) {
    try {
        const { email, password } = req.body();
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        const result = await pool.query(`SELECT id, email, password_hash FROM users WHERE email = $1`, [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        return res.json({ token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
