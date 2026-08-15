import type { Directive, DirectiveBinding } from 'vue'

/**
 * Replacement for the Vue 2 only `vue-clickaway` directive.
 * Calls the bound handler when a click occurs outside the element.
 */
export const onClickaway: Directive<HTMLElement, (event: Event) => void> = {
  mounted(el, binding: DirectiveBinding<(event: Event) => void>) {
    const handler = (event: Event) => {
      const target = event.target as Node
      // mirror vue-clickaway: only treat real in-document clicks as outside
      // clicks (ignores clicks on the document root itself / detached nodes)
      if (document.documentElement.contains(target) && !el.contains(target)) {
        binding.value(event)
      }
    }
    ;(el as HTMLElement & { _clickaway?: (event: Event) => void })._clickaway = handler
    document.addEventListener('click', handler)
  },
  unmounted(el) {
    const handler = (el as HTMLElement & { _clickaway?: (event: Event) => void })._clickaway
    if (handler) {
      document.removeEventListener('click', handler)
    }
  },
}
