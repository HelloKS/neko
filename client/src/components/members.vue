<template>
  <div class="members">
    <div class="members-container">
      <ul class="members-list">
        <li v-if="member" class="member-row">
          <div :class="[{ host: member.id === host }, 'self', 'member']">
            <neko-avatar class="avatar" :seed="member.displayname" :size="40" />
          </div>
          <span class="name">{{ member.displayname }}</span>
        </li>
        <template v-for="(member, index) in members" :key="index">
          <li
            v-if="member.id !== id && member.connected"
            class="member-row"
            @contextmenu.stop.prevent="onContext($event, { member })"
          >
            <div :class="[{ host: member.id === host, admin: member.admin }, 'member']">
              <neko-avatar class="avatar" :seed="member.displayname" :size="40" />
            </div>
            <span class="name">{{ member.displayname }}</span>
          </li>
        </template>
      </ul>
    </div>
    <neko-context ref="context" />
  </div>
</template>

<style lang="scss" scoped>
  .members {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 14px;
    scrollbar-width: thin;
    scrollbar-color: $background-secondary $background-tertiary;
    min-height: 60px;
    display: flex;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background-color: $background-tertiary;
    }

    &::-webkit-scrollbar-thumb {
      background-color: $background-secondary;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: $background-primary;
    }

    .members-container {
      flex: 1;
      padding: 10px;
      overflow: hidden;

      .members-list {
        display: flex;
        flex-direction: column;

        .member-row {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          border-radius: 4px;
          user-select: none;

          &:hover {
            background: $background-modifier-hover;
          }

          .member {
            position: relative;
            width: 40px;
            height: 40px;
            flex-shrink: 0;

            &.self {
              &::before {
                font-family: 'Font Awesome 6 Free';
                font-weight: 900;
                content: '\f2bd';
                background: $background-floating;
                color: $style-primary;
                position: absolute;
                width: 15px;
                height: 15px;
                line-height: 15px;
                font-size: 20px;
                text-align: center;
                margin-top: -2px;
                margin-left: 30px;
                border-radius: 50%;
              }
            }

            &.admin {
              &::before {
                display: block;
                font-family: 'Font Awesome 6 Free';
                font-weight: 900;
                content: '\f3ed';
                color: $style-primary;
                background: transparent;
                position: absolute;
                width: 14px;
                height: 14px;
                font-size: 14px;
                text-align: center;
                margin-top: -2px;
                margin-left: 34px;
              }
            }

            &.host::after {
              display: block;
              font-family: 'Font Awesome 6 Free';
              font-weight: 900;
              content: '\f521';
              background: $style-primary;
              color: $background-floating;
              position: absolute;
              width: 20px;
              height: 20px;
              line-height: 20px;
              font-size: 10px;
              text-align: center;
              margin-top: 32px;
              margin-left: -16px;
              border-radius: 50%;
            }

            .avatar {
              border-radius: 50%;
              overflow: hidden;
              width: 100%;
              height: 100%;
            }
          }

          .name {
            margin-left: 12px;
            color: $text-normal;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue'

  import Content from './context.vue'
  import Avatar from './avatar.vue'

  export default defineComponent({
    name: 'neko-members',
    components: {
      'neko-context': Content,
      'neko-avatar': Avatar,
    },
    computed: {
      _context() {
        return this.$refs.context as any
      },
      id() {
        return this.$accessor.user.id
      },
      host() {
        return this.$accessor.remote.id
      },
      member() {
        return this.$accessor.user.member
      },
      members() {
        return this.$accessor.user.members
      },
    },
    methods: {
      onContext(event: MouseEvent, data: any) {
        this._context.open(event, data)
      },
    },
  })
</script>
