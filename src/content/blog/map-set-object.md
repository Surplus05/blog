---
author: Surplus
pubDatetime: 2023-05-21T10:05:43Z
title: map, set, object
slug: map-set-object
featured: false
draft: false
tags:
  - javascript
description: map, set, object에 대해 알아보자.
---

# Map, Set, Object

Map, Set, Object에 대해 알아보자.

### Map

맵(Map)은 키가 있는 데이터를 저장한다는 점에서 객체와 유사하지만, 맵은 키에 다양한 자료형을 허용한다.

그리고, 순서가 보장(Iterable)된다.

Iterable하기 때문에 순회가 가능하다.

```ts
const map = new Map();

map.set("a", 1);
map.set("b", 2);

Array.from(map); // 가능, [["a", 1],  ["b", 2]];

map.forEach((value, key) => {
  console.log(key, value);
});

for (let [key, value] of map) {
  console.log(key, value);
}
```

### Set

Set 은 키가 존재하지 않고, 유일한 값만 갖는다.

값에는 객체, 함수, Primitive 등 모든 타입이 허용된다.

Set 또한 순서가 보장(Iterable)된다.

중복을 다루지 않고 싶을때 유용하다.

```ts
const set = new Set();

set.add(1);
set.add(1);
set.add(1);
set.add(2);

set.forEach((value) => {
  console.log(value); // 1, 2 한번씩 출력
});
```

Set을 활용해 중복 제거도 가능하다.

```ts
const array = [1, 1, 2, 2, 3, 3, 4];
const uniqueArray = Array.from(new Set(array));

console.log(uniqueArray); // [1, 2, 3, 4]
```

### Object

키-값 형태를 갖는다.

키는 반드시 문자열 또는 심볼 타입이어야 한다.

그리고, 순서가 보장되지 않는다.

es6에서는 숫자 키에 한해 보장된다고 한다.

map에서는 '1'과 1을 다르게 취급했지만, object에서는 동일한 키로 취급된다.

그래서, 심볼 타입을 제외한 나머지 타입은 문자열 타입으로 자동 형변환이 이루어 진다.

```ts
let obj = {};

obj[123] = "number";
console.log(obj); // { '123': 'number' }

obj[true] = "boolean";
console.log(obj); // { '123': 'number', 'true': 'boolean' }

let myObj = { key: "value" };
obj[myObj] = "object";
console.log(obj); // { '123': 'number', 'true': 'boolean', '[object Object]': 'object' }

let sym = Symbol("mySymbol");
obj[sym] = "symbol";
console.log(obj); // { '123': 'number', 'true': 'boolean', '[object Object]': 'object', [Symbol(mySymbol)]: 'symbol' }

// 형변환이 이루어져 "123"은 123을 덮어쓰게 된다.
let numberString = "123";
obj[numberString] = "string";
console.log(obj); // { '123': 'string' }

// 형변환이 이루어져 "true"는 true를 덮어쓰게 된다.
let booleanString = "true";
obj[booleanString] = "string";
console.log(obj); // { 'true': 'string' }
```
