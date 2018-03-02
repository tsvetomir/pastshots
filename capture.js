const webdriver = require('selenium-webdriver');
require('geckodriver');
require('chromedriver');
const By = webdriver.By;
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs');
const path = require('path');
const urllib = require('url');
const mkdirp = require('mkdirp');
const imageminOptipng = require('imagemin-optipng');

const WIDTH = 1024;
const HEIGHT = 768;

exports.capture = async function capture({ browser, host, pages, output }) {
  const size = { width: WIDTH, height: HEIGHT };
  const driver = new webdriver.Builder()
    .forBrowser(browser)
    .setChromeOptions(new chrome.Options().windowSize(size))
    .setFirefoxOptions(new firefox.Options().headless().windowSize(size))
    .build();

  await setViewportSize(driver, size);

  mkdirp.sync(output);

  try {
    for (let page of pages) {
      const name = path.basename(page, '.html');
      const url = host + page;
      await runTest({ driver, url, name, output });
    }
  } catch (e) {
    console.error('Error during capture:', e);
  } finally {
    await driver.quit();
  }
};

async function setViewportSize(driver, size) {
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
  const width = size.width + chromeSize.width;
  const height = size.height + chromeSize.height;

  await driver.manage().window().setSize(width, height);
};

async function elementOrViewport(driver, selector) {
  let element;

  try {
    element = await driver.findElement(By.css(selector));
    console.log(`  Taking screenshot of element ${selector}`);
    return element;
  } catch(e) {
    console.log('  Taking screenshot of viewport');
    return driver;
  }
}


async function runTest({ driver, url, name, output }) {

  console.log(`Loading ${url}...`);
  await driver.get(url);
  await driver.sleep(200);

  const element = await elementOrViewport(driver, '#test-area');
  const data = await element.takeScreenshot();

  const png = Buffer.from(data, 'base64');
  const optimized = await imageminOptipng({ optimizationLevel: 3 })(png);

  fs.writeFileSync(`./${output}/${name}.png`, optimized);

  return true;
}
