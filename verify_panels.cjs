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
        await page.waitForTimeout(2000);

        // Log dimensions
        const dimensions = await page.evaluate(() => {
            const getRect = (id) => {
                const el = document.getElementById(id);
                if (!el) return null;
                const rect = el.getBoundingClientRect();
                const styles = window.getComputedStyle(el);
                return {
                    id,
                    width: rect.width,
                    height: rect.height,
                    flexGrow: styles.flexGrow,
                    flexShrink: styles.flexShrink,
                    flexBasis: styles.flexBasis,
                    display: styles.display
                };
            };
            return [getRect('left'), getRect('center'), getRect('right')];
        });
        console.log('Panel Dimensions:', JSON.stringify(dimensions, null, 2));

        const left = dimensions.find(d => d.id === 'left');
        const right = dimensions.find(d => d.id === 'right');

        // Expected: Left ~320px (25%), Right ~256px (20%)
        console.log(`Left Width: ${left.width}px (Expected ~320px)`);
        console.log(`Right Width: ${right.width}px (Expected ~256px)`);

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
