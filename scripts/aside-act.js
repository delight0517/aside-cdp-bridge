#!/usr/bin/env node
// 지정한 target id 탭의 특정 요소를 클릭하거나 텍스트를 입력한다. 다른 탭에는 접근하지 않는다.
// 사용법:
//   node aside-act.js <target-id> <selector> click
//   node aside-act.js <target-id> <selector> type "입력할 텍스트(한글 가능)"
const { connect, findPageByTargetId } = require('../lib/connect');

async function main() {
  const [targetId, selector, action, text] = process.argv.slice(2);
  if (!targetId || !selector || !action) {
    console.error('usage: aside-act.js <target-id> <selector> <click|type> [text]');
    process.exit(1);
  }
  const browser = await connect();
  const page = await findPageByTargetId(browser, targetId);
  if (!page) {
    console.error('target not found:', targetId);
    process.exit(1);
  }
  await page.waitForSelector(selector, { timeout: 10000 });

  if (action === 'click') {
    await page.click(selector);
    console.log('clicked:', selector);
  } else if (action === 'type') {
    if (text === undefined) {
      console.error('type 액션에는 텍스트가 필요합니다');
      process.exit(1);
    }
    await page.click(selector);
    // IME 깨짐 없이 한글을 넣기 위해 execCommand('insertText') 사용 (page.type()의 keydown 시뮬레이션 대신)
    await page.evaluate((sel, t) => {
      const el = document.querySelector(sel);
      el.focus();
      document.execCommand('insertText', false, t);
    }, selector, text);
    console.log('typed into:', selector);
  } else {
    console.error('알 수 없는 action:', action, '(click|type만 지원)');
    process.exit(1);
  }
  await browser.disconnect();
}

main().catch((e) => {
  console.error('ERROR', e.message || e);
  process.exit(1);
});
