# シブダイ出撃指数アプリ MVP

伊豆半島周辺でシブダイを狙うための、場所・時間・安全可否を絞り込む出撃判断アプリです。

## 今できること

- 釣り場一覧: サンプル釣り場をスコア順に表示
- 釣り場詳細: 地形、NG波向き、ランディング難度、推奨釣法を表示
- 時合いタイムライン: 19:00-0:00の時間帯別スコアを表示
- 釣行ログ入力: ブラウザの localStorage にログ保存
- シブダイスコア: 水温、潮、風波、月、地形、過去ログから計算
- 安全判定: 雷、装備不足、危険波高、NGうねり、強風は出撃不可

## ファイル

- `index.html`: Vue SPAの画面
- `styles.css`: スマホ対応の夜釣り向けUI
- `script.js`: サンプルDB、ログ保存、スコア計算
- `docs/spreadsheet-design.md`: Googleスプレッドシート設計
- `docs/api-design.md`: GAS API設計
- `gas/Code.gs`: GAS Web API雛形

## 使い方

`index.html` をブラウザで開きます。

Vue 3 はCDNから読み込みます。GitHub PagesやCloudflare Pagesに置く前提ならそのまま動きます。完全オフラインで使う場合は、Vue本体をローカル配置する必要があります。

## 次の開発

1. Googleスプレッドシートに `spots`, `logs`, `conditions`, `score_results`, `settings` を作る
2. `gas/Code.gs` をApps Scriptへ貼り付ける
3. Webアプリとしてデプロイする
4. `script.js` の `GAS_API_URL` にウェブアプリURLを入れる
5. 実釣ログを入れて、釣り場ごとの補正を育てる

## GAS API接続

Apps ScriptでWebアプリをデプロイしたら、発行されたURLを `script.js` 冒頭へ入れます。

```javascript
const GAS_API_URL = "https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec";
```

URL未設定の場合はローカルサンプルDBで動きます。URL設定後は、起動時に `getSpots` と `getLogs` を読み込み、ログ保存時に `saveLog` を呼びます。

ブラウザで先に確認するURL:

```text
https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec?action=getSpots
https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec?action=scoreAll
https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec?action=timeline&spot_id=spot-001
```
