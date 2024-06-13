---
author: Surplus
pubDatetime: 2023-05-28T17:38:08Z
title: Hoisting
slug: hoisting
featured: false
draft: false
tags:
  - javascript
description: Hoisting에 대해 알아보자.
---

# Hoisting

자바스크립트는 모든 선언(let, const, 함수, 클래스 등)을 호이스팅한다.

호이스팅이란, 선언을 해당 스코프의 최상단으로 옮긴 것처럼 동작하는 특성을 의미한다.

따라서, 선언 위치에 도달하기 전에도 변수에 접근할 수 있다.

다만, 선언 방식에 따라 동작이 다르다.

## var

`var`는 선언과 동시에 초기화가 이루어지며, 선언 이전에도 사용할 수 있다.  
단, 할당 이전에 접근하면 `undefined` 값을 얻는다.

선언+초기화, 할당의 2 단계로 크게 구분이 가능하다.

```javascript
console.log(foo); // undefined
var foo = 1;
console.log(foo); // 1
```

선언이 호이스팅되고, 선언과 동시에 초기화가 이루어져 접근시 오류 없이 `undefined`를 출력했다.

## let

`let`의 경우 선언 단계, 초기화 단계, 할당 단계로 크게 구분이 가능하다.

```typescript
// 초기화 이전, 선언 단계에 해당
console.log(foo); // ReferenceError: foo is not defined

let foo; // 초기화 단계 실행
console.log(foo); // undefined

foo = 1; // 할당문에서 할당 단계 실행
console.log(foo); // 1
```

각 단계별 렉시컬 환경을 살펴 보자.

```typescript
{
  foo: uninitialized,
  outer: null
}
```

초기화되지 않은 상황이며, 스코프의 최상단에서 선언 단계가 실행된다.

```typescript
let foo;
```

```typescript
{
  foo: undefined,
  outer: null
}
```

선언위치에 도달하게 되면 초기화가 이루어 진다.  
선언 단계와 선언 위치의 차이에 유의하자 실제 선언 위치는 중간에 위치할 수 있지만 호이스팅되어 선언 단계는 스코프의 최상단에서 실행된다.

선언되었지만 값이 할당되지 않은 상태이다.  
초기화 이후부터 변수 참조가 가능해 진다.

```typescript
foo = 3;
```

```typescript
{
  foo: 3,
  outer: null
}
```

값이 할당되어 3이라는 값을 참조할 수 있다.

선언 단계와 초기화 단계 사이에서 변수를 참조하면 `ReferenceError`가 발생하는데, 이 구간을 TDZ(Temporal Dead Zone, 일시적 사각지대)라고 한다.

호이스팅이 되지 않는 것처럼 보일 수 있으나, 다음 코드를 보면 그렇지 않다는 것을 알 수 있다.

```typescript
let x = 1;

function func() {
  console.log(x); // ReferenceError

  let x = 2;
}

func();
```

호이스팅되지 않았다면 `1`을 출력해야 하지만, TDZ에 걸려 `ReferenceError`를 발생시킨다.

이는 `x`의 선언이 호이스팅되어 선언 단계가 실행된 것을 의미한다.

## 함수

함수도 호이스팅된다.  
이때 함수 선언문으로 생성된 경우 `var`처럼 선언과 동시에 초기화와 할당이 이루어져 실제 할당 도달하기 전에도 자유롭게 호출이 가능하다.

```javascript
console.log(foo()); // "Hello"
function foo() {
  return "Hello";
}
```

반면, 함수 표현식의 경우 변수에 함수 참조를 할당하는 방식이므로 선언 이전에 호출 시 TDZ에 걸리고, 할당 이전에 호출하면 `undefined`를 반환한다.

```javascript
console.log(foo()); // ReferenceError: foo is not defined
let foo = function () {
  return "Hello";
};
console.log(foo()); // "Hello"
```
