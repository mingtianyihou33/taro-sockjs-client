# taro-sockjs-client

> sockjs-client for Taro

## install（安装）

npm:

```
    npm install taro-sockjs-client
```

yarn:

```
    yarn add taro-sockjs-client
```

## How to use（使用）

```javascript
import { Stomp } from '@stomp/stompjs'
import SockJS from 'taro-sockjs-client'

const sock = new SockJS(url)
const client = Stomp.over(sock)
client.connect({}, onConnected, onError)
```
