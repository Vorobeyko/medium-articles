import { Request, Page } from 'puppeteer'
import {Page as PlaywrightPage, Browser as PlaywrightBrowser} from 'playwright'
import { parse } from 'querystring'

export const delay = (timeout: number) => new Promise((resolve) => {setTimeout(resolve, timeout)})

const requests: any = []

const handleRequest = (request: Request) => 
  //@ts-ignore
	requests.push({postData: parse(request.postData()), url: request.url()})

const checkPostData = (actual:any, expected: any) => {
  const keys = Object.keys(expected)
  if (keys.length === 0) return false
  for (let key of keys) if (actual[key] !== expected[key]) return false
  return true
}

export const waitForRequest = async (url:string, expectedPostData: any, timeout: number = 5000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Wait for request is timed out.'));
    }, timeout);
    
    for (let request of requests) {
      if (request.url.includes(url) && checkPostData(request.postData, expectedPostData)) {
        resolve(request)
        clearTimeout(timeoutId)
      }
    }
  })
}

export const startListenRequests = async  (page: Page | PlaywrightPage) => page.on('request', handleRequest)

export const stopListenRequests = async  (page: Page | PlaywrightPage) => page.removeListener('request', handleRequest)