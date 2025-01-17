import { writeFileSync } from "fs";
import { By, Builder, Browser } from "selenium-webdriver";
import { sleep } from "./sleep";

export async function getLinks(link, fileName) {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();
  try {
    await driver.get(link);
    await sleep(5000).then(() => console.log("Iran"));
    const selector = `//*[@id="main_content"]/div/div/section/div/div/div[5]/div[2]/div[1]/div[2]/ul`;

    const xpaths = Array(50)
      .fill(selector)
      .map((e, i) => e + `/li[${i + 1}]/a`);
    console.log(xpaths);
    const links = {};
    for (const [i, path] of xpaths.entries()) {
      try {
        const webEle = await driver.findElement(By.xpath(path));
        const link = await webEle.getAttribute("href");
        links[i] = link;
        const jsonLinks = JSON.stringify(links, null, 2);
        writeFileSync(`${fileName}.json`, jsonLinks);
      } catch (error) {
        console.log("Hey Bhagwaan ", error);
        break;
      }
    }
    driver.quit();
    return links;
  } catch (err) {
    driver.quit();
    console.log("Hey Raaam!!  ", err);
  }
}
const link = "https://www.olx.in/en-in/cars_c84";
const fileName = "carLinks";
getLinks(link, fileName).then((e) => console.log(e));
