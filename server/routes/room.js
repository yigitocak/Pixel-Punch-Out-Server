import express from 'express'
import knex from 'knex'
import knexfile from "../knexfile.js";
import "dotenv/config"
import authenticateToken from "../middlewares/authenticateToken.js";


const db = knex(knexfile.development)
const room = express()
room.use(express.json())
const SECRET_KEY = process.env.SECRET_KEY

const generateRoomCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
}

// These routes are only for the websocket server to use, hence are protected by the secret key
room.get("/", async (req,res) => {
    if (req.body.key !== SECRET_KEY){
        return res.sendStatus(403)
    }
    else{
        try {
            const rooms = await db("room").select()
            return res.status(200).json(rooms)
        }
        catch (err){
            console.log(err)
            return res.sendStatus(500)
        }
    }
})

room.get("/:roomCode", async (req,res)=>{
    if (req.body.key !== SECRET_KEY){
        return res.sendStatus(403)
    }
    else{
        const {roomCode} = req.params
        const room = await db("room").select().where("roomCode", roomCode).first()
        return res.status(200).json(room)
    }
})

room.put("/finish/:roomCode", async (req,res)=> {
    if (req.body.key !== SECRET_KEY){
        return res.sendStatus(403)
    }
    else{
        const {roomCode} = req.params
        const room = await db("room").select().where("roomCode", roomCode).first()
        if (!room){
            return res.sendStatus(404)
        }
    }
    // select * from room where roomId = 21
})

room.post("/create", authenticateToken, async (req, res) => {
    const { arena, lives } = req.body;
    if (!arena || !lives) {
        return res.status(400).json({
            success: false,
            message: 'Bad request body. Expected arena and lives.'
        });
    }

    const roomCode = generateRoomCode();
    const roomData = {
        roomCode,
        arena,
        lives,
    };

    try {
        const [roomId] =  await db('room').insert(roomData);
        res.status(201).json({
            success: true,
            message: 'Room created',
            roomCode,
            roomId


        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to create room due to an internal error.'
        });
    }
});


export default room