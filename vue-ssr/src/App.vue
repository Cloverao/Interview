<template>
  <div id="app"><div class="demo" @click="handleClick">一段内容</div></div>
</template>

<script>
export default {
  methods: {
    handleClick() {
      console.log(111);
    },
  },
};
</script>
