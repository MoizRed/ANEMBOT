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
  process.exit(0);
});

//HIGHLY IMPORTANT VARIABLES
const wassitnumber = process.env.ANEMNUMERO;
const Govid = process.env.GOVNID;
const token = process.env.TOKEN;
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
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
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
        await page.click(loginbutton, console.log("➤CLICKED LOGIN BUTTON"));
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
            (process.env.INTERVAL) / 1000
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

          //send the user informationn via AXIOS

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
    process.env.INTERVAL,
    console.log(`➤waiting for ${(process.env.INTERVAL) / 1000} SECONDS`),
  ); //10 SECONDS

  //call the function

  res.send(200);
});

//--------------------------------------------EXPRESS SERVER PART---------------------------------------------------

app.get("/", (req, res) => {
  res.send("app is up and running");
});

//CRON JOB to keep alive
app.get("/cron", (req, res) => {
  console.log("CRON JOB HAS BEEN TRIGGERED", Date());
  res.status(200).send("CRON JOB HAS BEEN TRIGGERED");
});

app.listen(port, () => {
  console.log(
    `Server running on http://${process.env.HOST}:${process.env.PORT}`,
  );
});

//--------------------------------------------PROCESS ARG TO CLEAR THE CACHE --Clear--------------------------------------------

if (process.argv[2] == "--clear") {
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
