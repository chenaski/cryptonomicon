<template>
  <app-modal title="Modal Title" :opened="isOpened" @close="handleModalClose">
    <template #content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tempor nisi
      felis, eu euismod mi accumsan a. Cras ac tempus urna, nec pretium dolor.
      Proin nec sodales metus. In sodales lectus ac magna malesuada, bibendum
      tristique risus viverra. Suspendisse sit amet urna vel nisl dignissim
      suscipit. Vestibulum iaculis justo vitae venenatis commodo. Morbi non
      dignissim lorem. In metus diam, sagittis eget magna et, vehicula faucibus
      risus. Etiam sodales nunc at lacus elementum tempor. Lorem ipsum dolor sit
      amet, consectetur adipiscing elit. Aliquam sed massa et odio sodales
      semper ut sed sem. Nulla enim risus, auctor vitae mollis vel, convallis
      sit amet odio. Ut ligula est, hendrerit sed leo vitae, scelerisque
      ultrices turpis. Duis volutpat ipsum sed enim viverra maximus. Integer a
      aliquet quam, ac vulputate enim. Aliquam quis lorem augue. Aliquam vitae
      rhoncus augue. Nullam et odio luctus, rhoncus augue consectetur,
      vestibulum lacus. Integer orci leo, commodo semper convallis ac, lobortis
      in diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
      posuere cubilia curae; Aenean eros augue, finibus a pulvinar a, blandit
      ullamcorper quam. Vivamus pulvinar feugiat nisi molestie sodales.
      Phasellus viverra eros quis magna rutrum mattis.
    </template>

    <template #footer="{ onConfirm }">
      <button
        v-if="!withConfirm"
        @click="handleClick(onConfirm)"
        class="
          ml-auto
          bg-green-500
          text-white
          px-4
          py-2
          min-w-120
          hover:bg-green-600
          transition
          rounded
        "
      >
        Ok
      </button>

      <div v-else class="flex-grow">
        <p class="mb-2">
          Enter `{{ $options.keyPhrase }}` to confirm that you have read the
          text
        </p>

        <form class="flex" @submit.prevent="handleClick(onConfirm)">
          <label class="">
            <input
              v-model="confirmInput"
              :placeholder="$options.keyPhrase"
              class="
                border
                rounded
                h-full
                px-4
                hover:border-blue-200
                transition
              "
              :class="{
                'border-green-200': isConfirmed,
              }"
            />
          </label>

          <button
            :disabled="!isConfirmed"
            class="
              ml-auto
              bg-green-500
              text-white
              px-4
              py-2
              min-w-120
              hover:bg-green-600
              transition
              rounded
              disabled:opacity-50
              disabled:bg-green-500
              disabled:cursor-default
            "
          >
            Ok
          </button>
        </form>
      </div>
    </template>
  </app-modal>
</template>

<script>
import AppModal from "@/components/AppModal";

export default {
  components: {
    AppModal,
  },

  props: ["withConfirm"],

  keyPhrase: "I understand",

  data() {
    return {
      isOpened: false,
      confirmInput: "",
    };
  },

  mounted() {
    setTimeout(() => {
      this.isOpened = true;
    }, 5000);
  },

  computed: {
    isConfirmed() {
      return (
        this.confirmInput.toLowerCase().trim() ===
        this.$options.keyPhrase.toLowerCase().trim()
      );
    },
  },

  methods: {
    handleModalClose() {
      this.isOpened = false;
    },

    handleClick(cb) {
      this.isOpened = false;
      cb();
    },
  },
};
</script>
