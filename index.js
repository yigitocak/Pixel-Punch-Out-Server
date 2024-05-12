import express from 'express';
import morgan from "morgan";
import cors from 'cors'
import "dotenv/config";
import auth from './routes/auth.js';
import profiles from "./routes/profile.js"
import leaderboard from "./routes/leaderboard.js";
import room from "./routes/room.js"

const app = express();
const PORT = process.env.PORT || 8080;

app.use(morgan("dev"));
app.use(cors())
app.use(express.static("public"))

app.use('/auth', auth);
app.use("/profiles", profiles)
app.use('/leaderboard', leaderboard)
app.use('/rooms', room)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
