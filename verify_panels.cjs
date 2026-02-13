const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        console.log('Navigating to http://localhost:5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

        // Wait for key elements to ensure render
        await page.waitForTimeout(1000);

        console.log('Taking screenshot...');
        const screenshotPath = path.resolve(process.cwd(), 'debug_panels.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot saved to ${screenshotPath}`);
    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        await browser.close();
    }
})();
