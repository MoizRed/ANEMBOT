import puppeteer from "puppeteer";
import { configDotenv } from "dotenv";
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import axios from "axios";
import fs from "fs";
import puppeteerExtraPluginStealth from "puppeteer-extra-plugin-stealth";
import puppeteerExtra from "puppeteer-extra";

configDotenv();




puppeteerExtra.use(puppeteerExtraPluginStealth());

const port = process.env.PORT || 10000;
const app = express();

//MIDDLEWARE
app.use(bodyParser.json());
app.use(morgan("dev"));

app.get("/stop", async (req, res) => {
  res.send("Server Stopped");
  interval = 6000000
});

//HIGHLY IMPORTANT VARIABLES
const wassitnumber = process.env.ANEMNUMERO;
const Govid = process.env.GOVNID;

//LAUNCH
const browser = await puppeteerExtra.launch({
  headless: false,
  args: [
 
    "--disable-setuid-sandbox",
    "--disable-web-security",
    "--no-sandbox",
    "--single-process",
    "--no-zygote",
    "--disable-dev-shm-usage",
    "--ignore-certificate-errors",
    "--ignore-certificate-errors-spki-list",
  ],
  executablePath: process.env.NODE_ENV === "production"
    ? process.env.PUPPETEER_EXECUTABLE_PATH
    : puppeteer.executablePath(),
  ignoreHTTPSErrors: true,
});

const page = await browser.newPage();

app.get("/run", async (req, res) => {
  console.log("➠TRIGGERD , RUNNING THE SCRIPT");
  setInterval(
    async () => {
      //CSS SELECTORS
      const registerbutton =
        ".MuiGrid-root.MuiGrid-item.muiltr-1wxaqej > .MuiButtonBase-root";
      const continueButton =
        "button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.muiltr-1itss8e";
      const unavailbilityAlert =
        "div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation0.MuiAlert-root.MuiAlert-outlinedError.MuiAlert-outlined.muiltr-17knusc";
      const loginbutton =
        ".MuiButtonBase-root.MuiButton-root.MuiLoadingButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-root.MuiLoadingButton-root.MuiButton-contained.MuiButton-containedPrimary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.muiltr-1rgscaf";

      //GO TO PAGE
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      );

      await page.setDefaultNavigationTimeout(0);

      await page.goto("https://minha.anem.dz", {
        waitUntil: "domcontentloaded",
        timeout: 0,
      }).then(async () => {
        console.log("➤PAGE LOADED");
        //REST OF THE CODE
      });

      await page.evaluate(() => {
        localStorage.setItem("i18nextLng", "fr");
        
      });
      await page.reload();

      await page.screenshot(
        { path: "screenshothome.png" },
        console.log("➤TOOK SCREENSHOT"),
      );

      //TRY TO LOGIN
      if (await page.waitForSelector(registerbutton)) {
        await page.click(
          registerbutton,
          console.log("➤CLICKED REGISTER BUTTON"),
        );

        await page.waitForSelector(
          loginbutton,
          console.log("➤WAITED FOR LOGIN BUTTON"),
        );



        //FILLING THE CREDENTIALS
        /*
        await page.type(
          "#numeroWassit",
          wassitnumber,
          console.log("➤ENTERED WASSIT NUMBER"),
        );
        await page.type(
          "#numeroPieceIdentite",
          Govid,
          console.log("➤ENTERED GOVN ID"),
        );
*/

  await page.evaluate((fields) => {
  fields.forEach(({ selector, value }) => {
    const input = document.querySelector(selector);
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}, [
  { selector: '#numeroWassit', value: wassitnumber },
  { selector: '#numeroPieceIdentite', value: Govid }
]);

    await page.click(loginbutton, console.log("➤CLICKED LOGIN BUTTON"));
        console.log("➤CLICKED LOGIN BUTTON");
      }        
      //IF LOGIN IS SUCCESSFULL

      if (await page.waitForSelector(continueButton)) {
        page.click(continueButton, console.log("➤CLICKED CONTINUE BUTTON"));
        console.log("➤LOGIN SUCCESSFUL");
      }

      // CHECKING STATUS OF RESIGNATION FORM
      if (await page.waitForSelector(unavailbilityAlert)) {
        console.log(
          `➤THE SITE STILL CLOSED (STILL NO DATE TO APPLY) , TYRING AGAIN IN ${
            (interval) / 1000
          } SECONDS`,
        );
        setTimeout(async () => {
          if (!fs.existsSync("timedScreenshots")) {
            fs.mkdirSync("timedScreenshots");
          }

          const screenshotPath = `timedScreenshots/screenshot${Date()}.png`;
          await page.screenshot(
            { path: screenshotPath },
            console.log("➤TOOK SCREENSHOT"),
          );

          //UPLOAD ATTACHMENT TO PAGE
          try {
            await axios.post(
              `https://graph.facebook.com/v21.0/${process.env.PAGE_ID}/message_attachments?access_token=${process.env.ACCESS_TOKEN}`,
              {
               
                recipient: { id: "9735997846484080" },
                message: {
                  attachment: {
                    type: "image",
                    payload: {
                      url: "https://i.imgur.com/nnVhCp9.png",
                      is_reusable: true,
                    },
                  },
                },
              } ,{
              headers: {
                ContentType: "application/json",
              },
            }
            );
          } catch (err) {
            console.log(err);
          }

          //SEND MESSAGE TO USER
          try {
            await axios.post("https://graph.facebook.com/v21.0/me/messages", {
              messaging_type: "RESPONSE",
              message: {
                text:
                  ` CHECKED at ${Date()} \n AND IT SEEMS LIKE THE SITE IS NOT OPEN  YET!`,
              },
              recipient: { id: "9735997846484080" },
            }, {
              headers: {
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
                ContentType: "application/json",
              },
            }, console.log("➤➤➤➤SENT MESSAGE TO USER"));
          } catch (error) {
            if (error.status === 400) {
              console.log(
                "➤➤➤➤MESSAGE WAS NOT SENT TO USER , try sending a message to the page first",
              );
            }
          }
          await page.reload(console.log("➤RELOADING THE PAGE"));
        }, 3000);
      } else {
        console.log("➤THE SITE IS OPEN , TRYING TO APPLY");
        await page.screenshot({
          path: `timedScreenshots/screenshot${Date()}.png`,
        });
        //

        ////
        //
        ///
      }
    },
    interval,
    console.log(`➤waiting for ${(interval) / 1000} SECONDS`),
  ); //10 SECONDS

  //call the function

  res.send(200);
});

//--------------------------------------------EXPRESS SERVER PART---------------------------------------------------

app.get("/", (req, res) => {
  res.send("app is up and running");
});

//CRON JOB to keep alive if hosted on render
app.get("/cron", (req, res) => {
  console.log("CRON JOB HAS BEEN TRIGGERED", Date());
  res.status(200).send("CRON JOB HAS BEEN TRIGGERED");
});

app.listen(port, () => {
  console.log(
    `Server running on http://${process.env.HOST}:${process.env.PORT}`,
  );
});

//--------------------------------------------PROCESS ARG --------------------------------------------
//PROCESS ARG TO CLEAR THE CACHE --Clear
for(let i = 0 ; i<=process.argv.length ; i++){
if (process.argv[i] == "--clear") {
  if (fs.existsSync("timedScreenshots")) {
    fs.rmdirSync(
      "timedScreenshots",
      { recursive: true },
      process.stdout.write("\x1Bc"),
      console.log("Cache has been cleared"),
    );
    process.exit(0);
  } else {
    process.stdout.write("\x1Bc");
    console.log("Cache does not exist");
    process.exit(0);
  }
}
}
//PROCESS ARG TO SET INTERVAL "-i"

const getInterval = () => {
  const defaultInterval = 10000 // 1 hour
  const intervalIndex = process.argv.indexOf('-i');
  
  if (intervalIndex !== -1 && process.argv[intervalIndex + 1]) {
    return Number(process.argv[intervalIndex + 1]);
  }
  
  return defaultInterval;
}
const interval = getInterval();

