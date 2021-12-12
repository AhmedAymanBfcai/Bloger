const puppeteer = require('puppeteer')

let browser, page
// Initial setup for our test environment to apply DRY princple and don't write the same lines of code again before every single test.
beforeEach(async () => {
  // We use puppeteer to create browser
  browser = await puppeteer.launch({
    headless: false, // That's means that the We dont's the browser to be opend with GUI.
  })
  page = await browser.newPage() // We use browser to create pages
  await page.goto('localhost:3000')
})

// A function to be executed after each test runs.
afterEach(async () => {
  await browser.close()
})

test('We can lanuch a browser', async () => {
  // When we pass this function, It does not passed as a JavaScript function, Puppeteer internally turns it into a string then sends it over to hte chromium instance.
  const text = await page.$eval('a.brand-logo', (el) => el.innerHTML) //When we work with page or anything coming from puppeteer at all it's always an asynchronous operation.

  expect(text).toEqual('Blogster')
})
