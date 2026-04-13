<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>コメント枠ジェネレーター</title>
  <style>
    :root {
      --bg: #111111;
      --panel: #1b1b1b;
      --panel2: #242424;
      --text: #f5f5f5;
      --muted: #b8b8b8;
      --accent: #db6567;
      --accent2: #f8dce1;
      --line: #333333;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Hiragino Sans", "Yu Gothic", "Meiryo", system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
    }

    .app {
      display: grid;
      grid-template-columns: 360px 1fr;
      min-height: 100vh;
    }

    .sidebar {
      padding: 20px;
      border-right: 1px solid var(--line);
      background: linear-gradient(180deg, #171717, #121212);
      overflow: auto;
    }

    .preview {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: #0d0d0d;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 20px;
      line-height: 1.3;
    }

    p.lead {
      margin: 0 0 18px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }

    .section {
      margin-bottom: 18px;
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: var(--panel);
    }

    .section h2 {
      margin: 0 0 12px;
      font-size: 14px;
      color: var(--accent2);
    }

    .field {
      margin-bottom: 12px;
    }

    .field:last-child { margin-bottom: 0; }

    label {
      display: block;
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 6px;
    }

    input[type="text"],
    input[type="number"],
    textarea,
    select,
    input[type="color"] {
      width: 100%;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid #3a3a3a;
      background: var(--panel2);
      color: var(--text);
      font: inherit;
    }

    textarea {
      min-height: 120px;
      resize: vertical;
      line-height: 1.5;
    }

    .grid2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .grid3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    button {
      border: none;
      border-radius: 12px;
      padding: 11px 14px;
      background: var(--accent);
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    button.secondary {
      background: #343434;
      color: #efefef;
    }

    button:hover { filter: brightness(1.05); }

    .hint {
      margin-top: 8px;
      font-size: 12px;
      color: var(--muted);
      line-height: 1.5;
    }

    .canvasWrap {
      width: min(100%, 1280px);
      aspect-ratio: 16 / 9;
      border: 1px solid #2c2c2c;
      border-radius: 18px;
      background: #000;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
    }

    canvas {
      width: 100%;
      height: 100%;
      display: block;
      background: #000;
    }

    .small {
      font-size: 11px;
      color: var(--muted);
      line-height: 1.5;
    }

    .checkboxRow {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
      color: var(--text);
      font-size: 13px;
    }

    .checkboxRow input { width: auto; }

    @media (max-width: 980px) {
      .app {
        grid-template-columns: 1fr;
      }
      .sidebar {
        border-right: none;
        border-bottom: 1px solid var(--line);
      }
    }
  </style>
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <h1>コメント枠ジェネレーター</h1>
      <p class="lead">テンプレ画像を読み込んで、コメントを入力すると、枠内に収まるよう自動で折り返し・縮小してPNGで保存できます。</p>

      <div class="section">
        <h2>1. テンプレ画像</h2>
        <div class="field">
          <label for="bgUpload">枠画像をアップロード</label>
          <input id="bgUpload" type="file" accept="image/*" />
        </div>
        <div class="hint">コメント枠だけのPNGや、配信画面のスクショでも使えます。</div>
      </div>

      <div class="section">
        <h2>2. コメント本文</h2>
        <div class="field">
          <label for="commentText">コメント</label>
          <textarea id="commentText">じっとしてて！
その位置なら待った方がいいかも</textarea>
        </div>
        <div class="grid2">
          <div class="field">
            <label for="nameText">名前</label>
            <input id="nameText" type="text" value="@viewer_01" />
          </div>
          <div class="field">
            <label for="nameSize">名前サイズ</label>
            <input id="nameSize" type="number" value="28" min="10" max="100" />
          </div>
        </div>
      </div>

      <div class="section">
        <h2>3. コメント枠の位置</h2>
        <div class="grid2">
          <div class="field">
            <label for="boxX">X</label>
            <input id="boxX" type="number" value="160" />
          </div>
          <div class="field">
            <label for="boxY">Y</label>
            <input id="boxY" type="number" value="210" />
          </div>
          <div class="field">
            <label for="boxW">幅</label>
            <input id="boxW" type="number" value="720" />
          </div>
          <div class="field">
            <label for="boxH">高さ</label>
            <input id="boxH" type="number" value="220" />
          </div>
        </div>
        <div class="grid2">
          <div class="field">
            <label for="padding">余白</label>
            <input id="padding" type="number" value="22" />
          </div>
          <div class="field">
            <label for="lineHeight">行間倍率</label>
            <input id="lineHeight" type="number" value="1.25" step="0.05" min="1" max="2" />
          </div>
        </div>
      </div>

      <div class="section">
        <h2>4. 文字スタイル</h2>
        <div class="grid2">
          <div class="field">
            <label for="maxFontSize">最大文字サイズ</label>
            <input id="maxFontSize" type="number" value="54" min="10" max="200" />
          </div>
          <div class="field">
            <label for="minFontSize">最小文字サイズ</label>
            <input id="minFontSize" type="number" value="20" min="8" max="100" />
          </div>
          <div class="field">
            <label for="fontWeight">太さ</label>
            <select id="fontWeight">
              <option value="400">標準</option>
              <option value="700" selected>太字</option>
              <option value="900">極太</option>
            </select>
          </div>
          <div class="field">
            <label for="fontFamily">フォント</label>
            <select id="fontFamily">
              <option value="\"Hiragino Sans\", \"Yu Gothic\", \"Meiryo\", sans-serif">ゴシック</option>
              <option value="\"Hiragino Maru Gothic ProN\", \"Yu Gothic\", \"Meiryo\", sans-serif">丸ゴシック</option>
            </select>
          </div>
          <div class="field">
            <label for="textColor">本文色</label>
            <input id="textColor" type="color" value="#3A2326" />
          </div>
          <div class="field">
            <label for="nameColor">名前色</label>
            <input id="nameColor" type="color" value="#DB6567" />
          </div>
        </div>
        <label class="checkboxRow"><input id="showDebug" type="checkbox" /> 枠のガイドを表示</label>
      </div>

      <div class="section">
        <h2>5. 操作</h2>
        <div class="buttons">
          <button id="renderBtn">再描画</button>
          <button id="downloadBtn">PNGを書き出し</button>
          <button id="presetBtn" class="secondary">DB6567寄せの初期値</button>
        </div>
        <div class="hint">最初は座標をざっくり合わせて、あとで X / Y / 幅 / 高さ を詰めるのが早いです。</div>
      </div>

      <div class="section">
        <h2>補足</h2>
        <div class="small">
          このツールは「AI画像生成」ではなく、「テンプレ画像の上に文字を確定配置する」方式です。<br />
          毎回同じ枠に、同じルールで、崩れずに入れたい用途に向いています。
        </div>
      </div>
    </aside>

    <main class="preview">
      <div class="canvasWrap">
        <canvas id="canvas" width="1280" height="720"></canvas>
      </div>
    </main>
  </div>

  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const els = {
      bgUpload: document.getElementById('bgUpload'),
      commentText: document.getElementById('commentText'),
      nameText: document.getElementById('nameText'),
      nameSize: document.getElementById('nameSize'),
      boxX: document.getElementById('boxX'),
      boxY: document.getElementById('boxY'),
      boxW: document.getElementById('boxW'),
      boxH: document.getElementById('boxH'),
      padding: document.getElementById('padding'),
      lineHeight: document.getElementById('lineHeight'),
      maxFontSize: document.getElementById('maxFontSize'),
      minFontSize: document.getElementById('minFontSize'),
      fontWeight: document.getElementById('fontWeight'),
      fontFamily: document.getElementById('fontFamily'),
      textColor: document.getElementById('textColor'),
      nameColor: document.getElementById('nameColor'),
      showDebug: document.getElementById('showDebug'),
      renderBtn: document.getElementById('renderBtn'),
      downloadBtn: document.getElementById('downloadBtn'),
      presetBtn: document.getElementById('presetBtn'),
    };

    let bgImage = null;

    function getNum(el) {
      return Number(el.value || 0);
    }

    function clearCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawBackground() {
      if (!bgImage) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = bgImage.width;
      const ih = bgImage.height;
      const scale = Math.min(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.drawImage(bgImage, dx, dy, dw, dh);
    }

    function wrapText(text, maxWidth, font) {
      ctx.font = font;
      const paragraphs = text.split('\n');
      const lines = [];

      for (const para of paragraphs) {
        if (para.length === 0) {
          lines.push('');
          continue;
        }
        let current = '';
        for (const char of para) {
          const test = current + char;
          const width = ctx.measureText(test).width;
          if (width > maxWidth && current !== '') {
            lines.push(current);
            current = char;
          } else {
            current = test;
          }
        }
        if (current) lines.push(current);
      }
      return lines;
    }

    function fitText({ text, boxW, boxH, padding, maxSize, minSize, lineHeight, fontWeight, fontFamily, nameSize }) {
      const availableW = boxW - padding * 2;
      const availableH = boxH - padding * 2 - nameSize - 12;

      for (let size = maxSize; size >= minSize; size--) {
        const font = `${fontWeight} ${size}px ${fontFamily}`;
        const lines = wrapText(text, availableW, font);
        const totalH = lines.length * size * lineHeight;
        if (totalH <= availableH) {
          return { size, lines };
        }
      }

      const font = `${fontWeight} ${minSize}px ${fontFamily}`;
      return { size: minSize, lines: wrapText(text, availableW, font) };
    }

    function draw() {
      clearCanvas();
      drawBackground();

      const boxX = getNum(els.boxX);
      const boxY = getNum(els.boxY);
      const boxW = getNum(els.boxW);
      const boxH = getNum(els.boxH);
      const padding = getNum(els.padding);
      const lineHeight = Number(els.lineHeight.value);
      const maxFontSize = getNum(els.maxFontSize);
      const minFontSize = getNum(els.minFontSize);
      const fontWeight = els.fontWeight.value;
      const fontFamily = els.fontFamily.value;
      const textColor = els.textColor.value;
      const nameColor = els.nameColor.value;
      const commentText = els.commentText.value;
      const nameText = els.nameText.value;
      const nameSize = getNum(els.nameSize);

      const fit = fitText({
        text: commentText,
        boxW,
        boxH,
        padding,
        maxSize: maxFontSize,
        minSize: minFontSize,
        lineHeight,
        fontWeight,
        fontFamily,
        nameSize,
      });

      if (els.showDebug.checked) {
        ctx.save();
        ctx.strokeStyle = '#DB6567';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.restore();
      }

      // 名前
      ctx.save();
      ctx.font = `700 ${nameSize}px ${fontFamily}`;
      ctx.fillStyle = nameColor;
      ctx.textBaseline = 'top';
      ctx.fillText(nameText, boxX + padding, boxY + padding);
      ctx.restore();

      // 本文
      const startY = boxY + padding + nameSize + 12;
      ctx.save();
      ctx.font = `${fontWeight} ${fit.size}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'top';

      fit.lines.forEach((line, i) => {
        const y = startY + i * fit.size * lineHeight;
        ctx.fillText(line, boxX + padding, y);
      });
      ctx.restore();
    }

    function readImage(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    els.bgUpload.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      bgImage = await readImage(file);
      draw();
    });

    els.renderBtn.addEventListener('click', draw);

    els.downloadBtn.addEventListener('click', () => {
      draw();
      const link = document.createElement('a');
      link.download = 'comment_frame.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });

    els.presetBtn.addEventListener('click', () => {
      els.textColor.value = '#3A2326';
      els.nameColor.value = '#DB6567';
      els.fontWeight.value = '700';
      els.fontFamily.value = '"Hiragino Maru Gothic ProN", "Yu Gothic", "Meiryo", sans-serif';
      els.maxFontSize.value = 54;
      els.minFontSize.value = 20;
      els.padding.value = 22;
      els.lineHeight.value = 1.25;
      draw();
    });

    [
      els.commentText, els.nameText, els.nameSize,
      els.boxX, els.boxY, els.boxW, els.boxH,
      els.padding, els.lineHeight,
      els.maxFontSize, els.minFontSize,
      els.fontWeight, els.fontFamily,
      els.textColor, els.nameColor,
      els.showDebug,
    ].forEach(el => {
      el.addEventListener('input', draw);
      el.addEventListener('change', draw);
    });

    draw();
  </script>
</body>
</html>

