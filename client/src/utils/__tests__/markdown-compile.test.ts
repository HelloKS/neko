import { describe, expect, it } from 'vitest'
import { compile } from 'vue'

// Scratch test: verify the runtime template strings produced by
// src/components/markdown.ts compile under Vue 3's runtime compiler.
// The component renders `h({ template: '<div>...html...</div>' })`.
describe('markdown runtime templates', () => {
  it('compiles plain text', () => {
    expect(() => compile(`<div>hello world</div>`)).not.toThrow()
  })

  it('compiles a message with an emoji (v-tooltip.top-center attribute)', () => {
    const html = `<div><span class="emoji" data-emoji="smile" v-tooltip.top-center="{ content:':smile:', offset: 2, delay: { show: 1000, hide: 100 } }"></span></div>`
    expect(() => compile(html)).not.toThrow()
  })

  it('compiles spoiler + code + image html', () => {
    const html = `<div><span class="spoiler"><span>secret</span></span> <pre><code>x</code></pre> <img src="data:image/jpeg;base64,AAAA"></div>`
    expect(() => compile(html)).not.toThrow()
  })
})
