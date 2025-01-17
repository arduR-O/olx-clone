import { readFileSync, write, writeFile, writeFileSync } from "fs";
import { By, Builder, Browser } from "selenium-webdriver";
import { sleep } from "./sleep.js";
import { createCipheriv } from "crypto";

async function loadImages(driver, buttonPath) {
  await sleep(30000);
  const button = await driver.findElement(By.xpath(buttonPath));
  await driver.actions().scroll(0, 0, 0, 0, button).perform();
  for (let i = 0; i < 10; i++) {
    await button.click();
    console.log(`clickity click ${i} \n`);
    await sleep(2000);
  }
}

async function getAdditionalDetails(driver) {
  try {
    const detailElements = {};
    //TODO: make these simultaneous fetch
    detailElements["title"] = await driver.findElement(
      By.xpath(
        `//*[@id="main_content"]/div/div[2]/div/div[4]/div[1]/div[1]/div/div/h1`
      )
    );
    detailElements["subtitle"] = await driver.findElement(
      By.xpath(
        `//*[@id="main_content"]/div/div[2]/div/div[4]/div[1]/div[1]/div/div/div[2]`
      )
    );
    detailElements["fuel"] = await driver.findElement(
      By.xpath(
        `//*[@id="main_content"]/div/div[2]/div/div[4]/div[1]/div[1]/div/div/div[3]/div[1]/h2`
      )
    );
    detailElements["mileage"] = await driver.findElement(
      By.xpath(
        `//*[@id="main_content"]/div/div[2]/div/div[4]/div[1]/div[1]/div/div/div[3]/div[2]/div`
      )
    );
    detailElements["transmission"] = await driver.findElement(
      By.xpath(
        `//*[@id="main_content"]/div/div[2]/div/div[4]/div[1]/div[1]/div/div/div[3]/div[3]/h2`
      )
    );
    detailElements["price"] = await driver.findElement(
      By.xpath(
        `//*[@id="main_content"]/div/div[2]/div/div[4]/div[2]/div[1]/div/div[1]`
      )
    );
    detailElements["owner"] = await driver.findElement(
      By.xpath(
        `//*[@id="main_content"]/div/div[2]/div/div[4]/div[1]/div[2]/div/div[2]/div/div[1]/div[2]/div[2]`
      )
    );
    detailElements["location"] = await driver.findElement(
      By.xpath(
        `//*[@id="main_content"]/div/div[2]/div/div[4]/div[1]/div[2]/div/div[2]/div/div[2]/div[2]/div[2]`
      )
    );
    detailElements["postingDate"] = await driver.findElement(
      By.xpath(
        `//*[@id="main_content"]/div/div[2]/div/div[4]/div[1]/div[2]/div/div[2]/div/div[3]/div[2]/div[2]`
      )
    );
    detailElements["description"] = await driver.findElement(
      By.xpath(
        `//*[@id="main_content"]/div/div[2]/div/div[4]/div[1]/div[3]/div`
      )
    );
    const additionalDetails = {};
    for (const [field, data] of Object.entries(detailElements)) {
      const text = await data.getText();
      additionalDetails[field] = text;
    }
    return additionalDetails;
  } catch (e) {
    console.error("Hey Krishnaaa ", e);
  }
}
async function scrapeImages(driver) {
  const xpathPre = `//*[@id="main_content"]/div/div[2]/div/div[3]/div/div/div/div[1]/div/div/div/div`;
  const links = [];
  for (let i = 0; i < 10; i++) {
    try {
      const xpath = xpathPre + `[${i + 1}]` + `/div/div/div/figure/img`;
      const ele = await driver.findElement(By.xpath(xpath));
      const link = await ele.getAttribute("src");
      links.push(link);
      await sleep(10);
    } catch {
      console.log("HEEEEEEEEEEY RAAAAAAAAAAAAAAAM");
    }
  }
  return links;
}
export async function getDetails(loadFileName, saveFileName) {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();
  try {
    const data = readFileSync(loadFileName);
    const links = JSON.parse(data);
    console.log(links);
    // const buttonPath = `//*[@id="main_content"]/div/div[2]/div/div[3]/div/div/div/div[1]/span[2]`;
    const buttonPath = `//*[@id="main_content"]/div/div[2]/div/div[3]/div/div/div/div[1]/span[2]`;
    const details = {}
    for (const [id, link] of Object.entries(links)) {
      await driver.get(link);
      await loadImages(driver, buttonPath);
      const imageLinks = await scrapeImages(driver);
      console.log(imageLinks);
      const additionalDetails = await getAdditionalDetails(driver);
      console.log(additionalDetails);
      details[id] = [imageLinks, additionalDetails];
    }
    driver.quit();
    const detailsJSON = JSON.stringify(details, null, 2);
    writeFileSync(saveFileName, detailsJSON);
  } catch (error) {
    console.log("Hey RAAAAAAAAAAAAAAAAAAAM ", error);
    driver.quit();
  }
}

const fileName = "carLinks.json";
getDetails(fileName, "carDetails.json");
