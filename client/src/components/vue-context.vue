<template>
  <ul v-show="visible" :style="style" class="neko-vue-context">
    <slot :data="data"></slot>
  </ul>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'

  /**
   * Minimal replacement for the Vue 2 only `vue-context` component.
   * Imperative API: `this.$refs.context.open(event, data?)` opens the menu at
   * the mouse position; it closes on outside click, scroll, resize or Escape.
   */
  export default defineComponent({
    name: 'vue-context',
    data() {
      return {
        visible: false,
        x: 0,
        y: 0,
        data: undefined as any,
      }
    },
    computed: {
      style(): Record<string, string> {
        return {
          left: this.x + 'px',
          top: this.y + 'px',
        }
      },
    },
    methods: {
      open(event: MouseEvent, data?: any) {
        this.data = data
        this.x = event.clientX
        this.y = event.clientY
        this.visible = true

        // Flip the menu into the viewport when it would overflow the
        // bottom/right edge (e.g. the emote menu in the bottom control bar
        // opens upward instead of below the click point).
        this.$nextTick(() => {
          const rect = (this.$el as HTMLElement).getBoundingClientRect()
          if (rect.bottom > window.innerHeight) {
            this.y = Math.max(0, this.y - rect.height)
          }
          if (rect.right > window.innerWidth) {
            this.x = Math.max(0, this.x - rect.width)
          }
        })

        document.addEventListener('click', this.close)
        document.addEventListener('scroll', this.close, true)
        window.addEventListener('resize', this.close)
        window.addEventListener('keydown', this.onKey)
      },
      onKey(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          this.close()
        }
      },
      close() {
        this.visible = false
        document.removeEventListener('click', this.close)
        document.removeEventListener('scroll', this.close, true)
        window.removeEventListener('resize', this.close)
        window.removeEventListener('keydown', this.onKey)
      },
    },
    unmounted() {
      this.close()
    },
  })
</script>

<style lang="scss" scoped>
  .neko-vue-context {
    display: block;
    position: fixed;
    z-index: 1500;
    margin: 0;
    padding: 5px;
    min-width: 150px;
    list-style: none;
    box-sizing: border-box;
    max-height: calc(100% - 50px);
  }
</style>
