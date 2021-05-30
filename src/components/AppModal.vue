<template>
  <div
    v-if="opened"
    class="
      fixed
      top-0
      bottom-0
      left-0
      right-0
      bg-black bg-opacity-20
      flex
      justify-center
      items-center
      p-4
    "
    @click="onClick($event)"
  >
    <div
      ref="modal"
      class="
        bg-white
        p-5
        rounded-xl
        min-w-400
        max-w-lg max-h-full
        flex flex-col
        animate-popin
      "
    >
      <h2 class="text-lg font-bold text-center flex-shrink-0">{{ title }}</h2>

      <div class="overflow-auto my-4">
        <slot name="content"></slot>
      </div>

      <div class="flex-shrink-0 border-t border-c pt-4 flex">
        <slot name="footer" :onConfirm="onConfirm"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["opened", "title"],

  emits: ["close"],

  methods: {
    onClick(e) {
      const target = e.target;
      if (!this.$refs.modal || this.$refs.modal.contains(target)) return;
      this.$emit("close");
    },

    onConfirm() {
      console.log("confirm");
    },
  },
};
</script>
