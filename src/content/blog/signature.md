---
author: Surplus
pubDatetime: 2023-05-29T01:54:49Z
title: Signature 구현
slug: signature
featured: false
draft: false
tags:
  - visualization
description: 서명을 구현해 보자.
---

# Signature

우연히 은행에 갈 일이 생겼었는데, 자필 서명을 서류에 직접 받는것이 아니라, 터치펜을 통해 화면에 그리는 방식으로 서명을 받았었다.  
한번 구현 해 보고 싶어졌으니 해 보자.

## Canvas API

canvas 는 canvas 태그를 사용해야 한다.  
또한, 조작을 위해서는 canvas의 context를 이용해야 한다.

```typescript
const canvasRef = useRef<HTMLCanvasElement>(null);
const contextRef = useRef<CanvasRenderingContext2D | null>(null);

useEffect(() => {
  if (canvasRef.current) {
    contextRef.current = canvasRef.current.getContext("2d");
  }
}, []);

function drawing() {
  if (!contextRef.current) return;

  contextRef.current.fillRect(15, 15, 15, 15);
}
```

## 흐릿함 해결하기

contextRef에 사각형을 찍어보면 흐릿하게 나온다.

![01](../../assets/images/signature/image.png)

흐릿함을 해결하기 위해서는 Device Pixel Ratio 라는 개념을 알아야 한다.

- Device Pixel Ratio

  우리는 CSS 를 사용해 Element의 스타일과 위치를 지정한다.

  ```css
  .element {
    height: 36px;
    top: 12px;
  }
  ```

  이 때 사용하는 단위를 CSS Pixel, 또는 px 라고 부른다.  
  화면 해상도와 크기에 따라 물리적인 Pixel 크기가 달라질 수 있다.  
  FHD 24인치 모니터와 QHD 6인치 휴대폰을 생각 해 보자.  
  높은 PPI에서의 1 Pixel 과 낮은 PPI 에서의 1 Pixel은 다를 수 밖에 없다.

  이 때, CSS Pixel 1개를 실제 화면 Pixel 몇개에 나타낼지를 정하는 것이 Device Pixel Ratio 이다.  
  Device Pixel Ratio 가 2 인 경우 (Windows OS 에선 200%) 하나의 CSS Pixel을 실제 Pixel 4개에 그린다. (2차원 좌표상의 비율이므로)

* Canvas 에 적용하기

  ```typescript
  useEffect(() => {
    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext("2d");

      const dpr = window.devicePixelRatio;

      let vw = Number(
        canvasRef.current.getBoundingClientRect().width.toFixed(1)
      );
      let vh = Number(
        canvasRef.current.getBoundingClientRect().height.toFixed(1)
      );

      canvasRef.current.width = vw * dpr;
      canvasRef.current.height = vh * dpr;

      contextRef.current?.scale(dpr, dpr);
    }
  }, []);
  ```

  dpr을 곱해 canvas pixel 과 화면 pixel 이 1:1 대응될 수 있게 조정 해 주자.

## 서명을 위한 속성 설정

서명을 위해, context의 속성을 설정 해 주자.

```typescript
// 이미지를 부드럽게
contextRef.current!.imageSmoothingEnabled = true;

// 이미지 부드러움 정도
contextRef.current!.imageSmoothingQuality = "high";

// 선 두께 설정
contextRef.current!.lineWidth = 3;

// 선 끝을 둥글게
contextRef.current!.lineCap = "round";

// 선 꺾이는 부분을 둥글게
contextRef.current!.lineJoin = "round";
```

## Drawing 함수

실제로 canvas 에 이벤트에 맞게 그려 주자.

```typescript
const mouseDrawing = useCallback(
  (e: MouseEvent) => {
    e.preventDefault();
    contextRef.current!.lineTo(
      e.clientX - canvasRef.current!.offsetLeft,
      e.clientY - canvasRef.current!.offsetTop
    );
    contextRef.current!.stroke();
  },
  [contextRef.current, canvasRef.current]
);
```

offsetLeft, offsetTop 을 사용하는 경우 오차가 발생했다.  
clientBoundingRect 로 그때그때의 top, left를 구하는 방식으로 변경했다.

```typescript
const mouseDrawing = useCallback(
  (e: MouseEvent) => {
    e.preventDefault();
    let canvas: DOMRect = canvasRef.current!.getBoundingClientRect();
    contextRef.current!.lineTo(e.clientX - canvas.left, e.clientY - canvas.top);
    contextRef.current!.stroke();
  },
  [contextRef.current, canvasRef.current]
);
```

제대로 동작한다.
