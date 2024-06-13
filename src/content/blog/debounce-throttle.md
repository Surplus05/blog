---
author: Surplus
pubDatetime: 2023-06-21T11:03:45Z
title: Debounce, Throttle
slug: debounce-throttle
featured: false
draft: false
tags:
  - javascript
description: Debounce, Throttle에 대해 알아보자.
---

# Debounce와 Throttle

scroll, resize, drag 등의 이벤트는 아주 많은 수의 이벤트를 발생시켜 성능을 저하시킬 우려가 있다.
이런 이벤트들을 효과적으로 처리하기 위해서는 적절한 방법이 필요한데, 그 중 두 가지가 디바운스와 쓰로틀이다.

디바운싱은 연이어서 호출되는 이벤트 중에서 마지막 또는 처음 이벤트만 처리하는 방식이고, 쓰로틀은 마지막 이벤트 호출 이후 일정 시간 동안 호출을 막는 방식이야.

디바운싱은 주로 입력 이벤트에서 사용되고, 쓰로틀은 주로 스크롤 이벤트에서 사용된다.

## Debounce

예를 들어, 검색창에 미리보기를 구현한다고 생각해 보자. 사용자가 JavaScript를 검색할 때, J Ja Jav Java .... 이렇게 계속해서 요청을 보내면 서버에 엄청난 부하를 주게 된다.

이런 상황에서 마지막 입력 이벤트만 처리하도록 하고 싶은데, 어떻게 할 수 있을까?

간단하게 setTimeout을 통해 구현할 수 있다.

input 이벤트와 타이머 하나를 생각해 보자.

처음 입력이 들어오면 일정 시간 후에 요청을 보내는 setTimeout을 호출한다.  
만약 일정 시간 이전에 새로운 입력이 들어오면 기존 타이머를 취소하고 새로운 setTimeout을 호출해 시간을 리셋시키자.  
이렇게 하면 마지막 입력으로부터 일정 시간이 지나야 비로소 요청이 보내지게 된다.

### Debounce 예제

```javascript
let debounceTimer;
const inputField = document.getElementById("searchInput");

inputField.addEventListener("input", function () {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log("요청 보냄:", inputField.value);
  }, 300); // 300ms 동안 입력이 없으면 요청을 보낸다.
});
```

## Throttle

쓰로틀은 주어진 간격 내에서 여러 호출을 하나로 줄여 중복 호출을 막아주는 방식이다.

여기서도 setTimeout을 통해 간단하게 구현할 수 있겠다.  
예를 들어 scroll 이벤트와 타이머 하나를 생각해 보자.

처음 이벤트가 발생하면 setTimeout을 호출해 타이머를 설정하자.  
일정 시간이 지나면 타이머를 초기화하고 로직을 실행시킨다.  
다음 스크롤 이벤트가 발생했을 경우에 타이머의 존재 여부로 실행을 결정하자.

일정 시간이 지나지 않아 타이머가 존재하는 경우, 아무런 동작도 하지 않도록 하자.

일정 시간이 지나 타이머가 초기화된 경우 setTimeout을 호출해 타이머를 설정하는 방식인데, 이렇게 하면 이벤트가 너무 자주 발생하는 경우에도 적절한 간격으로만 처리가 돼서 성능을 유지할 수 있다.

### Throttle 예제

```javascript
let throttleTimer;
const scrollableElement = document.getElementById("scrollableDiv");

scrollableElement.addEventListener("scroll", function () {
  if (!throttleTimer) {
    throttleTimer = setTimeout(() => {
      console.log("스크롤 이벤트 처리.");
      throttleTimer = null;
    }, 200); // 200ms 동안 한 번만 실행된다.
  }
});
```
