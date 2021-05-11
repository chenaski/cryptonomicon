<template>
  <div class="max-w-xs">
    <label for="filter" class="block text-sm font-medium text-gray-700"
      >Фильтр</label
    >
    <div class="mt-1 relative rounded-md shadow-md">
      <input
        type="text"
        name="filter"
        id="filter"
        class="
          block
          w-full
          pr-10
          border-gray-300
          text-gray-900
          focus:outline-none
          focus:ring-gray-500
          focus:border-gray-500
          sm:text-sm
          rounded-md
        "
        placeholder="Например DOGE"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: ["modelValue"],
  emits: ["update:modelValue"],
};
</script>
