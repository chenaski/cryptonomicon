<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <app-loader :active="false"></app-loader>

    <div class="container">
      <create-ticker
        :tickers="allTickers"
        @addTicker="pinTicker"
        :isTickerExists="isTickerExists"
      ></create-ticker>

      <app-pagination
        :items-per-page="itemsPerPage"
        :total-items-count="filteredTickers.length"
        v-model="page"
      ></app-pagination>

      <hr class="w-full border-t border-gray-600 my-4" />

      <filter-input v-model="tickerFilterInput" />

      <pinned-tickers
        :pinned-tickers="pagePinnedTickers"
        :selected-ticker="selectedTicker"
        @selectTicker="selectTicker"
        @unpinTicker="unpinTicker"
      ></pinned-tickers>
    </div>

    <ticker-graph
      v-if="selectedTicker"
      ref="graphContainer"
      :ticker-name="selectedTicker.name"
      v-model="selectedTickerGraph"
      @closeGraph="unselectTicker"
    ></ticker-graph>
  </div>
</template>

<script>
import {
  init,
  subscribeToTicker,
  subscribeToTickers,
  unsubscribeFromTickers,
} from "./api";
import CreateTicker from "@/components/CreateTicker";
import AppLoader from "@/components/AppLoader";
import AppPagination from "@/components/AppPagination";
import FilterInput from "@/components/FilterInput";
import PinnedTickers from "@/components/PinnedTickers";
import TickerGraph from "@/components/TickerGraph";

const TICKERS_STORE_KEY = "tickers";
const GET_ALL_TICKERS_URL =
  "https://min-api.cryptocompare.com/data/all/coinlist?summary=true";

export default {
  name: "App",

  components: {
    CreateTicker,
    AppLoader,
    AppPagination,
    FilterInput,
    PinnedTickers,
    TickerGraph,
  },

  data() {
    return {
      allTickers: [],
      pinnedTickers: [],

      tickerFilterInput: "",

      selectedTicker: null,
      selectedTickerGraph: [],

      page: 1,
      itemsPerPage: 6,
    };
  },

  mounted() {
    this.getAllTickers();
    this.restoreTickers();
    this.restoreStateFromUrl();
    init();
  },

  unmounted() {
    this.unsubscribeFromTickers(
      this.pinnedTickers.map((ticker) => ticker.symbol)
    );
    this.clearGraph();
  },

  computed: {
    filteredTickers() {
      return this.pinnedTickers.filter((ticker) =>
        ticker.symbol
          .toLowerCase()
          .includes(this.tickerFilterInput.toLowerCase())
      );
    },

    pagePinnedTickers() {
      const from = (this.page - 1) * this.itemsPerPage;
      const to = this.page * this.itemsPerPage;

      return this.filteredTickers.slice(from, to);
    },
  },

  watch: {
    tickerFilterInput() {
      this.page = 1;
      this.updateUrlParams({ filter: this.tickerFilterInput });
    },
    pinnedTickers() {
      this.saveTickers();
    },
    page() {
      this.updateUrlParams({ page: this.page });
    },
  },

  methods: {
    async getAllTickers() {
      const tickers = await fetch(GET_ALL_TICKERS_URL).then((response) =>
        response.json()
      );
      this.allTickers = Object.values(tickers.Data).map((ticker) => ({
        id: ticker.Id,
        name: ticker.FullName,
        symbol: ticker.Symbol,
      }));
    },

    pinTicker(tickerToPin) {
      this.pinnedTickers = [...this.pinnedTickers, tickerToPin];
      this.subscribeToTicker(tickerToPin);
    },

    unpinTicker(tickerToUnpin) {
      this.unsubscribeFromTickers([tickerToUnpin]);
      this.pinnedTickers = this.pinnedTickers.filter(
        (ticker) => ticker.id !== tickerToUnpin.id
      );
      this.clearGraph();
    },

    updateTicker(tickerId, newTicker) {
      this.pinnedTickers = this.pinnedTickers.map((ticker) => {
        if (tickerId !== ticker.id) return ticker;
        return newTicker;
      });
    },

    selectTicker(tickerToSelect) {
      this.clearGraph();

      if (tickerToSelect.id === this.selectedTickerId) {
        this.selectedTicker = null;
      } else {
        this.selectedTicker = tickerToSelect;
      }
    },

    unselectTicker() {
      this.selectedTicker = null;
    },

    isTickerExists(ticker) {
      return this.pinnedTickers.find(
        (existedTicker) => existedTicker.symbol === ticker.symbol
      );
    },

    setTickerError(ticker) {
      ticker.error = true;
    },

    clearTickerError(ticker) {
      ticker.error = false;
    },

    subscribeToTicker(ticker) {
      subscribeToTicker(ticker.symbol, {
        onUpdate: this.onUpdateTicker,
        onError: this.onUpdateTickerError,
      });
    },

    unsubscribeFromTickers(tickers) {
      unsubscribeFromTickers(tickers.map((ticker) => ticker.symbol));
    },

    onUpdateTicker(tickerSymbol, nextValue) {
      const ticker = this.pinnedTickers.find(
        (ticker) => ticker.symbol === tickerSymbol
      );

      if (!ticker || !nextValue) return;

      ticker.value = nextValue;
      this.clearTickerError(ticker);

      if (this.selectedTicker?.symbol === tickerSymbol) {
        this.updateGraph(nextValue);
      }
    },

    onUpdateTickerError(tickerSymbol) {
      const ticker = this.pinnedTickers.find(
        (ticker) => ticker.symbol === tickerSymbol
      );
      if (!ticker) return;
      this.setTickerError(ticker);
    },

    getMaxGraphItemsCount() {
      const graphContainerWidth =
        this.$refs.graphContainer.getGraphContainerWidth();
      const graphItemWidth = this.$refs.graphContainer.getGraphItemWidth();

      if (!graphContainerWidth || !graphItemWidth) return 0;

      return Math.floor(graphContainerWidth / graphItemWidth);
    },

    updateGraph(value) {
      const maxItemsCount = this.getMaxGraphItemsCount();
      const currentItemsCount = this.selectedTickerGraph.length;

      if (maxItemsCount && currentItemsCount >= maxItemsCount) {
        this.selectedTickerGraph = [
          ...this.selectedTickerGraph.slice(
            currentItemsCount - maxItemsCount + 1,
            currentItemsCount
          ),
          value,
        ];
      } else {
        this.selectedTickerGraph = [...this.selectedTickerGraph, value];
      }
    },

    clearGraph() {
      this.selectedTickerGraph = [];
    },

    saveTickers() {
      window.localStorage.setItem(
        TICKERS_STORE_KEY,
        JSON.stringify(
          this.pinnedTickers.map(({ id, name, value, symbol }) => ({
            id,
            name,
            value,
            symbol,
          }))
        )
      );
    },

    restoreTickers() {
      try {
        const storedTickers = JSON.parse(
          window.localStorage.getItem(TICKERS_STORE_KEY)
        );

        if (!storedTickers) return;

        this.pinnedTickers = storedTickers.filter((ticker) => !!ticker?.symbol);

        subscribeToTickers(
          this.pinnedTickers.map((ticker) => ({
            ticker: ticker.symbol,
            onUpdate: this.onUpdateTicker,
            onError: this.onUpdateTickerError,
          }))
        );
      } catch (e) {
        console.error(e);
      }
    },

    getUrlParams() {
      const urlParams = Object.fromEntries(
        new URL(window.location).searchParams.entries()
      );
      return { filter: urlParams?.filter, page: urlParams?.page };
    },

    updateUrlParams({ filter, page }) {
      const { filter: urlFilter, page: urlPage } = this.getUrlParams();
      const filterParam = filter ?? urlFilter;
      const pageParam = page ?? urlPage;

      const paramsString = [
        filterParam ? `filter=${filterParam}` : null,
        pageParam ? `page=${pageParam}` : null,
      ]
        .filter(Boolean)
        .join("&");

      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}${paramsString ? `?${paramsString}` : ""}`
      );
    },

    restoreStateFromUrl() {
      const { filter, page } = this.getUrlParams();

      this.page = +page || 1;
      this.tickerFilterInput = filter || "";
    },
  },
};
</script>
