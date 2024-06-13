---
author: Surplus
pubDatetime: 2023-07-01T22:00:08Z
title: HyperText Transfer Protocol
slug: hypertext-transfer-protocol
featured: false
draft: false
tags:
  - network
description: HTTP에 대해 알아보자.
---

# HTTP (HyperText Transfer Protocol)

HTTP는 웹에서 사용되는 Application Layer 프로토콜중 하나로, 요청(request)과 응답(response) 메커니즘을 통해 데이터를 주고받는다.

### 기본적인 특성

1. **비상태성 (Stateless)**:
   HTTP는 비상태성 프로토콜인데, 각 요청은 독립적이고 완전한 정보를 포함해야 한다.

2. **비연결성 (Connectionless)**:
   HTTP는 비연결성 프로토콜인데, 클라이언트가 서버에 요청을 보내면 서버는 요청을 처리하고 응답을 보낸 후 연결이 해제된다. (Keep-Alive기능이 추가되어 연결을 유지할 수 있음)

HTTP는 브라우저와 서버간 연결을 TCP 를 통해 연결한다.

그래서, 3 way handshake 과정 또한 수행하게 된다.

근데 어떻게 비연결성(TCP 의 특성과 상충함)특성을 갖는걸까?

HTTP의 비연결성은 각각의 요청에 대해 새로운 TCP 커넥션을 만들지 않고, 기존의 연결을 재사용하지 않는다는 것을 의미한다고 한다.

이 때 keep-alive 를 통해 해당 TCP 커넥션을 계속 이어갈 수 있다.

연결을 재사용하지 않으면 UDP 가 더 효율적이지 않을까?

실제로 그런 이유로, HTTP/1.1과 HTTP/2.0은 TCP 기반이지만, HTTP/3.0은 UDP 기반 으로 변경되었다고 한다.

### 요청(Request)과 응답(Response)

클라이언트가 서버에 특정 작업을 요청하는 메시지인 요청과 서버가 클라이언트의 요청에 대해 반환하는 메시지인 응답 메커니즘을 통해 데이터를 주고받게 된다.

두 메시지는 Line, Headers, Body 로 이루어져 있다.  
Line에는 URI, HTTP 버전, 상태코드 등이 포함될 수 있다.  
Body에는 데이터(JSON, 이미지 등)가 들어가고 Headers에는 메타데이터가 들어가게 된다.

### 상태 코드 (Status Codes)

HTTP 상태 코드는 요청에 대한 서버의 응답 상태를 나타낸다.  
상태 코드는 3자리 숫자로 구성되며, 첫 번째 자리는 응답의 범주를 나타낸다.

상태코드는 다음과 같은 의미를 지닌다.

- **1xx (정보)**: 요청을 받았고 프로세스를 계속합니다.
- **2xx (성공)**: 요청이 성공적으로 처리되었습니다.
  - **200 OK**: 요청이 성공적으로 처리되었습니다.
  - **201 Created**: 요청이 성공적으로 처리되었으며 새로운 리소스가 생성되었습니다.
- **3xx (리다이렉션)**: 요청 완료를 위해 추가 작업이 필요합니다.
  - **301 Moved Permanently**: 요청한 리소스가 영구적으로 이동되었습니다.
  - **302 Found**: 요청한 리소스가 임시로 다른 위치에 있습니다.
- **4xx (클라이언트 오류)**: 클라이언트의 요청에 오류가 있습니다.
  - **400 Bad Request**: 잘못된 요청입니다.
  - **404 Not Found**: 요청한 리소스를 찾을 수 없습니다.
- **5xx (서버 오류)**: 서버가 요청을 처리하는 중에 오류가 발생했습니다.

  - **500 Internal Server Error**: 서버 내부 오류입니다.
  - **503 Service Unavailable**: 서버가 일시적으로 요청을 처리할 수 없습니다.

  줄줄 외울 필요는 없고, 자주 쓰이는 200, 404, 500정도만 알아두자.

### Restful API

Restful API는 HTTP URI를 통해 Resource 명시하고 HTTP Method를 통해 CRUD Operation을 적용하는 규칙을 따르는 API를 의미한다.

### HTTP Methods

HTTP Methods로는 GET, POST, PUT, PATCH, DELETE, OPTIONS가 있다.

자주 사용되는 GET과 POST의 차이점을 짚어보자.

#### GET

GET은 데이터를 URL의 쿼리 파라미터에 담아 전송하며, HTTPS를 사용해도 URL이 쉽게 노출될 수 있고, 길이 제한이 있다.

#### POST

POST는 데이터를 요청 본문에 담아 전송하며, HTTPS 환경에서 본문이 암호화되어 상대적으로 안전하고 길이 제한이 사실상 없다.

GET은 주로 데이터 조회에, POST는 데이터 생성 및 서버 상태 변경에 사용된다.
