const worker = new SharedWorker("/worker.js");
worker.port.addEventListener("message", onMessage, false);
worker.port.start();

const tickersHandlers = new Map();
const btcUsdRate = {
  value: null,
};

const postMessage = (data) => {
  worker.port.postMessage(data);
};
const transport = {
  subscribeToTicker(tickers, currency) {
    postMessage({ type: "TICKER_SUBSCRIBE", data: { tickers, currency } });
  },
  unsubscribeFromTicker(tickers, currency) {
    postMessage({ type: "TICKER_UNSUBSCRIBE", data: { tickers, currency } });
  },
};

function onMessage(event) {
  if (event.data.type !== "SOCKET_MESSAGE") return;
  [...tickersHandlers.entries()].forEach(
    ([tickerSymbol, handlersByCurrency]) => {
      handleMessage(event.data.data, { tickerSymbol }, handlersByCurrency);
    }
  );
}

export const init = () => {
  subscribeToBtc();
};

const getTickerSubscribedCurrencies = (ticker) => {
  const tickerHandlersByCurrency = tickersHandlers.get(ticker);
  if (!tickerHandlersByCurrency) return [];
  return Object.keys(tickerHandlersByCurrency);
};

const addTickerHandler = (ticker, currency = "USD", events) => {
  const tickerHandlersByCurrency = tickersHandlers.get(ticker);

  tickersHandlers.set(ticker, {
    ...(tickerHandlersByCurrency || {}),
    [currency]: events,
  });
};

const removeTickerHandlers = (ticker, currencies = ["USD"]) => {
  const deleteHandler = (currency) => {
    const tickerHandlersByCurrency = tickersHandlers.get(ticker);

    if (!tickerHandlersByCurrency || !tickerHandlersByCurrency[currency])
      return;
    if (Object.values(tickerHandlersByCurrency).length === 1) {
      tickersHandlers.delete(ticker);
      return;
    }

    delete tickerHandlersByCurrency[currency];
    tickersHandlers.set(ticker, tickerHandlersByCurrency);
  };

  if (currencies.length === 0) {
    tickersHandlers.delete(ticker);
  } else {
    currencies.forEach((currency) => deleteHandler(currency));
  }
};

const convertPriceFromBtc = (price) => {
  if (!btcUsdRate.value) return null;
  return btcUsdRate.value * price;
};

export const handleMessage = (data, { tickerSymbol }, handlersByCurrency) => {
  switch (data.TYPE) {
    case "5": {
      if (tickerSymbol !== data.FROMSYMBOL) return;
      const handlers = handlersByCurrency[data.TOSYMBOL];
      if (!handlers || !Object.values(handlers).length) return;
      const { onUpdate } = handlers;
      const value =
        data.TOSYMBOL === "BTC" ? convertPriceFromBtc(data.PRICE) : data.PRICE;
      onUpdate(tickerSymbol, value);
      break;
    }
    case "500": {
      if (data.MESSAGE !== "INVALID_SUB") return;

      const dataArr = data.PARAMETER.split("~");
      const dataTickerSymbol = dataArr[2];
      const dataTickerCurrency = dataArr[3];

      if (dataTickerSymbol !== tickerSymbol) return;

      const handlers = handlersByCurrency[dataTickerCurrency];
      if (!handlers || !Object.values(handlers).length) return;
      const { onUpdate, onError } = handlers;

      if (dataTickerCurrency === "BTC") {
        onError && onError(tickerSymbol);
        removeTickerHandlers(dataTickerSymbol, ["BTC"]);
      } else {
        subscribeToTicker(tickerSymbol, { onUpdate, onError }, "BTC");
        removeTickerHandlers(dataTickerSymbol, ["USD"]);
      }
      break;
    }
  }
};

export const subscribeToBtc = () => {
  const btcCurrencies = getTickerSubscribedCurrencies("BTC");
  if (btcCurrencies.length) return;
  subscribeToTicker(
    "BTC",
    {
      onUpdate: (ticker, value) => {
        btcUsdRate.value = value;
      },
    },
    "USD"
  );
};

export const subscribeToTickers = (tickers, currency) => {
  if (!tickers.length) return;

  tickers.forEach(({ ticker, onUpdate, onError }) =>
    addTickerHandler(ticker, currency, { onUpdate, onError })
  );

  transport.subscribeToTicker(
    tickers.map(({ ticker }) => ticker),
    currency
  );
};

export const subscribeToTicker = (ticker, { onUpdate, onError }, currency) => {
  addTickerHandler(ticker, currency, { onUpdate, onError });

  transport.subscribeToTicker([ticker], currency);
};

export const unsubscribeFromTickers = (tickers, currencies = []) => {
  tickers = tickers.filter((ticker) => ticker !== "BTC");

  if (!tickers.length) return;

  tickers.forEach((ticker) => {
    if (currencies.length === 0) {
      const tickerCurrencies = getTickerSubscribedCurrencies(ticker);
      tickerCurrencies.forEach((currency) =>
        transport.unsubscribeFromTicker(tickers, currency)
      );
    } else {
      currencies.forEach((currency) =>
        transport.unsubscribeFromTicker(tickers, currency)
      );
    }

    removeTickerHandlers(ticker, currencies);
  });
};

export const unsubscribeFromTicker = (ticker, currencies = []) => {
  if (ticker === "BTC") return;

  if (currencies.length === 0) {
    const tickerCurrencies = getTickerSubscribedCurrencies(ticker);
    tickerCurrencies.forEach((currency) =>
      transport.unsubscribeFromTicker([ticker], currency)
    );
  } else {
    currencies.forEach((currency) =>
      transport.unsubscribeFromTicker([ticker], currency)
    );
  }

  removeTickerHandlers(ticker, currencies);
};
