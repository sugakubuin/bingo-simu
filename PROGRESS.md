# ビンゴ捲り期待値シミュレーター 進捗記録

最終更新: 2026-08-13

準拠: [references/bingo_simulator_spec.md](references/bingo_simulator_spec.md)

起動: `npm install` のあと `npm run dev`。テストは `npm test`。本番ビルドは `npm run build`。

---

## フェーズ

- [x] 1. 足場（Vite / React / TS / Tailwind / Vitest / tokens / 本ファイル）
- [x] 2. ドメイン（牌・循環・パース・のりテーブル・初期状態・山生成）と単体テスト
- [x] 3. エンジン（1 試行・統計・決定的ケーステスト）
- [x] 4. 入力 UI（モード / 和了種別 / 牌姿 / 槓子 / パラメータ / バリデーション）
- [x] 5. Web Worker + 結果 UI（サマリー / ヒストグラム / 累積表 / のりテーブル）
- [x] 6. デザイン仕上げ（Cobalt / モバイル / Hallmark stamp）

---

## ログ

### フェーズ 1

Vite + React 19 + TypeScript + Tailwind v4 + Vitest を設置。`tokens.css` に Cobalt トークン。

### フェーズ 2–3

牌 ID・循環・パース・のりテーブル・初期状態・部分 Fisher–Yates・1 試行アルゴリズムを実装。単体テスト 36 件すべて成功。

決定的ケース: 0 枚即終了、非確変は下段を捲らない、突確は次トンから確変、確変中突確は 16R、スーパー花牌は非突確、16R 終了時 2 倍、転落保証の連続消費、7m は大きい方。

### フェーズ 4–5

牌クリックとテキストの双方向同期、槓子別枠、Web Worker で 10 万回、Recharts ヒストグラムと累積表、のりテーブル折りたたみ。

### フェーズ 6

Workbench + Cobalt。ナビ N9、フッタ Ft2。モバイルは sticky 実行ボタン。`overflow-x: clip`。Hallmark stamp は `tokens.css`。

### 牌UI

手牌は1行（nowrap）。選択肢は筒子・索子・字牌をそれぞれ1行の9列グリッドにし、字牌も同じマス幅。牌画は FluffyStuff / xhokir の SVG（`public/tiles`）。

- ホームラン・一発/裏/赤/本役満・河情報・和了形検証は仕様どおり対象外。
- 永続化なし。
- 初期サンプルは `777888p777888s東東`（16R）で、空の牌姿から始めたい場合は手牌を消す。
