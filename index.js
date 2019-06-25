const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

function convertFilename(url) {
  return (url + ".pdf").replace(/\//g, '%');
}

async function captureToPDF(browser, url, pdfOutputDir) {
  const pdfPath = path.join(pdfOutputDir, convertFilename(url));
  try {
    console.log(`capturing ${url} to pdf`);
    const page = await browser.newPage();
    await page.goto(url);
    await page.pdf({ path: pdfPath, format: "A4" });
    await page.close();
  } catch (err) {
    console.error(`error when capturing ${url}, error message: ${err.message}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  if (process.argv.length != 4) {
    console.log("error!");
    console.log("usage: node index.js <pdf_output_dir> <url_list_file>")
    process.exit(-1);
  }

  let pdfOutputDir = process.argv[2];
  fs.mkdirSync(pdfOutputDir, { recursive: true });

  const urls = fs
    .readFileSync(process.argv[3])
    .toString()
    .split("\n");

  const browser = await puppeteer.launch();

  for (let url of urls) {
    captureToPDF(browser, url, pdfOutputDir);
    await sleep(5000);
  }

  await browser.close();
}

main();
