---
author: Surplus
pubDatetime: 2024-03-06T21:06:05Z
title: load script 개선하기
slug: load-script-advancement
featured: false
draft: false
tags:
  - browser
description: load script를 개선해 봅시다.
---

# load script 개선하기

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="This is an example of a basic HTML document structure."
    />
    <title>Document</title>
    <link rel="stylesheet" href="styles.css" />
    <script src="script.js"></script>
    <script>
      // inject config
    </script>
  </head>
  <body></body>
</html>
```

현재 구조는 위와 같다.

자세하게 설명을 해 보자면, script 태그가 head 내부에 위치하고 그 하단에 바로 config를 주입하는 스크립트가 삽입되어 있는 형태이다.

위 상황에서 마주할 수 있는 문제점이 뭘까?

HTML을 파싱할 때, head 또는 body에 포함된 `<script>` 태그를 만나면 브라우저의 기본 동작은 스크립트를 다운로드하고 실행하기 위해 파싱을 일시 중지한다.  
그렇기에, 해당 script가 늦게 로딩될수록 페이지 전체가 지연로딩된다.

관련 내용에 대해 간단하게 살펴보고 넘어가자.

### 기본 동작

HTML을 파싱할 때, head 또는 body에 포함된 `<script>` 태그를 만나면 브라우저의 기본 동작은 스크립트를 다운로드하고 실행하기 위해 파싱을 일시 중지한다.

### defer 속성

`<script>` 태그에 defer 속성을 추가하면 스크립트 다운로드는 병렬로 진행되지만, 실행은 HTML 파싱이 완료된 후에 수행된다. 이는 script 태그를 만나더라도 파싱을 멈추지 않고 계속 진행하게 한다.

```html
<script src="script.js" defer></script>
```

### async 속성

`<script>` 태그에 async 속성을 추가하면 스크립트 다운로드는 병렬로 진행되며, 다운로드가 완료되는 즉시 스크립트가 실행된다. 이는 HTML 파싱이 중간에 중단될 수 있음을 의미한다.

```html
<script src="script.js" async></script>
```

그러면 defer 속성을 추가하면 될 것 아닌가?

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="This is an example of a basic HTML document structure."
    />
    <title>Document</title>
    <link rel="stylesheet" href="styles.css" />
    <!-- 편의상 A스크립트라 하자 -->
    <script src="script.js"></script>

    <!-- 편의상 B스크립트라 하자 -->
    <script>
      // inject config
    </script>
  </head>
  <body></body>
</html>
```

B스크립트는 A스크립트의 함수를 사용해 config를 주입하고 있다.

이 시점에서 A스크립트에 defer 나 async 속성을 사용하는경우, B스크립트에서 A스크립트의 함수를 인식하지 못하게 된다.

## 해결하기

기존의 A 스크립트가 리액트 기반이라, 크기도 크고 느린 문제가 존재했다.

이 기능의 일부를 외부로 넘기고, Vanila JS 기반으로 재구축하자.

A스크립트를 최대한 가볍게 만들어 로딩에 지장이 가지 않도록 하는것이 핵심이다.

## load 스크립트와 core 스크립트 분리

```ts
// vite.config.ts 의 일부분
  lib: {
    entry: {
      index: resolve(__dirname, "src/index.ts"),
        core: resolve(__dirname, "src/core.ts"),
        loader: resolve(__dirname, "src/loader.ts"),
      },
  }
// 실제로 위처럼 한 것은 아니지만 저런 형태로 entry 를 지정했다.
```

Vite의 Library Mode 를 활용해 index, core, loader 의 3파트로 분리시켰다.

A스크립트는 loader가 담당하게 된다.

나머지 부분은 비동기적으로 로드하게 되는데, 이때 Custom Event를 활용한다.

비동기 로드가 완료되면 A를 향해 `LoadComplete` 이벤트를 보내고 이를 eventListener를 통해 감지한 후, core의 함수에 B를 통해 주입받은 config를 매개변수로 넣어 실행시키게 된다.

## Summary

리액트 기반의 스크립트 (500kb 이상)에서, 바닐라JS (수 kb)기반 스크립트로 변경했다.

비동기 로딩을 사용할 수 없는 부분이 존재해 해당 부분을 최소화하고, 나머지는 비동기 로딩을 사용해 페이지의 파싱을 막는 현상을 방지할 수 있다.

로딩이 완료되었음을 알리는것은 Custom Event를 활용하였다.
