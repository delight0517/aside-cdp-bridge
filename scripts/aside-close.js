#!/usr/bin/env node
// 지정한 target id 탭을 닫는다 (테스트/작업 뒤 정리용). 다른 탭에는 영향 없음.
// 사용법: node aside-close.js <target-id>
const { connect, findPageByTargetId } = require('../lib/connect');

async function main() {
  const targetId = process.argv[2];
  if (!targetId) {
    console.error('usage: aside-close.js <target-id>');
    process.exit(1);
  }
  const browser = await connect();
  const page = await findPageByTargetId(browser, targetId);
  if (!page) {
    console.error('target not found (이미 닫혔을 수 있음):', targetId);
    process.exit(0);
  }
  await page.close();
  console.log('closed:', targetId);
  await browser.disconnect();
}

main().catch((e) => { console.error('ERROR', e.message || e); process.exit(1); });
