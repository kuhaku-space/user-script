// ==UserScript==
// @name         ICPCSec Standings Dark Theme Fix
// @namespace    https://github.com/kuhaku-space/user-script
// @version      2.4.0
// @description  ICPCSec (livesite) の「背景を黒くする」ダークモード時に、取りこぼされた文字色・背景帯・境界線を全面的に暗色化。Colorizer の予選通過チーム薄緑帯・メンバー名のレーティング色(黒/暗い茶緑青)も暗背景向けに補正してライトテーマと整合させる
// @author       kuhaku-space
// @match        https://icpcsec.firebaseapp.com/*
// @match        https://icpcsec.web.app/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // livesite (icpcsec) はダークモードを "invertColor" 設定として持ち、
  // 有効時に <style>(id なし)を注入して body/navbar/card など一部の要素だけを
  // 暗くする。だが順位表本体は次の点でライトのまま残り破綻する:
  //   - チーム名/大学名/メンバー名などの文字色(暗背景に暗い文字)
  //   - 正答数(score)セルの背景: 0問なら #eee、それ以外は明るい HSL。
  //   - 行の境界線 (#ddd / #888)
  //   - 問題セル前景 .team-colored-col-fg は color:#000 固定
  //
  // さらに併用スクリプト "ICPC Japan Standings Colorizer" (riantkb) が、
  // 予選通過チームの .team-col.team-name にインライン背景 #e3fae3(薄緑)を
  // 付ける。ライトでは通過チームの印だが、ダークでは明色帯として浮き、
  // その上のチーム名文字が読めなくなる。
  //
  // このスクリプトは、アプリのダークモードが有効なとき(=注入 <style> を検出)
  // だけ、これらを全面的に暗色化してライトと1対1で対応させる。
  //
  // 注意: score セルや Colorizer の背景色はインライン style で付くため、
  // CSS 側から上書きするには !important が必須。

  const STYLE_ID = 'icpcsec-dark-theme-fix';

  const DARK_CSS = `
    /* ---- 文字色: 既定は明色に ---- */
    body,
    .standard-standings,
    .standard-standings .team-row,
    .standard-standings .team-name,
    .standard-standings .team-generic-col-content,
    .standard-standings .university-name,
    .standard-standings .university-rank {
      color: #e0e0e0 !important;
    }
    /* メンバー名(<small>)は一律 !important では塗らない。Colorizer が付ける
       レーティング色付き <span> を活かすため、通常の(非 important)明色のみ
       与え、色なしテキストは継承ではなくこの値で明色化する。
       色付き span はインライン color(詳細度は effectively 高い)が勝つ。 */
    .standard-standings .team-generic-col-content small {
      color: #e0e0e0;
    }
    /* 太字凡例・footer も明色 */
    .standard-standings .team-row.legend,
    .standard-standings .team-row.footer {
      color: #e0e0e0 !important;
    }

    /* ---- Colorizer が付けるメンバー名のレーティング色の黒だけ補正 ----
       Colorizer は <small> 内に <span style="color:#xxxxxx"> でメンバー名を
       レーティング色分けする。important なしのインライン color は、上の
       非 important な small ルールに勝つのでレーティング色はそのまま活きる。
       ただしレート0以下は黒(#000000)で暗背景に埋もれるため、そこだけ
       !important で明るいグレーへ補正する。 */
    .standard-standings .team-generic-col-content small span[style*="color: #000000"],
    .standard-standings .team-generic-col-content small span[style*="color:#000000"],
    .standard-standings .team-generic-col-content small span[style*="color: #000"],
    .standard-standings .team-generic-col-content small span[style*="color:#000"] {
      color: #bdbdbd !important;
    }
    /* レート0以下(黒枠)のレーティングサークルも暗背景で消えるため、
       枠色を明るいグレーへ寄せる(サークルは border-color に色を持つ)。
       Colorizer は border-color: #000000 の形で埋め込む。 */
    .standard-standings .team-generic-col-content span[style*="border-color: #000000"],
    .standard-standings .team-generic-col-content span[style*="border-color:#000000"] {
      border-color: #757575 !important;
    }

    /* ---- レーティング色を暗背景向けに明るく補正 ----
       意味(AtCoder 系レート色)を保つため色相は変えず、明度を上げる。
       暗い地(#303030)だけでなく予選通過チームの暗緑帯(#1f3d1f)の上でも
       読めることを基準にする(緑×暗緑の同系色衝突を避けるため緑は特に明るく)。
       Colorizer の色は大文字を含む(#804000, #00C0C0, #C0C000, #FF8000 等)。 */
    .standard-standings .team-generic-col-content small span[style*="color: #804000"],
    .standard-standings .team-generic-col-content small span[style*="color:#804000"] {
      color: #d99a4e !important; /* 茶(400-799) */
    }
    .standard-standings .team-generic-col-content small span[style*="color: #008000"],
    .standard-standings .team-generic-col-content small span[style*="color:#008000"] {
      color: #5ee65e !important; /* 緑(800-1199): 暗緑帯の上でも見えるよう強めに */
    }
    .standard-standings .team-generic-col-content small span[style*="color: #00C0C0"],
    .standard-standings .team-generic-col-content small span[style*="color:#00C0C0"] {
      color: #4fdede !important; /* 水(1200-1599) */
    }
    .standard-standings .team-generic-col-content small span[style*="color: #0000FF"],
    .standard-standings .team-generic-col-content small span[style*="color:#0000FF"] {
      color: #7c9cff !important; /* 青(1600-1999) */
    }
    .standard-standings .team-generic-col-content small span[style*="color: #C0C000"],
    .standard-standings .team-generic-col-content small span[style*="color:#C0C000"] {
      color: #e0e04a !important; /* 黄(2000-2399) */
    }
    .standard-standings .team-generic-col-content small span[style*="color: #FF8000"],
    .standard-standings .team-generic-col-content small span[style*="color:#FF8000"] {
      color: #ff9d3d !important; /* 橙(2400-2799) */
    }
    /* 灰(1-399) #808080 は暗背景でやや沈むので少し明るく */
    .standard-standings .team-generic-col-content small span[style*="color: #808080"],
    .standard-standings .team-generic-col-content small span[style*="color:#808080"] {
      color: #a0a0a0 !important; /* 灰(1-399) */
    }
    /* 赤 #FF0000 は暗背景で十分明るいため未補正 */

    /* ---- 境界線 ---- */
    .standard-standings .team-row,
    .standings-section:last-child .team-row:last-child {
      border-bottom-color: #555 !important;
    }
    .standard-standings .team-row.legend {
      border-bottom-color: #777 !important;
    }
    .standard-standings .team-row.footer {
      border-top-color: #777 !important;
    }

    /* ---- 正答数(score)セルの明色背景を暗色へ ----
       0問時の #eee など、team-score 内の colored-col-bg を暗い帯に置換。
       (問題セル A/B/C… の bg-solved/pending/rejected は強調なので残す) */
    .standard-standings .team-col.team-score .team-colored-col-bg {
      background-color: #3a3a3a !important;
    }

    /* score セル前景の黒文字固定 (#000) を明色へ。
       暗背景になったので白系で可読化。 */
    .standard-standings .team-col.team-score .team-colored-col-fg {
      color: #e0e0e0 !important;
    }

    /* ---- 問題セルの前景 ----
       色付き背景(bg-solved 緑 / bg-pending 黄 / bg-rejected 赤)の上は
       黒文字のままが可読。未挑戦(bg-unattempted=inherit=暗背景)の上だけ
       黒だと見えないので、問題セル前景は白にしておき、
       色付きセルは元々前景テキストを持たない(記号は別)ため実害なし。 */
    .standard-standings .team-problem .team-colored-col-fg {
      color: #e0e0e0 !important;
    }

    /* ---- Colorizer(riantkb) が付ける予選通過チームの薄緑帯 ----
       .team-name のインライン background #e3fae3 を !important で暗い緑へ。
       通過チームの印という意味は保ちつつ、暗背景に馴染ませる。
       (Colorizer は非通過チームには background を付けない = inherit のまま) */
    .standard-standings .team-col.team-name[style*="background"] {
      background-color: #1f3d1f !important;
    }
    /* 暗緑帯の上の文字を確実に明色化(既定ルールで明色だが優先度を保険で上げる)。
       ただし small 直下のレーティング色付き span はレート色を保つため除外。 */
    .standard-standings .team-col.team-name[style*="background"] .team-generic-col-content,
    .standard-standings .team-col.team-name[style*="background"] .university-name,
    .standard-standings .team-col.team-name[style*="background"] .university-rank {
      color: #e0e0e0 !important;
    }
    /* 暗緑帯(#1f3d1f)の上は背景と同系色になりやすいので、緑・水のレート色を
       地の上より一段明るくして分離を確保する。 */
    .standard-standings .team-col.team-name[style*="background"] small span[style*="color: #008000"],
    .standard-standings .team-col.team-name[style*="background"] small span[style*="color:#008000"] {
      color: #86ff86 !important; /* 緑をさらに明るく(暗緑帯対策) */
    }
    .standard-standings .team-col.team-name[style*="background"] small span[style*="color: #00C0C0"],
    .standard-standings .team-col.team-name[style*="background"] small span[style*="color:#00C0C0"] {
      color: #6fecec !important;
    }

    /* ---- 行の状態別ハイライト ---- */
    /* 新規正答の黄帯: 暗背景でも意味を保ちつつ落ち着いた色へ */
    .standard-standings .team-row.new-solved {
      background-color: #5d4d00 !important;
    }
    /* sticky/pin グループの灰帯 (アプリは #616161 に上書き済みだが保険) */
    .standard-standings .team-row.sticky {
      background-color: #4a4a4a !important;
    }

    /* sticky-heading の fallback 背景 */
    .standings-section.sticky-heading {
      background-color: #303030 !important;
    }

    /* ピン留めアイコン */
    .standard-standings .team-row .team-mark .fa-thumbtack {
      color: #757575 !important;
    }
    .standard-standings .team-row .team-mark .fa-thumbtack.pinned {
      color: #ef5350 !important;
    }

    /* リンク(チーム名リンク等)は色継承 */
    a.no-decoration {
      color: inherit !important;
    }

    /* ---- イベントカード ---- */
    .events .card {
      background-color: rgba(66, 66, 66, 0.9) !important;
      color: #e0e0e0 !important;
    }

    /* ---- Bootstrap 由来で白が残りやすい要素 ---- */
    .dropdown-menu {
      background-color: #424242 !important;
      color: #e0e0e0 !important;
    }
    .dropdown-menu .dropdown-item {
      color: #e0e0e0 !important;
    }
    .dropdown-menu .dropdown-item:hover,
    .dropdown-menu .dropdown-item:focus {
      background-color: #616161 !important;
    }
    .modal-content {
      background-color: #424242 !important;
      color: #e0e0e0 !important;
    }
    .table {
      color: #e0e0e0 !important;
    }
    .table td,
    .table th {
      border-color: #555 !important;
    }
  `;

  function ensureStyle(enabled) {
    const el = document.getElementById(STYLE_ID);
    if (enabled) {
      if (!el) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = DARK_CSS;
        // head がまだ無い(document-start)場合は documentElement へ。
        // 優先度は各ルールの !important で担保するので配置順には依存しない。
        (document.head || document.documentElement).appendChild(style);
      }
    } else if (el) {
      el.remove();
    }
  }

  // アプリのダークモード(invertColor)が有効かを判定する。
  // 有効時に "background-color: #303030" と "color: #fff" を含む <style> が注入される。
  function isAppDarkEnabled() {
    const styles = document.querySelectorAll('style');
    for (const s of styles) {
      if (s.id === STYLE_ID) continue;
      const css = s.textContent || '';
      if (css.includes('background-color: #303030') && css.includes('color: #fff')) {
        return true;
      }
    }
    return false;
  }

  // ダーク状態を評価して style を同期・適用する。
  // 自分の <style> 追加による MutationObserver 再発火を避けるため、
  // guard 中は再入しない。
  let inSync = false;
  function sync() {
    if (inSync) return;
    inSync = true;
    try {
      ensureStyle(isAppDarkEnabled());
    } finally {
      inSync = false;
    }
  }

  function start() {
    sync();

    // アプリ(React)はロード後に非同期でダーク用 <style> を注入し、
    // トグルで差し替える。document 全体の子要素変化を監視して追従する。
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    // 保険: MutationObserver が環境依存で取りこぼす場合に備え、
    // 初期ロード直後の数秒だけ短間隔ポーリングで確実に反映させる。
    let ticks = 0;
    const timer = setInterval(() => {
      sync();
      if (++ticks >= 20) clearInterval(timer); // 約10秒でポーリング停止
    }, 500);
  }

  // Tampermonkey の @run-at document-start では documentElement は存在するが
  // head が未生成のことがある。readyState に関わらず start は安全に呼べる
  // (ensureStyle が head 無しでも documentElement へ挿す)。
  start();
})();
