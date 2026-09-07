#!/usr/bin/env node
// 새 격리 탭을 열고 지정한 URL로 이동한다. 기존에 열려 있는 사용자의 탭은 절대 건드리지 않는다.
// 사용법: node aside-nav.js <url>
// 출력: target id (다른 스크립트에서 이 id로 같은 탭을 다시 찾아 조작한다)
const { connect, targetIdOf } = require('../lib/connect');

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('usage: aside-nav.js <url>');
    process.exit(1);
  }
  const browser = await connect();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const id = targetIdOf(page);
  console.log(id);
  await browser.disconnect();
}

main().catch((e) => {
  console.error('ERROR', e.message || e);
  process.exit(1);
});
