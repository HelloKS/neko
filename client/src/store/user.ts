import { defineStore } from 'pinia'
import { Member } from '~/neko/types'
import { EVENT } from '~/neko/events'

import md from 'simple-markdown'
import { useRootStore } from './index'

interface Members {
  [id: string]: Member
}

export const useUserStore = defineStore('user', {
  state: () => ({
    id: '',
    members: {} as Members,
  }),

  getters: {
    member: (state) => state.members[state.id] || null,
    admin: (state) => (state.members[state.id] ? state.members[state.id].admin : false),
    muted: (state) => (state.members[state.id] ? state.members[state.id].muted : false),
  },

  actions: {
    setIgnored({ id, ignored }: { id: string; ignored: boolean }) {
      this.members[id] = {
        ...this.members[id],
        ignored,
      }
    },
    setMuted({ id, muted }: { id: string; muted: boolean }) {
      this.members[id] = {
        ...this.members[id],
        muted,
      }
    },
    setMembers(members: Member[]) {
      const data: Members = {}
      for (const member of members) {
        data[member.id] = {
          connected: true,
          ...member,
          displayname: md.sanitizeText(member.displayname),
        }
      }
      this.members = data
    },
    setMember(id: string) {
      this.id = id
    },
    addMember(member: Member) {
      this.members = {
        ...this.members,
        [member.id]: {
          connected: true,
          ...member,
          displayname: md.sanitizeText(member.displayname),
        },
      }
    },
    delMember(id: string) {
      this.members[id] = {
        ...this.members[id],
        connected: false,
      }
    },
    reset() {
      this.members = {}
    },

    ban(member: string | Member) {
      if (!useRootStore().connected || !this.admin) {
        return
      }

      if (typeof member === 'string') {
        member = this.members[member]
      }

      if (!member) {
        return
      }

      $client.sendMessage(EVENT.ADMIN.BAN, { id: member.id })
    },

    kick(member: string | Member) {
      if (!useRootStore().connected || !this.admin) {
        return
      }

      if (typeof member === 'string') {
        member = this.members[member]
      }

      if (!member) {
        return
      }

      $client.sendMessage(EVENT.ADMIN.KICK, { id: member.id })
    },

    mute(member: string | Member) {
      if (!useRootStore().connected || !this.admin) {
        return
      }

      if (typeof member === 'string') {
        member = this.members[member]
      }

      if (!member) {
        return
      }

      $client.sendMessage(EVENT.ADMIN.MUTE, { id: member.id })
    },

    unmute(member: string | Member) {
      if (!useRootStore().connected || !this.admin) {
        return
      }

      if (typeof member === 'string') {
        member = this.members[member]
      }

      if (!member) {
        return
      }

      $client.sendMessage(EVENT.ADMIN.UNMUTE, { id: member.id })
    },
  },
})
