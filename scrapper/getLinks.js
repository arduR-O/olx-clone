import { writeFileSync } from "fs";
import { By, Builder, Browser } from "selenium-webdriver";
import { sleep } from "./sleep.js";

/**
 * returns object containing {id<number> : link<string>}, where link is the link scrapped from individual product cards
 * @param {string} link - link to the home page containing the product cards
 * @param {number} startIndex - optional parameter which can be used for scrapping links from multiple pages in a loop. See multipageScrape() function logic for details
 * @returns Promise<object<number,string>>
 */
export async function getLinks(link, startIndex = 0) {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();

  try {
    await driver.get(link);
    await driver.manage().window().maximize();
    driver.executeScript("window.scrollBy(0,document.body.scrollHeight)", "");
    await sleep(1000);
    const selector = `//*[@id="main_content"]/div/div/section/div/div/div[5]/div[2]/div[1]/div[2]/ul`;
    const xpaths = Array(50)
      .fill(selector)
      .map((e, i) => e + `/li[${i + 1}]/a`);
    const links = {};
    for (const [i, path] of xpaths.entries()) {
      try {
        const webEle = await driver.findElement(By.xpath(path));
        const link = await webEle.getAttribute("href");
        links[startIndex + i] = link;
      } catch (error) {
        console.log("Hey Bhagwaan ", i);
        continue;
      }
    }
    driver.quit();
    return links;
  } catch (err) {
    driver.quit();
    console.log("Hey Raaam!!  ", err);
  }
}

/**
 * scraps links from multiple pages
 * @param {string[]} links - array of links of pages which contains product cards
 * @returns Promise<object<number, string>> (idk how you should datatypes in js)
 */
async function mutlipageScraping(links) {
  let finalLinks = {};

  /*this lets us parallely fetch data from each page. Promise.all() will returns a single promise containing the fulfillment value of all the promises that were passed. Refer MDN docs for more details.
  
  Now, getLinks returns an object containing all scrapped links from the input page link (wrapped in a promise ofc). But since we are using Promise.all(), we will get an array of objects, not promises... all enclosed in single promise.

  So we use map to merge all these objects, corresponding to links from a single page, into finalLinks object
  */
 //! if you don't put await before Promise, function will just return the empty finalLinks since Promise gonna run async
  await Promise.all(links.map((link, index) => getLinks(link, 100 * index))).then(
    (pagesLinks) => {
      pagesLinks.map(
        (pageLinks) => (finalLinks = { ...finalLinks, ...pageLinks })
      );
    }
  )
  return finalLinks
}

const links = [
  "https://www.olx.in/en-in/cars_c84",
  "https://www.olx.in/en-in/cars_c84?page=2",
  "https://www.olx.in/en-in/cars_c84?page=3",
  "https://www.olx.in/en-in/cars_c84?page=4",
  "https://www.olx.in/en-in/cars_c84?page=5",
];

const fileName = "carLinks";
mutlipageScraping(links)
  .then((finalLinks) => {
    finalLinks = JSON.stringify(finalLinks, null, 2);
    writeFileSync(`${fileName}.json`, finalLinks);
  });
