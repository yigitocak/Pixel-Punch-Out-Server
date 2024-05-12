import express from 'express'
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'
import knex from 'knex'
import knexfile from "../knexfile.js";
import "dotenv/config"
import authenticateToken from "../middlewares/authenticateToken.js";

const db = knex(knexfile.development)
const SECRET_KEY = process.env.SECRET_KEY
const auth = express()
auth.use(express.json());

auth.post("/signup", async (req, res) => {
        if (!req.body.email || !req.body.password || !req.body.username) {
        return res.status(400).json({
            success: false, message: 'Bad request body.'
        })
    }
    const { username, email, password } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const insertedIds = await db('users').insert({
            username,
            email,
            password: hashedPassword,
            comments: JSON.stringify([])
        });


        res.status(201).json({
            success: true,
            message: 'User created successfully'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists'
            });
        }
        console.error('Error in sign-up:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
})

auth.post("/login", async (req, res) => {
    if (!req.body.email || !req.body.password){
        return res.status(400).json({
            success: false, message: 'Bad request body.'
        })
    }
    const { email, password, rememberMe } = req.body;
    try {
        const user = await db('users').where({ email }).first();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        const expiresIn = rememberMe ? '7d' : '1h';
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            SECRET_KEY,
            { expiresIn }
        );


        res.status(200).json({
            success: true,
            token,
            message: rememberMe ? "Logged in for 7d" : "Logged in for 1h",
            username: user.username
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

auth.get("/", authenticateToken, (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    const decoded = jwt.verify(token, SECRET_KEY)

    return res.status(200).json({
        decoded: decoded,
        success: true
    })
})

export default auth;




