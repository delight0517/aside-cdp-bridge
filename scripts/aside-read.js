#!/usr/bin/env node
// 지정한 target id 탭의 텍스트/DOM을 읽는다. 다른 탭에는 접근하지 않는다.
// 사용법: node aside-read.js <target-id> [selector]
//   selector 생략 시 document.body.innerText 전체를 출력
const { connect, findPageByTargetId } = require('../lib/connect');

async function main() {
  const targetId = process.argv[2];
  const selector = process.argv[3];
  if (!targetId) {
    console.error('usage: aside-read.js <target-id> [selector]');
    process.exit(1);
  }
  const browser = await connect();
  const page = await findPageByTargetId(browser, targetId);
  if (!page) {
    console.error('target not found:', targetId);
    process.exit(1);
  }
  const result = await page.evaluate((sel) => {
    if (sel) {
      const el = document.querySelector(sel);
      if (!el) return null;
      return el.value !== undefined ? el.value : el.innerText;
    }
    return document.body.innerText;
  }, selector || null);
  console.log(result === null ? '(요소를 찾지 못함)' : result);
  await browser.disconnect();
}

main().catch((e) => {
  console.error('ERROR', e.message || e);
  process.exit(1);
});
