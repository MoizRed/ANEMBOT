# Anembot
Unemployment Grant Checker

A simple script that checks if unemployment grants are available and sends a notification if they are.

this script uses puppeteer package to open a browser and check if the unemployment grants are available.



## Installation

```
npm init
npm i puppeteer
npm i dotenv
```



## Usage

add your credentials in the .env file
```
ANEMNUMERO=[your anem number]
GOVNID=[your identity card number]
```

```node script.js```

## Launch options 



```

node script.js

node script.js --clear //clears the screenshots in the cache folder

node script --time //sets the time between checks 
example : 

node script --time=5000 //sets the time between checks to 5 seconds

node script --time=10000 //sets the time between checks to 10 seconds


node script --send //sends a notification if the unemployment grants are available

node script --bg //runs the script in the background
```


### TODO
integrate axios.\
set time between checks launch options.
add run in background launch option.
