<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      class="hidden fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <div class="container">
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
                :value="tickerInput"
                @input="onChangeInput"
                @keydown.enter="addTickerByInput"
              />
            </div>
            <div
              v-if="similarTickers.length"
              class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
            >
              <span
                v-for="ticker in similarTickers"
                v-bind:key="ticker.id"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                @click="addTicker(ticker)"
              >
                {{ ticker.name }}
              </span>
            </div>
            <div v-if="isTickerExistsError" class="text-sm text-red-600">
              Такой тикер уже добавлен
            </div>
          </div>
        </div>
        <button
          type="button"
          class="mt-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          @click="addTickerByInput"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
      </section>

      <div v-if="page > 1 || hasNextPage">
        <hr class="w-full border-t border-gray-600 my-4" />

        <button
          v-if="page > 1"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          @click="goToPrevPage"
        >
          Назад
        </button>

        <button
          v-if="hasNextPage"
          type="button"
          class="ml-5 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          @click="goToNextPage"
        >
          Вперед
        </button>
      </div>

      <hr class="w-full border-t border-gray-600 my-4" />

      <div class="max-w-xs">
        <label for="filter" class="block text-sm font-medium text-gray-700"
          >Фильтр</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            type="text"
            name="filter"
            id="filter"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
            v-model="tickerFilterInput"
            @keydown.enter="addTickerByInput"
          />
        </div>
      </div>

      <template v-if="pinnedTickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="ticker in pagePinnedTickers"
            v-bind:key="ticker.id"
            class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
            :class="{
              'border-4': isTickerSelected(ticker)
            }"
            @click="selectTicker(ticker)"
          >
            <div
              class="px-4 py-5 sm:p-6 text-center"
              :class="[ticker.error ? 'bg-red-100' : 'bg-white']"
            >
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ ticker.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ ticker.value }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
              @click.stop="removeTicker(ticker)"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
      </template>

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
  subscribeToTickers,
  subscribeToTicker,
  unsubscribeFromTickers
} from "./api";

const TICKERS_PER_PAGE = 6;
const TICKERS_STORE_KEY = "tickers";
const GET_ALL_TICKERS_URL =
  "https://min-api.cryptocompare.com/data/all/coinlist?summary=true";

export default {
  name: "App",

  data() {
    return {
      allTickers: [],
      pinnedTickers: [],
      similarTickers: [],

      tickerInput: "",
      tickerFilterInput: "",

      selectedTicker: null,
      selectedTickerGraph: [],

      isTickerExistsError: false,
      page: 1
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
      const from = (this.page - 1) * TICKERS_PER_PAGE;
      const to = this.page * TICKERS_PER_PAGE;

      return this.filteredTickers.slice(from, to);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.page * TICKERS_PER_PAGE;
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
    tickerInput() {
      const tickerName = this.tickerInput.toLowerCase();

      if (!tickerName) {
        this.similarTickers = [];
        return;
      }

      const similarTickers = this.allTickers
        .filter(ticker => ticker.symbol.toLowerCase().includes(tickerName))
        .slice(0, 4);

      this.similarTickers = similarTickers;
    },
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

    addTickerByInput() {
      const tickerSymbol = this.tickerInput.toLowerCase();
      const tickerToAdd = this.allTickers.find(
        ticker => ticker.symbol.toLowerCase() === tickerSymbol
      );

      if (!tickerToAdd) return;

      this.addTicker(tickerToAdd);
    },

    async addTicker(ticker) {
      const tickerToAdd = { ...ticker, value: "-" };

      if (this.isTickerExists(tickerToAdd)) {
        this.tickerInput = tickerToAdd.symbol;
        this.isTickerExistsError = true;
        return;
      }

      this.pinnedTickers = [...this.pinnedTickers, tickerToAdd];
      this.tickerInput = "";
      this.isTickerExistsError = false;

      this.subscribeToTicker(tickerToAdd);
    },

    removeTicker(tickerToRemove) {
      this.unsubscribeFromTickers([tickerToRemove]);
      this.pinnedTickers = this.pinnedTickers.filter(
        ticker => ticker.id !== tickerToRemove.id
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

    isTickerSelected(ticker) {
      if (!this.selectedTicker) return false;
      return ticker.id === this.selectedTicker.id;
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

    onChangeInput(e) {
      const value = e.target.value;
      this.tickerInput = value;

      this.isTickerExistsError = false;
    },

    goToNextPage() {
      this.page = this.page + 1;
    },

    goToPrevPage() {
      this.page = this.page - 1;
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
        this.pinnedTickers = storedTickers;
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
