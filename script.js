import puppeteer from "puppeteer";
import { configDotenv } from "dotenv";
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import axios from 'axios'
import fs from "fs";
configDotenv();



const port = process.env.PORT || 10000
const app = express();

//MIDDLEWARE
app.use(bodyParser.json())
app.use(morgan("dev"));


try{
(async()=>{


//HIGHLY IMPORTANT VARIABLES
    const wassitnumber = process.env.ANEMNUMERO
    const Govid = process.env.GOVNID
    const token = process.env.TOKEN
//LAUNCH
const browser = await puppeteer.launch({
    args: ['--disable-setuid-sandbox' , '--no-sandbox' , '--single-process' , "--no-zygote",],
    executablePath : process.env.NODE_ENV === "start" ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath() ,
    defaultViewport: {
        width : 1920,
        height : 1080

    },
   


});
const page  = await browser.newPage();

setInterval(async() => {


//CSS SELECTORS
const SendButton = "button.MuiButtonBase-root.MuiButton-root.MuiLoadingButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-root.MuiLoadingButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.muirtl-1m3iqmv"
const continueButton = "button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.muirtl-1om64lz"
const unavailbilityAlert = ".MuiAlert-message.muirtl-1xsto0d"

//GO TO PAGE
await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36")
await page.goto("https://minha.anem.dz/pre_inscription/",  { waitUntil: "networkidle2" } );
await page.screenshot({path:"screenshothome.png"} , console.log("TOOK SCREENSHOT"));



try{

  
    //TRY TO LOGIN
   

    await page.type("#numeroWassit", wassitnumber);
    await page.type("#numeroPieceIdentite", Govid);
    await page.click(SendButton);



    //IF LOGIN IS SUCCESSFULL



   if (await page.waitForSelector(continueButton) ){
       page.click(continueButton)
       console.log("Login Successfull!" )
   }







// CHECKING STATUS OF RESIGNATION FORM 
if (await page.waitForSelector(unavailbilityAlert)){
      

        console.log("THE SITE STILL CLOSED (STILL NO DATE TO APPLY) , TYRING AGAIN IN 1 HOUR")
        setTimeout(async() => {

         
          if(!fs.existsSync("timedScreenshots")){
              fs.mkdirSync("timedScreenshots")
          }

            await page.screenshot({path:`timedScreenshots/screenshot${Date()}.png`});


            //send the user informationn via AXIOS
           


            await page.reload();

        } , 3000)
       

}else{


    console.log("THE SITE IS OPEN , TRYING TO APPLY")
    await page.screenshot({path:`timedScreenshots/screenshot${Date()}.png`});
 //

 ////
//
 ///



}
    

}catch(err){console.log(err)}


}, 10000)   //1 HOUR


})() //call the function

}catch(err){console.log(err)}



















//--------------------------------------------EXPRESS SERVER PART---------------------------------------------------



app.get("/", (req, res) => {
    res.send("app is up and running");
});

//simple dummy test hook
app.post("/webhook" , (req , res)=>{
    console.log(req.body)
    res.status(200).send("EVENT_RECEIVED");


})

//CRON JOB to keep alive
app.get("/cron" , (req , res)=>{
    console.log("CRON JOB HAS BEEN TRIGGERED" , Date())
    res.status(200).send("CRON JOB HAS BEEN TRIGGERED");
    
})


app.listen(port, () => {
    console.log(`Server running on http://${process.env.HOST}:${process.env.PORT}`);
})










//--------------------------------------------PROCESS ARG TO CLEAR THE CACHE --Clear--------------------------------------------

if (process.argv[2] == "--clear"){
    if (fs.existsSync("timedScreenshots")){
        fs.rmdirSync("timedScreenshots",{recursive:true} , process.stdout.write('\x1Bc') ,console.log("Cache has been cleared"))
        process.exit(0)

    }else{
        process.stdout.write('\x1Bc')
        console.log("Cache does not exist")
        process.exit(0)
    }
}
