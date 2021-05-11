<template>
  <div v-if="page > 1 || hasNextPage">
    <hr class="w-full border-t border-gray-600 my-4" />

    <button
      v-if="page > 1"
      type="button"
      class="
        my-4
        inline-flex
        items-center
        py-2
        px-4
        border border-transparent
        shadow-sm
        text-sm
        leading-4
        font-medium
        rounded-full
        text-white
        bg-gray-600
        hover:bg-gray-700
        transition-colors
        duration-300
        focus:outline-none
        focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
      "
      @click="goToPrevPage"
    >
      Назад
    </button>

    <button
      v-if="hasNextPage"
      type="button"
      class="
        ml-5
        my-4
        inline-flex
        items-center
        py-2
        px-4
        border border-transparent
        shadow-sm
        text-sm
        leading-4
        font-medium
        rounded-full
        text-white
        bg-gray-600
        hover:bg-gray-700
        transition-colors
        duration-300
        focus:outline-none
        focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
      "
      @click="goToNextPage"
    >
      Вперед
    </button>
  </div>
</template>

<script>
export default {
  props: ["modelValue", "totalItemsCount", "itemsPerPage"],

  emits: ["update:modelValue"],

  computed: {
    hasNextPage() {
      return this.totalItemsCount > this.page * this.itemsPerPage;
    },

    page: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },

  methods: {
    goToNextPage() {
      this.page = this.page + 1;
    },

    goToPrevPage() {
      this.page = this.page - 1;
    },
  },
};
</script>
