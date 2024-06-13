---
author: Surplus
pubDatetime: 2024-01-13T13:55:48Z
title: Back/forward cache
slug: back-foward-cache
featured: false
draft: false
tags:
  - browser
description: Back/forward cache에 대해 알아보자.
---

# Back/forward cache

기능 일부분을 리액트 기반에서 바닐라 JS로 변환하는 과정에서, 앞/뒤로가기로 접근시 제대로 동작하지 않는 현상을 경험했다.

Chrome에서는 제대로 동작했고, Safari에서는 제대로 동작하지 않았다.

문제의 원인은 Back/forward cache였는데, Back/forward cache가 무엇인지 간단하게 살펴보고 오류가 발생한 원인과 해결방법을 알아 보자.

## Back/forward cache?

브라우저의 뒤로가기 또는 앞으로가기 버튼을 눌렀을 때, 페이지를 다시 로드하지 않고 이전에 방문했던 페이지의 상태를 그대로 유지하여 즉시 표시해주는 기능이다.

브라우저는 그 페이지의 스냅샷(HTML, CSS, JavaScript, DOM 상태, 스크롤 위치 등) 전체를 메모리에 그대로 저장한다.

사용자가 뒤로가기 또는 앞으로가기 버튼을 눌렀을 경우 브라우저는 저장된 스냅샷 전체를 메모리에서 불러와 그대로 표시해 준다.

스냅샷을 불러왔다는 용어는 뒤로가기나 앞으로 가기를 통해 접근한 경우와 동일하다.

## 오류가 발생한 원인

페이지가 WebSocket 연결을 유지하고 있거나 Server-Sent Events를 사용 중인 경우, 이러한 연결은 bfcache에서 유지되지 않을 수 있다고 한다.

또, 페이지가 동적으로 생성된 iframes 또는 객체 태그를 포함하고 있을 때, 이러한 요소의 상태를 정확하게 복원하는 것이 어렵기 때문에 bfcache가 비활성화될 수 있다고 한다.

문제를 마주했을때의 상황은 스크립트 A가 있고, A스크립트에 config를 삽입하는 B 스크립트가 페이지 내부에 직접 삽입되어 있는 상황이었다.

config 삽입이 감지(B 스크립트가 실행)되면 A 스크립트 내부의 로직을 실행시키게 된다.

뒤로가기 또는 앞으로가기를 통해 접근했을 경우 스냅샷 전체를 저장한다고 했다.

스냅샷 전체를 저장했으므로 B 내부 로직이 실행된 상태로 저장될 것이다.

그리고 스냅샷을 불러온 경우 이미 실행되었으니 B 내부 로직을 새로 실행하진 않는다.

해당 로직은 iframe과의 연결을 담당하고 있었는데, 스냅샷이 새로 불러와진 경우 iframe과 연결이 끊어져 새롭게 연결을 해 주어야 했다.

연결을 해 주는 로직이 필요했다.

## 오류 해결

스냅샷이 불러와진 경우 새롭게 연결을 시도하는 코드를 추가해야 한다.

스냅샷이 불러와진 경우를 어떻게 알 수 있을까?

```ts
window.onpageshow = function (event) {
  if (event.persisted) {
    console.log("Cache hit");
  } else {
    console.log("Cache Miss");
  }
};
```

event.persisted를 통해 간단하게 알 수 있다.

해당 코드를 활용해 해결했다.

## 브라우저별 동작이 달라진 이유

Back/forward cache가 매 페이지 이동시마다 발동되는게 아니라고 한다.

Safari의 경우 좀 더 적극적으로 Cache 하려는 성향이고, Chrome은 그 반대라서 그렇다고 한다.
