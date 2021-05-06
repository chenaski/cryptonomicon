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

      <template v-if="selectedTicker">
        <hr class="w-full border-t border-gray-600 my-4" />
        <section class="relative">
          <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
            {{ selectedTicker.name }} - USD
          </h3>
          <div
            ref="graphContainer"
            class="flex items-end border-gray-600 border-b border-l h-64"
          >
            <div
              v-for="(graphValue, i) in normalizedGraph"
              v-bind:key="i"
              ref="graphItem"
              :style="{ height: `${graphValue}%` }"
              class="bg-purple-800 border w-10 h-24"
            ></div>
          </div>
          <button
            type="button"
            class="absolute top-0 right-0"
            @click="unselectTicker()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              x="0"
              y="0"
              viewBox="0 0 511.76 511.76"
              style="enable-background: new 0 0 512 512"
              xml:space="preserve"
            >
              <g>
                <path
                  d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                  fill="#718096"
                  data-original="#000000"
                ></path>
              </g>
            </svg>
          </button>
        </section>
      </template>
    </div>
  </div>
</template>

<script>
import {
  init,
  subscribeToTicker,
  subscribeToTickers,
  unsubscribeFromTickers
} from "./api";
import CreateTicker from "@/components/CreateTicker";
import AppLoader from "@/components/AppLoader";
import AppPagination from "@/components/AppPagination";
import FilterInput from "@/components/FilterInput";
import PinnedTickers from "@/components/PinnedTickers";

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
    PinnedTickers
  },

  data() {
    return {
      allTickers: [],
      pinnedTickers: [],

      tickerFilterInput: "",

      selectedTicker: null,
      selectedTickerGraph: [],

      page: 1,
      itemsPerPage: 6
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
      this.pinnedTickers.map(ticker => ticker.symbol)
    );
    this.clearGraph();
  },

  computed: {
    filteredTickers() {
      return this.pinnedTickers.filter(ticker =>
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

    normalizedGraph() {
      const minValue = Math.min(...this.selectedTickerGraph);
      const maxValue = Math.max(...this.selectedTickerGraph);

      return this.selectedTickerGraph.map(
        value => ((value - minValue) * 100) / (maxValue - minValue)
      );
    }
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
    }
  },

  methods: {
    async getAllTickers() {
      const tickers = await fetch(GET_ALL_TICKERS_URL).then(response =>
        response.json()
      );
      this.allTickers = Object.values(tickers.Data).map(ticker => ({
        id: ticker.Id,
        name: ticker.FullName,
        symbol: ticker.Symbol
      }));
    },

    pinTicker(tickerToPin) {
      this.pinnedTickers = [...this.pinnedTickers, tickerToPin];
      this.subscribeToTicker(tickerToPin);
    },

    unpinTicker(tickerToUnpin) {
      this.unsubscribeFromTickers([tickerToUnpin]);
      this.pinnedTickers = this.pinnedTickers.filter(
        ticker => ticker.id !== tickerToUnpin.id
      );
      this.clearGraph();
    },

    updateTicker(tickerId, newTicker) {
      this.pinnedTickers = this.pinnedTickers.map(ticker => {
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
        existedTicker => existedTicker.symbol === ticker.symbol
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
        onError: this.onUpdateTickerError
      });
    },

    unsubscribeFromTickers(tickers) {
      unsubscribeFromTickers(tickers.map(ticker => ticker.symbol));
    },

    onUpdateTicker(tickerSymbol, nextValue) {
      const ticker = this.pinnedTickers.find(
        ticker => ticker.symbol === tickerSymbol
      );
      if (!ticker || !nextValue) return;
      ticker.value = nextValue;
      this.clearTickerError(ticker);
      this.updateGraph(nextValue);
    },

    onUpdateTickerError(tickerSymbol) {
      const ticker = this.pinnedTickers.find(
        ticker => ticker.symbol === tickerSymbol
      );
      if (!ticker) return;
      this.setTickerError(ticker);
    },

    getMaxGraphItemsCount() {
      if (!this.$refs.graphContainer || !this.$refs.graphItem) return 0;
      this.graphItemWidth = !this.graphItemWidth
        ? this.$refs.graphItem.offsetWidth
        : this.graphItemWidth;
      console.log(this.graphItemWidth);
      const graphWidth = this.$refs.graphContainer.offsetWidth;
      return Math.floor(graphWidth / this.graphItemWidth);
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
          value
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
            symbol
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

        this.pinnedTickers = storedTickers.filter(ticker => !!ticker?.symbol);

        subscribeToTickers(
          this.pinnedTickers.map(ticker => ({
            ticker: ticker.symbol,
            onUpdate: this.onUpdateTicker,
            onError: this.onUpdateTickerError
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
        pageParam ? `page=${pageParam}` : null
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
    }
  }
};
</script>
