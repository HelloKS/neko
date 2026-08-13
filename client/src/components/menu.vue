<template>
  <ul>
    <li>
      <i
        class="fas fa-shield-alt"
        v-tooltip="{
          content: $t('admin_loggedin'),
          placement: 'right',
          offset: 5,
          boundariesElement: 'body',
        }"
        v-if="admin"
      />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
  ul {
    li {
      display: inline-block;
      margin-right: 10px;

      i {
        font-size: 24px;
        cursor: pointer;
      }
    }
  }

  select {
    appearance: none;
    background-color: $background-tertiary;
    border: 1px solid $background-primary;
    color: white;
    cursor: pointer;
    border-radius: 5px;
    height: 24px;
    vertical-align: text-bottom;
    display: inline-block;

    option {
      font-weight: normal;
      color: $text-normal;
      background-color: $background-tertiary;
    }

    &:hover {
      border: 1px solid $background-primary;
    }
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue'

  export default defineComponent({
    name: 'neko-menu',
    computed: {
      admin() {
        return this.$accessor.user.admin
      },
    },
    methods: {
      about() {
        this.$accessor.client.toggleAbout()
      },
    },
  })
</script>
