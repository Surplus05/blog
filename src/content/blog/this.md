---
author: Surplus
pubDatetime: 2023-06-12T05:10:08Z
title: This
slug: this
featured: false
draft: false
tags:
  - javascript
description: this에 대해 알아보자.
---

this는 위치에 따라 내용이 달라질 수 있는데, 4가지 사례를 살펴 보자.

## 일반 함수에서의 this

```typescript
function f() {
  console.log(this);
}
```

일반 함수에서 `this`는 기본적으로 전역 객체를 참조한다. 브라우저 환경에서는 전역 객체가 `window`이며, Node.js 환경에서는 `global` 객체가 된다. 예를 들어 브라우저에서 위의 함수를 호출하면 `this`는 `window` 객체를 가리키게 된다.

## 객체 메서드의 this

```typescript
let userA = { name: "A" };
let userB = { name: "B" };

function f() {
  console.log(this);
}

// 별개의 객체에서 동일한 함수를 사용함
userA.f = f;
userB.f = f;

userA.f(); // { name: 'A', f: [Function: f] }

userB.f(); // { name: 'B', f: [Function: f] }
```

객체 메서드에서 `this`는 호출한 객체, 즉 Caller를 참조한다. 위의 예제에서 `userA.f()`를 호출하면 `this`는 `userA` 객체를 가리키고, `userB.f()`를 호출하면 `this`는 `userB` 객체를 가리킨다.

## 생성자 함수에서의 this

```typescript
function UserInfo(name, age) {
  this.name = name;
  this.age = age;
}

let user = new UserInfo("John", 30);

console.log(user);
```

생성자 함수에서 `this`는 새로 생성되는 객체를 참조한다. 생성자 함수는 `new` 키워드와 함께 호출되며, 이때 `this`는 빈 객체를 가리키게 되고, 생성자 함수 내에서 해당 객체에 속성을 추가한다. 위의 예제에서 `new UserInfo("John", 30)`을 호출하면 `this`는 `{ name: "John", age: 30 }`인 객체를 참조하게 된다.

## 화살표 함수

화살표 함수에서는 자체 `this` 값을 갖지 않고 외부 컨텍스트에서 `this` 값을 그대로 사용한다.

```typescript
let user = {
  firstName: "보라",
  sayHi() {
    let arrow = () => alert(this.firstName);
    arrow(); // Caller가 없음, 외부의 this값 참조
  },
};

user.sayHi(); // 보라
```

화살표 함수는 일반 함수와 다르게 `this`를 자체적으로 설정하지 않고, 선언된 위치에서의 `this`를 상속받는다. 위의 예제에서 화살표 함수 `arrow`는 `sayHi` 메서드 내부에 선언되었기 때문에 `sayHi` 메서드의 `this`를 상속받아 `user` 객체를 참조하게 된다. 결과적으로 `alert(this.firstName)`은 `user.firstName`을 참조하여 "보라"를 출력하게 된다.

### 번외 : addEventListener(화살표 함수 vs function)

`addEventListener`로 화살표 함수를 사용하는 경우, 화살표 함수 내부의 `this`는 이벤트 리스너를 설정한 객체가 아닌, 화살표 함수가 정의된 위치에서의 `this`를 참조하게 된다. 이는 일반 함수와 달리 화살표 함수는 자신만의 `this`를 가지지 않고 외부 컨텍스트의 `this`를 그대로 사용하기 때문이다.

예를 들어, 다음 코드를 살펴보자.

```typescript
let user = {
  firstName: "보라",
  showName() {
    document.querySelector("#button").addEventListener("click", (e) => {
      console.log(this.firstName);
    });
  },
};

user.showName();
```

위의 코드에서 `showName` 메서드는 화살표 함수를 사용하여 이벤트 리스너를 설정한다. 이 경우 `this`는 `showName` 메서드가 호출된 객체인 `user`를 참조하게 된다. 따라서, 버튼을 클릭했을 때 "보라"가 출력된다.

반면에, 일반 함수 표현식을 사용하면 다음과 같이 동작한다.

```typescript
let user = {
  firstName: "보라",
  showName() {
    document.querySelector("#button").addEventListener("click", function (e) {
      console.log(this.firstName);
    });
  },
};

user.showName();
```

이 경우, 이벤트 리스너로 설정된 일반 함수 내부의 `this`는 이벤트를 발생시킨 요소를 가리키게 된다. 즉, 버튼을 클릭했을 때 `this`는 `#button` Element를 참조(e.currentTarget과 동일)하며, `this.firstName`은 `undefined`가 된다.
