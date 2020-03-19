import puppeteer, { Page, Request, Browser } from 'puppeteer'
import playwright, {Page as PlaywrightPage, Browser as PlaywrightBrowser} from 'playwright'
import { startListenRequests, delay, waitForRequest, stopListenRequests } from './utils'

jest.setTimeout(2000000000)

describe('Puppeteer Interception', () => {
  let page: Page
  let browser: Browser

  it.only('Запрос должен содержать значения из заполненых полей первого шага', async () => {
    browser = await puppeteer.launch({headless: false, devtools: true})
    page = await browser.newPage()
    await startListenRequests(page)

    await page.goto('https://www.tinkoff.ru/cards/credit-cards/tinkoff-platinum/')
    await page.type('input[name="fio"]', 'Воробей Александр Владимирович');
    await page.type('input[name="phone_mobile"]', '9663277890');
    await delay(100)

    // Данное решение все равно оказывается не стабильным
    // const [request] = await Promise.all([
    //   page.click('button[name="goForward"]'),
    //   //@ts-ignore
    //   page.waitForRequest((r: Request) => {
    //     console.log(r.url())
    //     return r.url().includes('https://api.tinkoff.ru/v1')
    //   }, {timeout: 5000}),
    // ]);

    await page.click('button[name="goForward"]')
    await waitForRequest('https://api.tinkoff.ru/v1', {surname: 'Воробей'})
  })

  it('Запрос должен содержать значения из заполненых полей первого шага', async () => {
    const browser = await puppeteer.launch({headless: false, devtools: true})
    page = await browser.newPage()
    await page.goto('https://www.tinkoff.ru/cards/credit-cards/tinkoff-platinum/')
    await page.type('input[name="fio"]', 'Воробей Александр Владимирович');
    await page.type('input[name="phone_mobile"]', '9663277890');
    await delay(500)
    
    let request = await Promise.all([
      page.waitForRequest(request => {
        //@ts-ignore
        return request.url().includes('https://api.tinkoff.ru/v1') && request.postData().surname !== undefined
      }, {timeout: 5000}),
      page.click('button[name="goForward"]')
    ])
    
    //@ts-ignore
    console.log(request)
  })

  afterAll(async () => {
    // await stopListenRequests(page)
    await browser.close()
  })
})


describe('Playwright Interception', () => {
  let page: PlaywrightPage
  let browser: PlaywrightBrowser

  it('Запрос должен содержать значения из заполненых полей первого шага', async () => {
    browser = await playwright.firefox.launch({headless: false, devtools: true, executablePath: '/usr/bin/firefox'})
    page = await browser.newPage()
    await startListenRequests(page)

    await page.goto('https://www.tinkoff.ru/cards/credit-cards/tinkoff-platinum/')
    await page.type('input[name="fio"]', 'Воробей Александр Владимирович');
    await page.type('input[name="phone_mobile"]', '9663277890');
    await delay(100)
    await page.click('button[name="goForward"]')
    await delay(1000)
    await waitForRequest('https://api.tinkoff.ru/v1', {surname: 'Воробей'})
  })

  afterEach(async () => {
    await stopListenRequests(page)
    await browser.close()
  })
})