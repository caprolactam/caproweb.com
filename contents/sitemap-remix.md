---
title: Remixにおけるサイトマップ送信
createdAt: 2024-09-27
description: Remixでサイトマップを静的アセットとして作成・送信する方法について
keywords:
  - remix
  - web
---
Remixにおいてサイトマップの送信を検討する場合、[リソースルート](https://remix.run/docs/en/main/guides/resource-routes)を用いることが考えらえれる。[^sitemap-from-resource-route]一方で、送信されるリソースがリクエストに応じて動的に変更される[^dynamic-resource]のでなければ、静的アセットとして提供することがより単純[^comparison-of-the-two-methods]な方法となる。

この記事では、[hi-ogawa氏のアイデア](https://github.com/remix-run/remix/issues/8122#issuecomment-1826217256)をもとにRemix + Vite + [@nasa-gcn/remix-seo](https://github.com/nasa-gcn/remix-seo)でサイトマップを作成し、静的に送信する方法を紹介する。また[ソースコードはこちら。](https://github.com/caprolactam/remix-cloudflare-sitemap)

環境は以下の通りである。

| パッケージ          | バージョン |
| ------------------- | ---------- |
| React               | 18.3.1     |
| Remix               | 2.12.0     |
| @nasa-gcn/remix-seo | 2.0.1      |

## サイトマップ作成のための準備 ||preparation-for-sitemap||

サイトマップから特定のルートを除外したい場合、またはデータベース等を用いてルートを動的に追加したい場合を除いて、特に事前の設定を行う必要はない。[^config-of-remix-seo]

ただし、ドキュメントに記述されているもの以外に、以下のコード修正を行った。

Remixでは、存在しないルートへのアクセス処理を[Splat Route](https://remix.run/docs/en/main/file-conventions/routes#splat-routes)を用いて行う。しかし、たとえば`app/routes/$.tsx`を作成し何も設定しない場合、サイトマップとして以下の`<url>`が生成される。[^splat-route-path]

```xml
<url>
  <loc>https://www.example.com/*</loc>
  <priority>0.7</priority>
</url>
```

sitemap.xmlにおいて`*`をワイルドカードとして解釈するような記述は、[google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=ja)と[サイトマップ プロトコル](https://sitemaps.org/protocol.html)を見た限り存在しない。

そこでサイトマップでSplat Routeがルートとして生成されないように修正を行う必要がある。

```tsx filename=app/routes/$.tsx
import { SEOHandle } from '@nasa-gcn/remix-seo'

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}
```

## サイトマップの作成 ||making-a-sitemap||

サイトマップを作成するスクリプトを用意する。たとえば、プロジェクト直下に`build-sitemap.js`を作成し、以下のように記述する。

```js filename=build-sitemap.js
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getSitemapXml } from '@nasa-gcn/remix-seo/build/sitemap/utils.js'
// eslint-disable-next-line import/no-unresolved
import * as build from './build/server/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const filePathForProd = path.join(
  __dirname,
  '.',
  'build',
  'client',
  'sitemap.xml',
)
const filePathForDev = path.join(__dirname, '.', 'public', 'sitemap.xml')

const sitemap = await getSitemapXml(
  new Request('https://dummy.local'),
  build.routes,
  {
    siteUrl: 'https://www.example.com',
  },
)

await Promise.all(
  [filePathForProd, filePathForDev].map((path) => {
    return writeFile(path, sitemap, 'utf8')
  }),
).catch((e) => console.error(e))
```

`@nasa-gcn/remix-seo`から`generateSitemap`ではなく`getSitemapXml`をインポートしている。後者でサイトマップを作成し、それを用いて前者でリスポンスを作成する。当該ライブラリでは`generateSitemap`を用いることを想定している。したがって`2.0.1`以降のバージョンでは、このコードは動作しない可能性がある。

サイトマップの書き込み先として、`public`と`build/client`を指定している。これは、vite環境では`public`配下のファイルが読み込まれ、ビルド環境では`build/client`配下のファイルが読み込まれるからである。サイトマップはビルドに応じて作成されればよいため、`.gitignore`に含めておく。

```txt filename=.gitignore add=1-2
/build
/public/sitemap.xml
```

次に、`package.json`でビルドファイル作成後に、そのビルドファイルを用いてサイトマップを作成できるように`postbuild`スクリプトを追加する。[^post-script]

```json filename=package.json add=4
{
  "scripts": {
    "build": "remix vite:build",
    "postbuild": "node ./build-sitemap.js"
  }
}
```

### サーバーレス環境での追加設定 ||for-serverless-environment||

これまでのコードで、Node.js環境ではスクリプトが動作するはずである（より正確にはサーバー上でのHTMLレンダーにNode.js ストリームが利用可能な場合[^react-dom-server-api]）。

ところで、RemixをCloudflare環境で用いる場合、Web Streams向けの[`renderToReadableStream`](https://react.dev/reference/react-dom/server/renderToReadableStream)を用いる必要がある。これは、V8上で直接コードを実行する他のサーバーレス環境についても同様であろう。

そうするとサイトマップの作成を行う際、`renderToReadableStream`を含むビルドファイルをNode.js環境で読み込む必要がある。

しかし、Reactのバージョン`18.3.0`において`postbuild`スクリプトを実行し、Node.js環境でビルドファイルを読み込むと以下のようなエラーが出る。

```bash
file:///C:/~/remix-cloudflare-sitemap/build/server/index.js:4
import { renderToReadableStream } from 'react-dom/server'
         ^^^^^^^^^^^^^^^^^^^^^^
SyntaxError: Named export 'renderToReadableStream' not found. The requested module 'react-dom/server' is a CommonJS module, which may not support all module.exports as named exports.
CommonJS modules can always be imported via the default export, for example using:

import pkg from 'react-dom/server';
const { renderToReadableStream } = pkg;

    at ModuleJob._instantiate (node:internal/modules/esm/module_job:146:21)
    at async ModuleJob.run (node:internal/modules/esm/module_job:229:5)
    at async ModuleLoader.import (node:internal/modules/esm/loader:473:24)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:123:5)

Node.js v20.17.0
```

この問題とその回避策については[remew氏の記事](https://zenn.dev/remew/articles/import-render-to-readable-stream-from-node)に詳しい。要約すると、`react-dom/server`からのimportは、実行環境に応じてファイルの読み込み先を切り替えている。特にNode.js環境を用いる場合、その読み込み先に指定されているファイルからは`renderToReadableStream`がexportされていないため上記エラーが生じるようである。

そこで回避策としては、`renderToReadableStream`がexportされているファイルを直接読み込むこと、またそのための型定義が行われていないため補ってあげることが必要である。

```tsx filename=app/entry.server.tsx remove=1 add=2
import { renderToReadableStream } from 'react-dom/server'
import { renderToReadableStream } from 'react-dom/server.browser'
```

```ts filename=types/deps.d.ts
declare module 'react-dom/server.browser' {
  export * from 'react-dom/server'
}
```

## サイトマップの送信 ||submit-a-sitemap||

静的アセットの送信は、各種サーバーフレームワークやサービスで提供されている（と思われる）のでRemixを用いる必要がない。以下、Expressを用いる場合とCloudflare Pagesを用いる場合を紹介する。

### Expressを用いる場合 ||using-express||

[`express.static()`](http://expressjs.com/en/starter/static-files.html#serving-static-files-in-express)によって、静的ファイルに対する設定を行うことが可能である。

```ts
import express from 'express'

const app = express()

app.use(express.static('build/client/sitemap.xml', { maxAge: 300 }))
```

### Cloudflare Pagesを用いる場合 ||using-cloudflare-pages||

プロジェクトで指定されているビルド出力（Remixでは通常`build/client`）に、該当するファイルが存在する場合、そのファイルがレスポンスで送信される。したがって通常の場合、特別な設定を行う必要はない。

リスポンスヘッダーを設定したい場合は、[`_headers`](https://developers.cloudflare.com/pages/configuration/headers/)ファイル（拡張子は必要ない）を用いる。Viteを用いる場合、`public`フォルダ内に存在するファイルは`build/client`にビルドされる。[^vite-public-dir]そしてそのファイルがCloudflareに読み込まれるので、`public`フォルダに`_headers`を作成すればよい。

以下は記述の例である。

```txt filename=public/_headers add=5-7
/favicon.ico
  Cache-Control: public, max-age=3600, s-maxage=3600
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/sitemap.xml
  Content-Type: application/xml
  Cache-Control: public, max-age=300
```

また、Cloudflare Pagesにおいて静的アセットのリクエストは無制限[^cloudflare-pages-static-asset]なので、Functionsが無駄に実行されないように[`_routes.json`](https://developers.cloudflare.com/pages/functions/routing/)で設定を行うと良い。`_headers`同様、publicフォルダで設定を行う。

```json filename=public/_routes.json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/favicon.ico", "/sitemap.xml", "/assets/*"]
}
```

## 静的アセットとリソースルートの比較 ||comparison||

静的アセットとして送信することとリソースルートを用いて動的に作成・送信することは、どちらが妥当だろうか。

静的アセットの方法を用いることのメリットは以下の通りである。

- まず、Remixでリソースルートを設定する必要がなくなり、かつ静的アセット全体に対する管理を一括して行える。これは学習コストの低下や`routes`フォルダ内が複雑になる要因を減らせることを意味する。ただしExpressやCloudflareの学習を行う必要がある。
- リクエストごとにサイトマップを作成する処理が必要がなくなる。ただし、それほど重い処理とは言えず、また共有キャッシュに保存することでより柔軟にサイトマップの作成を行えるともいえる。
- 上記のようにCloudflare Pagesでは静的アセットのリクエストは無制限である。

一方で以下のデメリットも考慮する必要がある。

- ビルドサイズが増える。
- 開発時、ビルドしないとサイトマップが作成されない。つまりルートを追加しても、それに応じてサイトマップは更新されないため、ウォッチモードで監視を行う等してサイトマップの更新を自動化する必要がある。リソースルートを用いる場合、リクエストに応じてサイトマップが作成されるためこの問題は生じない。

以上のメリット・デメリットのほかに、ビルド時にルートが確定可能か否かが判断基準となるだろう。

[^sitemap-from-resource-route]: リソースルートを用いた方法については、[The Epic Stack](https://github.com/epicweb-dev/epic-stack)を見よ。具体的には、以下の通りである。[サーバーを起動するファイル(`server/index.ts)`](https://github.com/epicweb-dev/epic-stack/blob/ec0c3c49a4111bc55466e68675aa7dfb46ebb9c5/server/index.ts)においてbuildファイルをRemixアダプターの[`getLoadContext()`](https://remix.run/docs/en/main/route/loader#context)に渡す。次に
[リソースルート(`app/routes/_seo+/sitemap[.]xml.ts`)](https://github.com/epicweb-dev/epic-stack/blob/ec0c3c49a4111bc55466e68675aa7dfb46ebb9c5/app/routes/_seo%2B/sitemap%5B.%5Dxml.ts)の`loader`で引数`context`から当該buildファイルを受け取り、`generateSitemap()`に渡すことでサイトマップを含むリスポンスを作成・送信する。
[^dynamic-resource]: たとえば、ユーザーのリクエストに応じて動的に変更される場合、あるいはリアルタイムでリソースに変更が加わる場合である。
[^comparison-of-the-two-methods]: 具体的には、本記事の[静的アセットとリソースルートの比較](#comparison)を見よ。
[^config-of-remix-seo]: 本文中で言及した点について設定を行う場合は、[`nasa-gcn/remix-seo`](https://github.com/nasa-gcn/remix-seo?tab=readme-ov-file#configuration)を見よ。またサーバーサイドでのみ実行するコードを`handle`関数に実行したい場合は、[Can't use server-side code to get sitemap entries · Issue #17 · nasa-gcn/remix-seo](https://github.com/nasa-gcn/remix-seo/issues/17)を参照せよ。
[^splat-route-path]: これはRemixにおいてSplat Routeのpathが`*`として解釈されるからである。このことは、`npx remix routes`において確認可能である。
[^post-script]: "post" スクリプトの動作については、[scripts | npm Docs](https://docs.npmjs.com/cli/v10/using-npm/scripts#pre--post-scripts)を参照せよ。
[^react-dom-server-api]: [Server React DOM APIs - React](https://react.dev/reference/react-dom/server)を見よ。
[^vite-public-dir]: Viteにおけるpublicディレクトリの扱いについては、[Static Asset Handling | Vite](https://vitejs.dev/guide/assets.html#the-public-directory)を見よ。
[^cloudflare-pages-static-asset]: [Pricing | Cloudflare Pages docs](https://developers.cloudflare.com/pages/functions/pricing/#static-asset-requests)を見よ。また、Cloudflare Workersについても同様である。[Static Assets | Cloudflare Workers docs](https://developers.cloudflare.com/workers/static-assets/#pricing)
