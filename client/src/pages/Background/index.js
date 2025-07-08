// src/pages/Background/index.js

chrome.runtime.onInstalled.addListener(() => {
  console.log('AlgoSpeak extension installed');
});

// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   console.log('[Worker] got', msg, 'from', sender);
//   if (msg.type === 'inject-styles') {
//     chrome.scripting.insertCSS({
//       target: { tabId: sender.tab.id },
//       files : ['contentScript.styles.css']
//     }).then(() => {
//       console.log('[Worker] CSS injected OK');
//       sendResponse({ ok: true });
//     }).catch(err => {
//       console.error('[Worker] insertCSS failed', err);
//       sendResponse({ ok: false, err });
//     });

//     // return true keeps the message channel open for the async reply
//     return true;
//   }
// });
