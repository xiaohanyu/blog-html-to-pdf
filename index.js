const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

function convertFilename(url, oldExt, newExt) {
  return url.substring(url.lastIndexOf("/") + 1).replace(oldExt, newExt);
}

async function captureToPDF(browser, url) {
  const pdfPath = path.join("output", convertFilename(url, ".html", ".pdf"));
  try {
    console.log(`capturing ${url} to pdf`);
    const page = await browser.newPage();
    await page.goto(url);
    await page.pdf({ path: pdfPath, format: "A4" });
    await page.close();
  } catch {
    console.error(`error when capturing ${url}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const urls = fs
    .readFileSync("blog.txt")
    .toString()
    .split("\n");

  const browser = await puppeteer.launch();

  for (let url of urls) {
    captureToPDF(browser, url);
    await sleep(10000);
  }

  await browser.close();
}

main();
