const webdriver = require('selenium-webdriver');
require('geckodriver');
const By = webdriver.By;
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs');
const path = require('path');
const urllib = require('url');

exports.capture = async function capture({ host, pages, dimensions, output }) {

  const binary = new firefox.Binary(firefox.Channel.RELEASE);
  binary.addArguments('-headless');

  const options = new firefox.Options();
  options.setBinary(binary);

  const driver = new webdriver.Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .build();

  try {
    for (let page of pages) {
      const name = path.basename(page, '.html');
      const url = host + page;
      await runTest({ driver, url, dimensions, name, output });
    }
  } catch (e) {
    console.error('Error during capture:', e);
  } finally {
    driver.quit();
  }
};

async function runTest({ driver, url, dimensions, name, output }) {
  const { innerSize, outerSize } = await driver.executeScript(`
    return {
      outerSize: {
        width: window.outerWidth,
        height: window.outerHeight
      },
      innerSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  `);

  const chromeSize = {
    width: outerSize.width - innerSize.width,
    height: outerSize.height - innerSize.height
  };

  console.log(`Loading url ${url}...`);
  await driver.get(url);
  await driver.sleep(1000);

  for (let [width, height] of dimensions) {
    await driver.manage().window().setSize(width + chromeSize.width, height + chromeSize.height);
    await driver.sleep(1000);
    const data = await driver.takeScreenshot();
    const b = Buffer.from(data, 'base64');
    fs.writeFileSync(`./${output}/${name}.png`, b);
  }

  return true;
}
