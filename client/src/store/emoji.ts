import { defineStore } from 'pinia'
import { get, set } from '~/utils/localstorage'
import emojiJson from '~/assets/emoji.json'

interface Group {
  name: string
  id: string
  list: string[]
}

interface Keywords {
  [name: string]: string[]
}

export const useEmojiStore = defineStore('emoji', {
  state: () => ({
    groups: [
      {
        id: 'recent',
        name: 'Recent',
        list: JSON.parse(get('emoji_recent', '[]')) as string[],
      },
    ] as Group[],
    keywords: {} as Keywords,
    list: [] as string[],
  }),

  getters: {},

  actions: {
    setRecent(emoji: string) {
      if (!this.groups[0].list.includes(emoji)) {
        if (this.groups[0].list.length > 30) {
          this.groups[0].list.shift()
        }
        this.groups[0].list.push(emoji)
        set('emoji_recent', JSON.stringify(this.groups[0].list))
      }
    },
    addGroup(group: Group) {
      this.groups.push(group)
    },
    setKeywords(keywords: Keywords) {
      this.keywords = keywords
    },
    setList(list: string[]) {
      this.list = list
    },
    async initialise() {
      for (const group of emojiJson.groups) {
        this.addGroup(group)
      }
      this.setList(emojiJson.list)
      this.setKeywords(emojiJson.keywords)
    },
  },
})
