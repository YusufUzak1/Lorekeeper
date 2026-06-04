import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', error => {
    console.log(`[Browser PageError]: ${error.stack || error.message}`);
  });

  page.on('requestfailed', request => {
    console.log(`[Browser Request Failed]: ${request.url()} - ${request.failure().errorText}`);
  });

  console.log('Navigating to http://localhost:5173/');
  
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 5000 });
  } catch (e) {
    console.log('Timeout or error during navigation (normal if reloading loop):', e.message);
  }
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
