---
author: Surplus
pubDatetime: 2023-06-29T16:06:11Z
title: Closure, Lexical Environment
slug: closure-lexical-environment
featured: false
draft: false
tags:
  - javascript
description: Closure, Lexical Environment에 대해 알아보자.
---

# Closure 와 Lexical Environment

## Block Scope

블록 내부에서 선언된 변수는 블록 내부에서만 사용이 가능하다. 이는 변수의 범위(scope)를 제한하여, 블록 외부에서 변수에 접근하는 것을 방지하는 역할을 한다.

```typescript
{
  let count: number = 0;
  console.log(count);
}

console.log(count); // Cannot find name 'count'.
```

위 코드에서 `count`는 블록 내부에서만 접근할 수 있기 때문에 블록 외부에서 `count`를 참조하면 오류가 발생한다. 이는 블록 스코프가 변수를 안전하게 보호하는 방법 중 하나다.

블록 내부에서는 동일한 변수명을 중복 선언할 수 없다. 이는 변수의 중복 선언으로 인한 오류를 방지하는 데 도움이 된다.

```typescript
let count: number = 0;
let count: number = 0; // Cannot redeclare block-scoped variable 'count'.
```

위 코드에서 `count` 변수를 중복 선언하려고 하면 오류가 발생한다. 블록 스코프에서는 변수의 중복 선언을 허용하지 않기 때문이다.

if, for, while, switch 등 블록을 사용하는 경우 동일하게 적용된다. 단, for의 경우 블록 외부에 선언된 변수라도 블록 내부에서 선언된 변수로 취급된다.

```typescript
for (let i = 0; ; i++) {
  console.log(i);
}

console.log(i); // Cannot find name 'i'.
```

위 코드에서 `i`는 for 블록 내부에서만 접근할 수 있는 변수로 취급되므로, 블록 외부에서 `i`를 참조하면 오류가 발생한다.

이를 함수에 적용시켜 보자.

```typescript
function makeCounter() {
  let count = 0;

  return function () {
    return count++;
  };
}

let counter = makeCounter();
let counter2 = makeCounter();

console.log(counter()); // 0
console.log(counter()); // 1
console.log(counter()); // 2

console.log(counter2()); // ?
```

위 코드에서 `counter2`의 출력값은 0이 출력된다. 그 이유를 살펴 보자.

## Lexical Environment

함수나 블록 등 스코프는 각자 렉시컬 환경이라는 객체를 갖고 있다. 렉시컬 환경 객체는 두 부분으로, 환경 레코드(Environment Record)와 외부 렉시컬 참조(Outer Lexical Reference)로 구성된다.

- Variable

  변수는 이 렉시컬 환경 객체의 프로퍼티다. 즉, 함수나 블록에 변수가 선언되면, 이 렉시컬 환경에 등록되어 관리된다는 것이다.

  ```typescript
  {
    let count: number = 0;
    console.log(count);
  }
  ```

  위 블록의 렉시컬 환경 객체는 다음과 같이 이루어 진다.

  ```typescript
  {
    count: 0,
    outer: Outer Lexical Reference
  }
  ```

  제일 최상위 렉시컬 환경을 Global Lexical Environment 라고 하며, 이 렉시컬 환경은 외부 렉시컬 참조가 null이다. 단, 이 객체는 직접 얻거나 명시적 조작이 불가능하다.

* Function  
   함수는 렉시컬 환경에서 어떻게 관리될까?

  ```typescript
  a();
  function a() {}
  ```

  위 코드는 다음과 같은 렉시컬 환경을 갖는다.

  ```typescript
  {
    a: function,
    outer: null
  }
  ```

  함수 또한 변수와 동일하게 관리되는데, 함수 생성방식이 선언문이냐 표현식이냐에 따라 TDZ(Temporal Dead Zone)가 발생할 수 있다. TDZ에 대해서는 Hoisting에서 따로 다루도록 하자.  
  이제 변수를 참조하는 매커니즘을 이해할 수 있다.  
  참조가 발생하면 우선 자신 블록의 렉시컬 환경을 찾아보고, 없다면 outer의 렉시컬 환경을 찾아본다.  
  전역 렉시컬 환경에도 없다면 정말 없는 것이다.

다시 위에서의 함수를 한번 살펴 보자.

```typescript
function makeCounter() {
  let count = 0;

  return function () {
    return count++;
  };
}
```

함수를 리턴할 때, 함수 블록의 렉시컬 환경까지 같이 리턴되는데 이때 외부 렉시컬 참조는 선언될 당시의 외부 스코프 렉시컬 환경이다. 이러한 개념을 클로저(Closure)라고 한다.

즉, 선언될 당시의 환경을 기억하고 있는 것이다.

makeCounter를 호출해 counter1을 만들면 새로운 렉시컬 환경이 만들어지고, count가 0으로 초기화된다. 이 렉시컬 환경이 같이 반환되어 호출시 count를 증가시킨다.

makeCounter를 다시 호출해 counter2를 만들면 또 새로운 렉시컬 환경이 만들어지고, 다시 0부터 카운트된다.

위 예제에서 counter1과 counter2는 각각 별도의 렉시컬 환경을 가지기 때문에, 각자의 count 변수를 독립적으로 관리하게 된다.  
따라서 counter1과 counter2는 서로 영향을 주지 않고, 각각 자신의 카운트를 증가시킬 수 있다. 이를 통해 클로저의 강력한 기능을 확인할 수 있다.

이와 같은 클로저의 특성은 여러 가지 유용한 용도로 활용될 수 있다.

예를 들어, 비공개 변수와 메서드를 만들거나, 특정 상태를 유지하는 함수들을 생성할 수 있다.
