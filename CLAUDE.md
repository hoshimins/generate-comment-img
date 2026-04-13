# generate-comment-img

YouTube切り抜き用コメント画像生成ツール。Canvas APIでPNG書き出し。

## パッケージマネージャー
- `pnpm`を使用（npm / bun は使わない）
- 初回インストール時は `pnpm approve-builds` が必要になる場合あり
  → `package.json` の `pnpm.onlyBuiltDependencies: ["esbuild"]` で解決済み

## コマンド
- `pnpm dev` - 開発サーバー (http://localhost:5173)
- `pnpm build` - プロダクションビルド → `dist/index.html` 1ファイル
- `pnpm exec tsc --noEmit` - 型チェックのみ
- 作業dirが切れた場合: `pnpm --dir /Users/hoshimi/Program/generate-comment-img <cmd>`

## コードルール
- TypeScript strict mode + `noUncheckedIndexedAccess: true`
- `src/renderer.ts` は pure function（DOM参照禁止）。バッチ書き出しと単体プレビューで共有している
- バッチ書き出しはオフスクリーンcanvasを使う（メインプレビューを汚さない）
- マジックナンバーは定数化（例: `NAME_GAP`）

## デプロイ
- Cloudflare Pages → `tools.hoshimin.com`（同アカウントで Workers も稼働中、干渉しない）
- Build: `pnpm build` / Output: `dist`
- OGP画像は `public/ogp.png` に配置（1200×630px）
- `index.html` の `TODO.example.com` を `tools.hoshimin.com` に書き換えてからデプロイ
