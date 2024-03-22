import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRoute from "./routes/auth.js"
import usersRoute from "./routes/users.js"
import desksRoute from "./routes/desks.js"
import floorsRoute from "./routes/floors.js"
import reservationsRoute from "./routes/reservations.js"


const app = express()

dotenv.config()

const connect = async () =>{
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("Connected to Mongo DB")
       } catch (error){
           throw(error)
       }
}

mongoose.connection.on("disconnected", ()=>{
    console.log("MongoDB Disconnected");
})
mongoose.connection.on("connected", ()=>{
    console.log("MongoDB connected");
})

// Middlewares

app.use(express.json())

app.use("/api/auth", authRoute);    
app.use("/api/users", usersRoute);    
app.use("/api/desks", desksRoute);    
app.use("/api/floors", floorsRoute);    
app.use("/api/reservations", reservationsRoute);    



app.listen(8800, () => {
    connect()
    console.log("Connected to backend!")
})