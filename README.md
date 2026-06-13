# シブダイ出撃指数アプリ v0.2

伊豆半島周辺でシブダイを狙うための、場所・時間・安全可否を絞り込む出撃判断アプリです。

## 今できること

- 釣り場一覧: サンプル釣り場をスコア順に表示
- 釣り場詳細: 地形、NG波向き、ランディング難度、推奨釣法を表示
- 時合いタイムライン: 19:00-0:00の時間帯別スコアを表示
- 釣行ログ入力: ブラウザの localStorage にログ保存
- シブダイスコア: 水温、潮、風波、月、地形、過去ログから計算
- 安全判定: 雷、装備不足、危険波高、NGうねり、強風は出撃不可
- 海況自動取得: 今日から7日後までの日付と基準エリアを選んでOpen-Meteo由来の条件を反映

## ファイル

- `index.html`: Vue SPAの画面
- `styles.css`: スマホ対応の夜釣り向けUI
- `script.js`: サンプルDB、ログ保存、スコア計算
- `gas/Code.gs`: GAS Web API雛形。`action=forecast` を含む

## 使い方

`index.html` をブラウザで開きます。

Vue 3 はCDNから読み込みます。GitHub PagesやCloudflare Pagesに置く前提ならそのまま動きます。完全オフラインで使う場合は、Vue本体をローカル配置する必要があります。

## 次の開発

1. Googleスプレッドシートに `spots`, `logs`, `conditions`, `score_results`, `settings` を作る
2. `gas/Code.gs` をApps Scriptへ貼り付ける
3. Webアプリとしてデプロイする
4. `index.html` の `window.SHIBUDAI_GAS_API_URL` にウェブアプリURLを入れる
5. 実釣ログを入れて、釣り場ごとの補正を育てる

## GAS API接続

Apps ScriptでWebアプリをデプロイしたら、発行されたURLを `index.html` 末尾へ入れます。

```html
<script>
  window.SHIBUDAI_GAS_API_URL = "https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec";
</script>
```

URL未設定の場合はローカルサンプルDBで動きます。URL設定後は、起動時に `getSpots` と `getLogs` を読み込み、ログ保存時に `saveLog` を呼びます。

ブラウザで先に確認するURL:

```text
https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec?action=getSpots
https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec?action=scoreAll
https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec?action=timeline&spot_id=spot-001
https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec?action=forecast&date=2026-06-13&area=田牛
```

## v0.2 メモ

- `forecast` はOpen-Meteo Forecast APIとMarine APIをGAS側から呼び出します。
- `soloNight` と `noLifeJacket` は自動取得できないため、画面の手入力値を保持します。
- `routeRisk` は `sea_level_height_msl` を使った簡易判定です。沿岸精度に限界があるため参考値として扱います。
- GASを貼り替えたら `testForecast` を実行し、成功後にWebアプリを新バージョンで再デプロイしてください。
