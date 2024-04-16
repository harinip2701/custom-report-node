module.exports = function(RED) {
    function iplonReport(config) {
        RED.nodes.createNode(this,config);
        // Example function call
        var node = this;
        
        node.on('input', function(msg) {
           // node.status({fill: "blue", shape: "dot", text: "Processing"});
             
        // Update the status message to include the delay time
        var delayTime = 132000; // in milliseconds
        var minutes = Math.floor(delayTime / 60000);
        var seconds = Math.floor((delayTime % 60000) / 1000);
        var statusText = `Processing (${minutes} minutes ${seconds} seconds remaining)`;
        node.status({fill: "blue", shape: "dot", text: statusText});

            var contentArray = config.contentArray || []; 
            if (msg.payload && Array.isArray(msg.payload.urls)&& Array.isArray(msg.payload.heading)){         
var auth_string = msg.payload.auth_string;
var urls = msg.payload.urls;
var clientlogo = msg.payload.clientlogo;
var headings = msg.payload.heading;
var plantname = msg.payload.plantname;
var megawatt = msg.payload.megawatt;
// Retrieve email configuration from msg.payload
var userEmail = msg.payload.userEmail;
var userPass = msg.payload.userPass;
var fromEmail = msg.payload.fromEmail;
var toEmail = msg.payload.toEmail;
var ccEmail = msg.payload.ccEmail;
var customSubject = msg.payload.customSubject;
var customText = msg.payload.customText;
// Perform any processing with the received inputs here
console.log("Authentication String:", auth_string);
console.log("URLs:", urls);
console.log("Clientlogo url:", clientlogo);
console.log("Headings:", headings);
console.log("plant name:", plantname);
console.log("Mw:", megawatt);
console.log("Mail from this id:",userEmail);
console.log("Mail send to :",userPass);
console.log("Mail from this id:",fromEmail);
console.log("Mail send to :",toEmail);
console.log("cc to :",ccEmail);
console.log("subject:",customSubject);
console.log("Mail content:",customText);


msg.payload="you have to wait for 3 minutes to generate Report and Get it in your email"
node.send(msg);
//msg.payload
    for (var i = 0; i < urls.length; i++) {
        var url = urls[i];
        var heading = headings[i];
    var modifiedMsg = {
        payload: {
            auth_string: auth_string,
            url: url,
            clientlogo: clientlogo,
            heading: heading,
            plantname: plantname,
            megawatt: megawatt,
            userEmail: userEmail,
            userPass:userPass,
            fromEmail:fromEmail,
            toEmail: toEmail,
            ccEmail: ccEmail,
            customSubject: customSubject,
            customText: customText
        }
    };
    node.send(modifiedMsg);
};
} else {
// If the message format is invalid, log an error
node.error("Invalid message format: 'urls' array is required in msg.payload.");
}
    //javascript libraries
        const puppeteer = require('puppeteer');
        const path = require('path');
        const axios = require('axios');
        const fs = require('fs');
// so 1200 corresponds to 12.5".
const width_px = 1300;
// Generate authorization header for basic auth
const auth_header = 'Basic ' + Buffer.from(auth_string).toString('base64');
(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome', 
      // for docker few folks had issues. so added below line
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const page = await browser.newPage();
      // Set basic auth headers
      await page.setExtraHTTPHeaders({ 'Authorization': auth_header });
      // Increase timeout from the default of 30 seconds to 120 seconds, to allow for slow-loading panels
      await page.setDefaultNavigationTimeout(120000);

      // Increasing the deviceScaleFactor gets a higher-resolution image. The width should be set to
      // the same value as in page.pdf() below. The height is not important
      await page.setViewport({
        width: 1400,
        height: 900,
        deviceScaleFactor: 2,
        isMobile: false
      });
      // In some cases it may be appropriate to change this to {waitUntil: 'networkidle2'},
      // which stops when there are only 2 or fewer connections remaining.
      await page.goto(url, { waitUntil: 'networkidle0' });

      // Hide all panel description (top-left "i") pop-up handles and, all panel resize handles
      // Annoyingly, it seems you can't concatenate the two object collections into one
      await page.evaluate(() => {
        let infoCorners = document.getElementsByClassName('panel-info-corner');
        for (el of infoCorners) { el.hidden = true; }
        let resizeHandles = document.getElementsByClassName('react-resizable-handle');
        for (el of resizeHandles) { el.hidden = true; }
      });

      // Get the height of the main canvas, and add a margin
      var height_px = await page.evaluate(() => {
        return document.getElementsByClassName('react-grid-layout')[0].getBoundingClientRect().bottom;
      }) + 20;

      // == auto scroll to the bottom to solve long grafana dashboard start
      async function autoScroll(page) {
        await page.evaluate(async () => {
          await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var height_px = document.getElementsByClassName('react-grid-layout')[0].getBoundingClientRect().bottom;
            var timer = setInterval(() => {
              var scrollHeight = height_px;
              // select the scrollable view
              // in newer version of grafana the scrollable div is 'scrollbar-view'
              var scrollableEl = document.querySelector('.view') || document.querySelector('.scrollbar-view');
              // element.scrollBy(0, distance);
              scrollableEl.scrollBy({
                top: distance,
                left: 0,
                behavior: 'smooth'
              });

              totalHeight += distance;

              console.log('totalHeight', totalHeight);

              if (totalHeight >= scrollHeight) {
                clearInterval(timer);
                resolve();
              }
            }, 300);
          });
        });
      }
      await autoScroll(page);
      const path = require('path');
// locate the screenshots location 
        const screenshotPath = path.join('./node-red-contrib-iplon-report/report', `screenshot_${i}.png`);
         await page.screenshot({
         path: screenshotPath,
        width: width_px + 'px',
        height: height_px + 'px',
    //    format: 'Letter', <-- see note above for generating "paper-sized" outputs
        scale: 1,
        displayHeaderFooter: false,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      });

      await page.close();

    }
    await browser.close();
  } catch (error) {
    console.log(error);
  }
})();
async function downloadImage(url, outputPath) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(outputPath, Buffer.from(response.data));
      console.log('Client logo downloaded successfully.');
     
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }
  
  // Usage
  const clientLogoURL = clientlogo;
  const outputImagePath = './node-red-contrib-iplon-report/report/clientlogo.png';
  
  downloadImage(clientLogoURL, outputImagePath);
  

function delaytime(){
setTimeout(()=>{
async function generatePDFfromHTML(htmlContent, filename) {
    const fullPath = path.join('./node-red-contrib-iplon-report/report', filename);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Disable sandbox mode
    headless: true // Run in headless mode (no GUI)
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  await page.pdf({ path: fullPath, format: 'A4' });
  await browser.close();
}

async function getImageBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return Buffer.from(imageBuffer).toString('base64');
}

(async () => {
    // change the screenshot images to base64
    const base64ImageData = [];
    for (let i = 0; i < urls.length; i++) {
        const imageData = await getImageBase64(`./node-red-contrib-iplon-report/report/screenshot_${i}.png`);
        base64ImageData.push(imageData);
    }
    //placed our client logo and give a location where that logo image is located
    const clientlogos = await getImageBase64('./node-red-contrib-iplon-report/report/clientlogo.png');
   // const clientlogo = await getImageBase64('/home/iplon/node-red-contrib-iplon-report/report/clientlogo.png');
    //placed our logo and give a location where that logo image is located
    const iplon = await getImageBase64('./node-red-contrib-iplon-report/report/iplon.png');
    //give the serial no for table content
    let sno = '';
    for (let i = 2; i <= urls.length + 1; i++) {
        sno += `${i}`;
    }

    // give a pagenumber for table content
    let pageNumbers = [];
    let startingPage = 4; // Starting page number
    
    for (let i = 0; i < urls.length; i++) {
        // Calculate page number for each row, starting from 4
        let pageNumber = Math.floor(i / 2) + startingPage;
        pageNumbers.push(pageNumber);
    }

    // give table content
    let tableContent = '';
    for (let i = 0; i < urls.length ; i++) {
        tableContent += `
                <tr>
               <td>${sno[i]}</td>
              <td style="text-align:left">${headings[i]}</td>
                <td>${pageNumbers[i]}</td>
            </tr>
                `;
    }
   // let displayText = `${sno[i]}. ${headings[i]}`;
    let dynamicContent = '';
    for (let i = 0; i < urls.length ; i++) {
        if (i % 2 === 0) { // Even index, display one image
            dynamicContent += `
                 
                <h3>${sno[i]}. ${headings[i]}</h3>
                <br />
                <div style="text-align: center;">
                    <img src="data:image/png;base64,${base64ImageData[i]}" width="650" height="360">
                </div>
                <br /><br /><br />
            `;
        } else if (i % 2 === 1) { // Odd index, display two images
            dynamicContent += `
                <h3>${sno[i]}. ${headings[i]}</h3>
                <br />
                <div style="text-align: center;">
                    
                    <img src="data:image/png;base64,${base64ImageData[i]}" width="650" height="360">
                </div>
                <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
            `;
        }
    }
   
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.1">
    <title>Document</title>
    
     <style>
        .container {
            position: relative;
            width: 100%;
        }

        .image {
            display: block;
            width: 100%;
            height: auto;
        }

        .text {
            position: absolute;
            top: 55%;
            left: 65%;
            transform: translate(-50%, -50%);
            color: white; /* Set text color */
            font-family: Arial, sans-serif; /* Set font */
            font-size: 24px; /* Set font size */
            text-align: center; /* Center-align text */
            
        }
        .text h4{
            position: absolute;
            top: 100%;
            right: 1%;
            white-space: nowrap; 
        }
        .text h5{
            position: absolute;
            top: 100%;
            left: 1%;
            white-space: nowrap; 
            color:black;
        }
        
    </style>
    <style type="text/css">
        @page {
            size: A4;
            margin: 0;
        }

        body {
            margin: 0;
        }
    </style>
    
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            font-family: Arial;
        }
        

        .main {
            height: 100%;
            width: 100%;
        }

        .header {
            height: 10%;
            width: 100%;
            border: 1px solid black;
            position: fixed;
        }

        .content {
            width: 100%;
            text-align: left;
            padding-top: 200px;
            padding-left: 50px;
            padding-right: 50px;
        }

        .date {
            height: 50%;
            width: 50%;
            border: 1px solid black;
            text-align: center;
            padding: 10px 10px 10px 10px;
        }

        .version {
            height: 50%;
            width: 50%;
           
            text-align: center;
            padding: 10px 10px 10px 10px;
        }

        .left {
            float: left;
            height: 100%;
            width: 40%;
            text-align: center;
        }

        .logo {
            float: right;
            padding: 5px 5px 5px 5px;
        }
    </style>

</head>

<body>
 <div class="container"> <img class="image" src="data:image/png;base64,${iplon}" width="1000" height="1250">
           <div class="text">
            <h2 style="color:black;">${plantname}</h2>
            <h2 style="color:black;">${megawatt}</h2>
            <br /><br /><br /><br>
            <h3 style="color:black;">Monthly Portal Status</h3>
            <br />
         
            <h4 style="float: right;margin-right: 15px;color:black;">iPLON</h4>
      <br/><br/></h4>
                <h5><script>
                    document.write(new Date().toLocaleDateString()); 
                </script>
            </h5>
 </div></div>
<div style="page-break-after: always;"></div>
    <div class="main">
        <div class="header">
            <div class="logo">
            <h3><img src="data:image/png;base64,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" class="hello" width="200" height="90" >
                </h3>
            </div>
            <div class="left">
                
                <div class="version">
                    <img src="data:image/png;base64,${clientlogos}" width="198" height="70">

                   </div>

                </div>
            </div>
        </div>
      
        <div class="content">
            <style>
                table,
                th,
                td {
                    text-align: center;
                    border: 1px solid black;
                }
            </style>
            <div style="text-align: center;">
            <h2>VERSION HISTORY</h2> </div>
            <br />
            <table style="width:100%">
                <tr>
                    <th>VERSION</th>
                    <th>IMPLEMENTED BY</th>
                    <th>REVISION DATE</th>
                    <th>REASON</th>
                </tr>
                <tr>
                    <td>1.0</td>
                    <td>iplon crew</td>
                    <td>
                        <script>
                            document.write(new Date().toLocaleDateString()); 
                        </script>
                    </td>
                    <td>REPORT</td>
                </tr>
            </table>
            <p style="page-break-after: always"></p>
            <br /><br /><br /><br /><br /><br /><br /><br />
            <div style="text-align: center;">
            <h2>TABLE OF CONTENTS</h2></div>
            <br /><br />
            <table style="width:100%">
                <tr>
                    <th>S.NO</th>
                    <th>TITLE</th>
                    <th>PAGE NO</th>
                </tr>
                <tr>
                    <td>1</td>
                    <td style="text-align:left">Aim</td>
                    <td>3</td>
                </tr>
                ${tableContent}
            </table>
            <p style="page-break-after: always"></p>
            <br /><br /><br /><br /><br /><br /><br />
            <h3>1. Aim</h3>
            <br />
            <p>This report gives an overview for monthly iPLON portal status update of your plant</p>
            <br /> 
            <!-- Aim section -->
            <!-- Dynamic content section -->
            ${dynamicContent}
            <br />
           </div>
           </div>
              <script>
        window.onload = addPageNumbers;
            
        function addPageNumbers() {
          var totalPages = Math.ceil(document.body.scrollHeight / 842); // 842px A4 page height
          for (var i = 1; i <= totalPages; i++) {
            var pageNumberDiv = document.createElement("div");
            var pageNumber = document.createTextNode("Page " + i + " of " + totalPages);
            pageNumberDiv.style.position = "absolute";
            pageNumberDiv.style.top = "calc((" + i + " * (297mm - 0.5px)) - 40px)"; // 297mm A4 page height; 0.5px unknown necessary correction value; additional 40px margin from bottom(own element height included)
            pageNumberDiv.style.height = "16px";
            pageNumberDiv.appendChild(pageNumber);
            document.body.insertBefore(pageNumberDiv, document.getElementById("content"));
            pageNumberDiv.style.left = "calc(100% - (" + pageNumberDiv.offsetWidth + "px + 20px))";
          }
        }
    </script>
</body>
</html>
`;


  await generatePDFfromHTML(htmlContent,'report.pdf')
  .then(() => console.log('Report generated successfully'))
    .catch(err => console.error('Error generating PDF:', err));
})(); },131000)
}
delaytime();
function delaytime2(){
setTimeout(()=>{
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const fs = require('fs');

// Create a Nodemailer transporter using SMTP transport
const transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: userEmail,
        pass: userPass
    },
    debug: true
}));

// Function to send email with PDF attachment
async function sendEmail() {
    try {
        const pdfFilePath = './node-red-contrib-iplon-report/report/report.pdf';
        // Read the PDF file
        const pdfAttachment = {
            filename: 'report.pdf',
            content: fs.createReadStream(pdfFilePath)
        };

        let info;
        const mailOptions = {
            from: fromEmail,
            subject: customSubject || 'Monthly Report',
            text: customText || 'Please find the monthly report attached.',
            attachments: [pdfAttachment]
        };
    
        if (Array.isArray(toEmail)) {
            mailOptions.to = toEmail; // Pass array of email addresses directly
            if (ccEmail.length > 0) {
                mailOptions.cc = ccEmail; // Add CC recipients
            }
            info = await transporter.sendMail(mailOptions);
        } else {
            mailOptions.to = toEmail; // Single email address
            if (ccEmail.length > 0) {
                mailOptions.cc = ccEmail; // Add CC recipients
            }
            info = await transporter.sendMail(mailOptions);
        }
    
     
            /*let info;
            if (Array.isArray(toEmail)) {
                info = await transporter.sendMail({
                    from: fromEmail,
                    to: toEmail, // Pass array of email addresses directly
                    subject: 'Monthly Report',
                    text: 'Please find the monthly report attached.',
                    attachments: [pdfAttachment]
                });
            } else {
                info = await transporter.sendMail({
                    from: fromEmail,
                    to: toEmail, // Single email address
                    subject: 'Monthly Report',
                    text: 'Please find the monthly report attached.',
                    attachments: [pdfAttachment]
                });
            
            }*/
        // Send mail with defined transport object
        /*let info = await transporter.sendMail({
            from: fromEmail,
            to: toEmail.join(','), // Convert array of email addresses to comma-separated string
            subject: 'Monthly Report',
            text: 'Please find the monthly report attached.',
            attachments: [pdfAttachment]
        });*/

        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Call the sendEmail function to send the email
sendEmail();
msg.payload="success"

node.status({fill: "green", shape: "dot", text: "Finished"});
            node.send(msg);
 },132000)
 
}
delaytime2();
function monthlyReport() {
    // Get the current date
    const currentDate = new Date();

    // Check if it's the 1st day of the month
    if (currentDate.getDate() === 1) {
        // Call the sendEmail function to send the email
        sendEmail();
    }
}

// Calculate the time until the next month's 1st day
function timeUntilNextMonthFirstDay() {
    const currentDate = new Date();
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    // Calculate the time until the next month's 1st day
    const timeUntilNextMonthFirstDay = nextMonth - currentDate;
    return timeUntilNextMonthFirstDay;
}

// Register the function to be triggered at the start of every month
setTimeout(function() {
    monthlyReport();
    // Call the monthlyReport function at the start of every month
    setInterval(monthlyReport, 30 * 24 * 60 * 60 * 1000); // Check every day if it's the 1st day of the month
}, timeUntilNextMonthFirstDay());


        });
    }
    RED.nodes.registerType("iplon-report",iplonReport);
}




























