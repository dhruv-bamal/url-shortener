import pool from "../db/index.js";
function generateShortCode(length = 6) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}
export async function createUrl(req, res) {
    try {
        const { originalUrl } = req.body();
        const userId = req.user?.userId;
        if (!originalUrl) {
            return res.status(400).json({
                message: "Original URL is required",
            });
        }
        const shortCode = generateShortCode();
        const result = await pool.query(`INSERT INTO urls (user_id, original_url, short_code)
        VALUES ($1, $2, $3)
        RETURNING id, original_url, short_code, created_at`, [userId, originalUrl, shortCode]);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
export async function getUrls(req, res) {
    try {
        const userId = req.user?.userId;
        const result = await pool.query(`SELECT id, original_url, short_code, created_at, updated_at
       FROM urls
       WHERE user_id = $1
       ORDER BY created_at DESC`, [userId]);
        return res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
export async function getUrl(req, res) {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const result = await pool.query(`SELECT id, original_url, short_code, created_at, updated_at
       FROM urls
       WHERE id = $1 AND user_id = $2`, [id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "URL not found",
            });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
export async function updateUrl(req, res) {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { originalUrl } = req.body;
        if (!originalUrl) {
            return res.status(400).json({
                message: "Original URL is required",
            });
        }
        const result = await pool.query(`UPDATE urls
       SET original_url = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING id, original_url, short_code, created_at, updated_at`, [originalUrl, id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "URL not found",
            });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
export async function deleteUrl(req, res) {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const result = await pool.query(`DELETE FROM urls
       WHERE id = $1 AND user_id = $2
       RETURNING id`, [id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "URL not found",
            });
        }
        return res.json({
            message: "URL deleted successfully",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
export async function redirectUrl(req, res) {
    try {
        const { shortCode } = req.params;
        const result = await pool.query(`SELECT original_url
       FROM urls
       WHERE short_code = $1`, [shortCode]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "URL not found",
            });
        }
        return res.redirect(result.rows[0].original_url);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
