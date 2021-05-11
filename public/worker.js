const API_KEY =
  "61e7d66f42003b96aa68acca7a494f2ff0ffcdd5d4ab2c831a187cc5f61d7f88";
const URL = `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`;

const OUTCOME_MESSAGE_TYPES = {
  SOCKET_MESSAGE: "SOCKET_MESSAGE",
  SOCKET_OPEN: "SOCKET_OPEN",
  SOCKET_CLOSE: "SOCKET_CLOSE",
};

const INCOME_MESSAGE_TYPES = {
  TICKER_SUBSCRIBE: "TICKER_SUBSCRIBE",
  TICKER_UNSUBSCRIBE: "TICKER_UNSUBSCRIBE",
};

self.addEventListener("connect", handleConnect, false);

const state = {
  socket: null,
  isSocketOpened: false,
};

function handleConnect(event) {
  const source = event.source;
  source.addEventListener("message", handleMessage, false);
  source.start();

  subscribeToSocket(source);
}

function handleMessage(event) {
  const handlerByEventType = {
    [INCOME_MESSAGE_TYPES.TICKER_SUBSCRIBE]: handleSubscribeToTicker,
    [INCOME_MESSAGE_TYPES.TICKER_UNSUBSCRIBE]: handleUnsubscribeFromTicker,
  };

  const handler = handlerByEventType[event.data.type];
  handler(event.data.data);
}

function subscribeToSocket(source) {
  if (state.isSocketOpened) return;

  state.isSocketOpened = true;
  state.socket = new WebSocket(URL);

  state.socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    sendToClients(source, {
      type: OUTCOME_MESSAGE_TYPES.SOCKET_MESSAGE,
      data,
    });
  });

  state.socket.addEventListener("open", (event) => {
    sendToClients(source, { type: OUTCOME_MESSAGE_TYPES.SOCKET_OPEN });
  });

  state.socket.addEventListener("close", () => {
    sendToClients(source, { type: OUTCOME_MESSAGE_TYPES.SOCKET_CLOSE });
    state.isSocketOpened = false;
  });
}

function sendToClients(source, data) {
  source.postMessage(data);
}

function handleSubscribeToTicker({ tickers, currency = "USD" }) {
  sendWebSocketData({
    action: "SubAdd",
    subs: tickers.map((ticker) => `5~CCCAGG~${ticker}~${currency}`),
  });
}

function handleUnsubscribeFromTicker({ tickers, currency = "USD" }) {
  sendWebSocketData({
    action: "SubRemove",
    subs: tickers.map((ticker) => `5~CCCAGG~${ticker}~${currency}`),
  });
}

function sendWebSocketData(data) {
  if (state.socket.readyState !== WebSocket.OPEN) {
    state.socket.addEventListener("open", () => {
      state.socket.send(JSON.stringify(data));
    });

    return;
  }

  state.socket.send(JSON.stringify(data));
}
