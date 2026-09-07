const puppeteer = require('puppeteer-core');

const CDP_URL = process.env.ASIDE_CDP_URL || 'http://127.0.0.1:9222';

async function connect() {
  return puppeteer.connect({ browserURL: CDP_URL });
}

function targetIdOf(page) {
  const t = page.target();
  return t._targetId || (t._targetInfo && t._targetInfo.targetId) || null;
}

async function findPageByTargetId(browser, targetId) {
  const pages = await browser.pages();
  for (const p of pages) {
    if (targetIdOf(p) === targetId) return p;
  }
  return null;
}

module.exports = { connect, targetIdOf, findPageByTargetId, CDP_URL };
