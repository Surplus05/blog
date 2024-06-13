---
author: Surplus
pubDatetime: 2024-05-12T07:34:39Z
title: 프론트엔드 에러 로깅
slug: error-logging
featured: false
draft: false
tags:
  - javascript
description: 프론트단에서 발생하는 에러를 잡아보자.
---

# Error Logging

백엔드 서버에는 오류를 감지해 슬랙으로 알려주고 있는데, 이번에 백엔드 서버에서 에러가 발생했음에도 감지하지 못했다.

새로운 속성이 임시로 하나 추가되어 validation check 에는 빠졌었는데 이 속성이 null을 반환해주고 있었다.

응답 자체는 200 ok 응답을 주고 있으니 에러로 판단하지 않았고, 이는 프론트엔드에서 에러로 이어졌다.

## Validation

프론트엔드 레벨에서도 Validation 함수를 추가했다.

```ts
export const checkPropertyList = (target: Object, propertyList: string[][]) => {
  return (
    target &&
    propertyList.every((propertyNameList) =>
      propertyNameList.some((property) => target.hasOwnProperty(property))
    )
  );
};
```

every와 some함수를 활용했다.

every는 모든 요소들에 대해 predicate 함수가 true여야 true를 리턴한다.  
some은 하나의 요소만 predicate 함수가 true면 true를 리턴한다.

propertyList는 2차원 배열로 구성되어 있는데, 1차원 배열이 아닌 경우는 동일한 속성이 서로다른 이름을 지닌 경우가 있었기 때문이다.

예를 들어 보자.

```ts
const temp = [
  ["productName", "product_name"],
  ["productPrice", "product_price"],
];
```

위처럼 Naming Convention이 달라지는 경우가 있었다.

`["productName", "product_name"]` 의 검사는 some으로, 전체 검사는 every로 하는 이유다.

checkPropertyList를 만족하지 않으면 error 를 throw 하자.

## Slack Notification

에러가 발생하면 슬랙 채널로 알림을 보내고 싶다.  
프론트단에서 Slack으로 알림을 바로 보내는것은 키 노출이나 기타 문제가 존재해 AWS Lambda를 한번 거쳐서 보내도록 하자.

AWS Lambda 로의 전송은 그냥 평범한 REST API 처럼 사용하면 된다.

```
[Client] ---> [AWS Lambda (Function URL)] ---> [Notion]
```

위와 같은 형태가 될 것이다.

```ts
fetch("https://api.endpoint.slack/", {
  method: "POST",
  body: JSON.stringify(ErrorObject),
});
```

에러를 감지해 전송하는 레퍼런스를 찾아보니 주로 Sentry를 사용하는 예제가 많았으나, 유로라고 한다.

직접 보내보자.

## ErrorBoundary

리액트에서는 하위 컴포넌트에서 발생한 객체도 상위 컴포넌트에서 포착 가능한 방법을 제공하고 있다.

https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary

이 ErrorBoundary를 활용하자.

```ts
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logErrorToMyService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
```

단, 다음과 같은 에러는 포착하지 않는다고 한다.

- 이벤트 핸들러
- 비동기적 코드 (예: setTimeout 혹은 requestAnimationFrame 콜백)
- 서버 사이드 렌더링
- 자식에서가 아닌 에러 경계 자체에서 발생하는 에러

## (in promise) Error Logging

비동기 오류를 캐치할 수 없는 이유부터 먼저 알아보자.

```ts
try {
  setTimeout(() => {
    throw new Error("error!");
  }, 0);
} catch (e) {
  console.log(e);
}
```

위 코드의 실행 결과는 어떻게 될까?

catch문이 존재하니 위에서 발생시킨 error는 제대로 캐치될까?

try...catch 블록은 setTimeout 콜백 함수 내부에서 발생하는 오류를 캐치할 수 없다.

왜냐하면 해당 오류는 콜스택에서 벗어나 이벤트 루프에 의해 처리되기 때문인데, setTimeout호출을 통해 MicroTask Queue에 함수를 성공적으로 등록했기에 catch 블록은 이미 종료되어 있다.

그러면 어떻게 처리하는게 좋을까?

비동기 호출을 async/await을 통해 처리하고 있다.

```ts
async function fetchData() {
  const result = await fetch("...");
  return result;
}

fetchData().catch((error) => {
  logErrorToMyService(error, userInfo);
});
```

async 함수는 Promise 를 반환하는데, 이에 대한 에러 처리는 Promise.catch를 활용했다.

어디든지 예외가 발생할 시 Promise가 rejected 되고, Promise.catch에서 처리가 가능하기 때문이다.

- 이벤트 핸들러 오류 커버하기

```ts
async function wrapper(
  target: (...args: any[]) => Promise<any>,
  ...args: any[]
) {
  try {
    const result = await target(...args);
    return result;
  } catch (error) {
    logErrorToMyService(error, userInfo);
  }
}
```

원본 함수를 래핑하는 간단한 함수를 만들었다.

만약 이벤트 핸들러에서 this를 사용해 this 바인딩이 필요하다면 call, apply와 같은 함수를 통해 추가하면 된다.

최종 형태는 아래와 같이 사용할 수 있을것이다.

```ts
const handleClick = async (event) => {
  throw new Error("test");
};
```

```tsx
<button onClick={(event) => wrapper(handleClick, event)}>클릭</button>
```

만약 event를 받지 않아도 된다면 다음과 같이 지정해 주었다.

```tsx
<<<<<<< HEAD
<button onClick={wrapper(handleClick)}>클릭</button>
```

# Wrapper는 여러 컴포넌트에서 사용할 수 있도록 훅을 만들어 제공 해 보자.

<button onClick={wrapper(handleClick, event)}>클릭</button>

````

Wrapper는 여러 컴포넌트에서 사용할 수 있도록 훅을 만들어 제공하자.
>>>>>>> f32e0cfd7344257e748e81742ccae0d3f28eae39

```ts
const useWrapper = () => {
  const wrapper = (target: Function, ...args: any[]) => {
    const wrappedFunction = async () => {
      try {
        const result = await target(...args);
        return result;
      } catch (error) {
        logErrorToMyService(error, userInfo);
      }
    };
    return wrappedFunction;
  };

  return wrapper;
};
````

이런 형태가 될 것이다.

```ts
const Component = () => {
  const wrapper = useWrapper();

  const handleClick = wrapper(() => {
    // 로직 수행..
  });

  return (
    <button onClick={handleClick}>
      클릭
    </button>
  );
};
```

event 객체를 사용하는 경우엔 어떻게 해야할까?

```ts
const Component = () => {
  const wrapper = useWrapper();

  const handleClick = wrapper((event) => {
    // event를 사용..
  });

  return (
    <button onClick={handleClick}>
      클릭
    </button>
  );
};
```

```ts
const useWrapper = () => {
  const eventWrapper = (target: Function, ...args: any[]) => {
    const wrappedFunction = async (event) => {
      try {
        const result = await target(event, ...args);
        return result;
      } catch (error) {
        logErrorToMyService(error, userInfo);
      }
    };
    return wrappedFunction;
  };

  return eventWrapper;
};
```

event 를 받을 수 있도록 추가했다.

```ts
const useWrapper = () => {
  const eventWrapper = (target: Function, ...args: any[]) => {
    const wrappedFunction = async (event) => {
      try {
        const result = await target(event, ...args);
        return result;
      } catch (error) {
        logErrorToMyService(error, userInfo);
      }
    };
    return wrappedFunction;
  };

  const wrapper = (target: Function, ...args: any[]) => {
    const wrappedFunction = async () => {
      try {
        const result = await target(...args);
        return result;
      } catch (error) {
        logErrorToMyService(error, userInfo);
      }
    };
    return wrappedFunction;
  };

  return { eventWrapper, wrapper };
};
```

최종 완성된 훅의 형태.
