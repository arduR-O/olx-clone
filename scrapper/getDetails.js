import { read, readFileSync, write, writeFile, writeFileSync } from "fs";
import {
  By,
  Builder,
  Browser,
  WebElement,
  WebDriver,
} from "selenium-webdriver";
import { sleep } from "./sleep.js";

/**
 * Loads images in olx product webpage by waiting and then repeatedly clicking the next image button in slideshow (olx has lazy loading for images)
 * @param {WebDriver} driver - webdriver instance which was used to open the webpage
 * @param {string} buttonPath - the xpath to botton which is to be clicked to load next image
 */
async function loadImages(driver, buttonPath) {
  try {
    await sleep(20000);
    const button = await driver.findElement(By.xpath(buttonPath));
    await driver.actions().scroll(0, 0, 0, 0, button).perform();
    for (let i = 0; i < 10; i++) {
      await button.click();
      console.log(`clickity click ${i} \n`);
      await sleep(1000);
    }
  } catch (err) {
    console.log(err);
  }
}

/**
 * returns object containing various attributes and values about the product. The webpage containing the product (car) should be already open. Attribute xpaths have been hardcoded.
 * @param {WebDriver} driver - webdriver instance which was used to open the webpage
 * @returns Promise<object<string,number>>
 */
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

/**
 * returns an array containing links of max 10 images of the product
 * @param {WebDriver} driver - webdriver instance which was used to open the product page
 * @returns Promise<object<number, string>>
 */
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

//TODO: I think it will be better if this function just concerns itself with scrapping data. Handle the file read/write shenanigans elsewhere
/**
 * creates JSON file containing product details
 * @param {string} loadFileName - name of JSON file from which links for product pages have to be fetched. JSON must be in same directory. Don't include .json extension in file name
 * @param {string} saveFileName - name of JSON file in which the details of the products is to be stored
 */
export async function getDetails(links) {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();
  try {
    const buttonPath = `//*[@id="main_content"]/div/div[2]/div/div[3]/div/div/div/div[1]/span[2]`;
    const details = {};
    for (const [id, link] of Object.entries(links)) {
      try {
        await driver.get(link);
        await loadImages(driver, buttonPath);
        const imageLinks = await scrapeImages(driver);
        console.log(imageLinks);
        const additionalDetails = await getAdditionalDetails(driver);
        console.log(additionalDetails);
        details[id] = [imageLinks, additionalDetails];
      } catch (err) {
        console.log(err);
      }
    }
    driver.quit();
    return details;
  } catch (error) {
    console.log("Hey RAAAAAAAAAAAAAAAAAAAM ", error);
    driver.quit();
  }
}

const fileName = "carLinks.json";
const links = JSON.parse(readFileSync(fileName, null, 2));
const filteredLinks = {};
for (const [id, data] of Object.entries(links)) {
  if (id > 209) {
    filteredLinks[id] = data;
  }
}
console.log(filteredLinks)
// getDetails(filteredLinks);
