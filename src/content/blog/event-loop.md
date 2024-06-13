---
author: Surplus
pubDatetime: 2023-06-17T18:11:35Z
title: Event Loop
slug: event-loop
featured: false
draft: false
tags:
  - browser
description: Event Loop에 대해 알아보자.
---

# Event Loop

JavaScript가 싱글스레드 언어임에도 불구하고 비동기 처리가 가능한 이유에 대해 알아보자.

## Process와 Thread

들어가기 전에, Process와 Thread에 대해 알아보자.

### Process란?

OS의 메모리에 탑재되어 실행 중인 프로그램이다. Process의 메모리 영역은 Code, Stack, Heap, Data로 구분된다.

- **Stack**: 함수의 Call Stack
- **Heap**: 동적 할당
- **Data**: Static, 전역변수 등

### Thread란?

Process 내부의 실행 흐름이다. 한 Process 내에서 Thread들은 각자 Call Stack을 갖고 나머지 자원들은 공유하게 된다. 다만, 이로 인해 Race Condition에 유의해야 한다.

JavaScript는 Single Threaded 언어에 해당한다. 그렇다면 JavaScript Engine은 어떻게 비동기 처리를 지원하는 것인지 알아보자.

## Event Loop

JavaScript Engine은 Memory Heap과 Call Stack을 가지고 있다. 하지만, JavaScript의 비동기 처리는 브라우저 환경과 밀접한 관련이 있다.

### Web APIs

Web APIs는 DOM API, `setTimeout`, `fetch`, `eventListener` 등을 포함한다. 이러한 API들은 브라우저가 제공하며, JavaScript가 직접적으로 제어하는 것이 아니라 브라우저가 비동기 작업을 처리하는 데 사용된다.

- **`setTimeout`**: 타이머를 작동시키고, 타이머가 끝나면 등록된 콜백을 Task Queue에 추가한다.
- **`eventListener`**: 해당 이벤트가 발생하면 등록된 콜백을 Task Queue에 추가한다.

### 브라우저의 역할

JS는 Single Thread 언어이지만, 브라우저는 Multi Threading을 지원하며, Web API는 브라우저 환경에서 실행된다. 브라우저가 Web API를 통해 비동기 작업을 처리하고, 그 결과를 Task Queue에 추가해 JavaScript가 이를 처리할 수 있게 한다는 점을 유의하자.

### Task Queue와 Event Loop

Task Queue에 등록된 콜백은 Event Loop가 처리해 준다. Event Loop의 동작을 추상화하면 다음과 같다

```javascript
while (true) {
  while (callstack.isNotEmpty) {
    let run = callstack.pop();
    run();
  }

  callstack.push(taskqueue.pop());
}
```

1. **Call Stack이 빌 때까지** 실행을 보장한다.
2. **Call Stack이 비었다면** Task Queue의 요소 하나를 Call Stack으로 가져와 실행한다.

이 과정을 계속 반복(Loop)하면서 비동기 작업을 처리한다.

## Task Queue와 Micro Task Queue

### Task Queue

Web API에서 등록해주는 콜백이 Task Queue에 해당한다.

### Micro Task Queue

Promise에 등록해주는 콜백 등이 Micro Task Queue에 해당한다.

```javascript
let promise = Promise.resolve();

promise.then(() => alert("프라미스 성공!"));

alert("코드 종료");
```

코드를 실행해 보면 코드 종료 이후 프라미스 성공 내용이 출력되게 된다.

이 예제의 동작을 살펴보자

1. 첫 번째 줄에서 Promise가 이행된다.
2. 두 번째 줄에서 콜백을 전달하고, 이행되었으므로 바로 Micro Task Queue에 push된다.
3. 세 번째 줄에서 "코드 종료" 출력.

Call Stack이 비었으니 Micro Task Queue에 등록된 콜백이 Call Stack으로 가져와져 실행된다. 핵심 사항은, Call Stack이 빌 때까지 실행을 보장한다는 것이다.

Micro Task Queue에 Push는 두 번째 줄에서 이루어지지만, 세 번째 줄이 끝나고서 실행되는 이유는 Call Stack이 비어있어야 Loop가 재개되기 때문이다.

### Task Queue와 Micro Task Queue의 차이점

- **Task Queue**: 1 Loop에 하나씩 처리된다.
- **Micro Task Queue**: 1 Loop에 전부 처리된다.

## Request Animation Frame (RAF)

DOM 요소의 변화가 반영되기 위해서는 Render Tree, Layout, Paint, Composite 과정을 거쳐야 한다.  
자세한 내용은 Critical Rendering Path 에서 다룬다.

### RAF Queue

RAF Queue에 콜백을 등록하면 Render 과정 전에 실행해 준다. 이는 화면 업데이트 전에 수행되므로, 부드러운 애니메이션을 구현하는 데 유용하다.

## Summary

Event Loop는 무한루프이며, 계속 루프를 돌고 있다.

1. **Call Stack이 비어있지 않다면** 루프를 일시정지하고 Call Stack을 계속 실행한다.
2. **Call Stack이 비어있으면** Micro Task Queue와 Task Queue를 검사하고, 만약 Queue에 요소가 있다면 Call Stack으로 가져와 실행한다.
3. 1 Loop 에 Micro Task Queue 는 모두 실행되고, Task Queue는 하나만 실행된다.
4. 가끔(주사율에 맞게, 주로 60fps) render 과정을 수행한다.

이와 같은 구조 덕분에 JavaScript는 싱글스레드 환경에서도 비동기 처리를 효율적으로 수행할 수 있다.
