import express from "express"
import axios from "axios"
import morgan from "morgan"
import bodyParser from "body-parser"
import fs from "fs"
import { configDotenv } from "dotenv"
import { verify } from "crypto"

configDotenv();
const app = express()

app.use(morgan("dev"))
app.use(bodyParser.json())

app.get("/" , (req , res)=>{
    res.send("app is up and running")
})


app.get("/webhooks" , (req , res)=>{


    const query = req.query
    console.log(query)


  
   const mode = query["hub.mode"]
   const token = query["hub.verify_token"]
   const challenge = query["hub.challenge"]

    if(mode && token){
        if(mode =="subscribe" && token == process.env.VERIFY_TOKEN){

            res.status(200).send(challenge);

    }else{
        res.status(403).send("Forbidden")
    }
}
    
   console.log(mode , token , challenge)






    
})

app.post("/webhook" , (req , res)=>{
    

    //query



   
})


























app.listen(5000 , ()=>{
    console.log("\u{1F7EA} http://localhost:5000")
})

