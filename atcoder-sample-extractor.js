// ==UserScript==
// @name         AtCoder Sample Extractor
// @namespace    http://tampermonkey.net/
// @version      2026-02-25
// @description  AtCoderの問題ページから入出力例を取得してコンソールに表示する
// @author       kuhaku-space
// @match        https://atcoder.jp/contests/*/tasks/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if (window.top !== window.self) return;

    const createButton = () => {
        if (document.getElementById('ac-json-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'ac-json-btn';
        btn.innerHTML = '🔗 JSON形式でコピー';
        btn.style = `
            position: fixed; top: 60px; right: 20px; z-index: 9999;
            padding: 10px 15px; background: #6c757d; color: white;
            border: none; border-radius: 4px; cursor: pointer;
            font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;

        btn.onclick = async () => {
            const samples = [];

            // 重要：日本語版（.lang-jp）の中にある .part だけを取得
            const sections = document.querySelectorAll('.lang-ja .part');

            let currentPair = {};

            sections.forEach(part => {
                const h3 = part.querySelector('h3');
                const pre = part.querySelector('pre');
                if (!h3 || !pre) return;

                const title = h3.innerText.trim();
                const content = pre.innerText.trim();

                if (title.includes("入力例") || title.includes("Sample Input")) {
                    currentPair = { input: content };
                } else if (title.includes("出力例") || title.includes("Sample Output")) {
                    currentPair.output = content;
                    samples.push({ ...currentPair });
                    currentPair = {};
                }
            });

            if (samples.length > 0) {
                const jsonString = JSON.stringify(samples, null, 2);
                await navigator.clipboard.writeText(jsonString);
                btn.innerHTML = '✅ コピー完了';
                setTimeout(() => { btn.innerHTML = '🔗 JSON形式でコピー'; }, 2000);
            }
        };

        document.body.appendChild(btn);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createButton);
    } else {
        createButton();
    }
})();
