const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  console.log('Navigating to dashboards page...');
  await page.goto('http://localhost:3000/dashboards');
  await page.waitForTimeout(2000);
  
  console.log('Clicking edit on first dashboard...');
  const editBtn = await page.locator('.card-actions .el-button').first();
  if (await editBtn.isVisible()) {
    await editBtn.click();
    await page.waitForTimeout(3000);
    console.log('Current URL:', page.url());
    await page.screenshot({ path: 'editor_debug.png' });
    
    // Check if canvas exists
    const canvasCount = await page.locator('canvas').count();
    console.log('Canvas count:', canvasCount);
  } else {
    console.log('No dashboards found to edit.');
  }

  await browser.close();
})();
