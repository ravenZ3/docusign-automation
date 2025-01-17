const { chromium } = require("playwright");

async function closePopup() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log("Navigating to GMX...");
    await page.goto("https://www.gmx.net/", { timeout: 80000 });

    await page.waitForLoadState("domcontentloaded");

    const consentIframe = page.frame({ url: /consent-management/ });
    if (!consentIframe) {
      console.error("Consent iframe not found!");
      return;
    }
    console.log("Consent iframe detected!");

    const nestedIframeElement = await consentIframe.waitForSelector('iframe.permission-core-iframe');
    const nestedIframe = await nestedIframeElement.contentFrame();
    if (!nestedIframe) {
      console.error("Nested iframe not found!");
      return;
    }
    console.log("Nested iframe detected!");

    const thirdIframeElement = await nestedIframe.waitForSelector('iframe');
    const thirdIframe = await thirdIframeElement.contentFrame();
    await thirdIframe.waitForSelector('body', { state: 'attached' });
    const modalSelector = 'div.window-content';
    const acceptButtonSelector = 'button#save-all-pur';

    await thirdIframe.waitForSelector(modalSelector, { state: 'visible', timeout: 30000 });
    await thirdIframe.locator(acceptButtonSelector).click();
    console.log("Button clicked successfully!");

  } catch (error) {
    console.error("Error during interaction: ", error);
  } finally {
   // await browser.close();
  }
}

closePopup();
