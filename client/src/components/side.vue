<template>
  <aside class="neko-menu">
    <div class="tabs-container">
      <ul>
        <li :class="{ active: tab === 'chat' }" @click.stop.prevent="change('chat')">
          <i class="fas fa-comment-alt" />
        </li>
        <li :class="{ active: tab === 'members' }" @click.stop.prevent="change('members')">
          <i class="fas fa-user" />
          <span>{{'(' + membersCount + ')'}}</span>
        </li>
        <li v-if="filetransferAllowed" :class="{ active: tab === 'files' }" @click.stop.prevent="change('files')">
          <i class="fas fa-file" />
        </li>
        <li :class="{ active: tab === 'settings' }" @click.stop.prevent="change('settings')">
          <i class="fas fa-sliders-h" />
        </li>
      </ul>
    </div>
    <div class="page-container">
      <neko-chat v-if="tab === 'chat'" />
      <neko-files v-if="tab === 'files'" />
      <neko-settings v-if="tab === 'settings'" />
      <neko-members v-if="tab === 'members'" />
    </div>
  </aside>
</template>

<style lang="scss">
  .neko-menu {
    width: $side-width;
    background-color: $background-primary;
    flex-shrink: 0;
    max-height: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: column;

    .tabs-container {
      background: $background-tertiary;
      height: fit-content;
      max-height: 100%;
      max-width: 100%;
      display: flex;
      flex-shrink: 0;

      ul {
        display: inline-block;
        padding: 0.5rem 0 0 0;

        li {
          background: $background-secondary;
          border-radius: 3px 3px 0 0;
          border-bottom: none;
          display: inline-block;
          padding: 5px 10px;
          margin-right: 4px;
          font-weight: 600;
          cursor: pointer;

          i {
            font-size: 1.3rem;
          }

          span {
            margin-left: 4px;
          }

          &.active {
            background: $background-primary;
          }
        }
      }
    }

    .page-container {
      max-height: 100%;
      flex-grow: 1;
      display: flex;
      overflow: auto;
      padding-top: 5px;
    }
  }
</style>

<script lang="ts">
  import { defineComponent } from 'vue'

  import Settings from '~/components/settings.vue'
  import Chat from '~/components/chat.vue'
  import Files from '~/components/files.vue'
  import Members from '~/components/members.vue'

  export default defineComponent({
    name: 'neko',
    components: {
      'neko-settings': Settings,
      'neko-chat': Chat,
      'neko-files': Files,
      'neko-members': Members,
    },
    computed: {
      filetransferAllowed() {
        return (
          this.$accessor.remote.fileTransfer &&
          (this.$accessor.user.admin || !this.$accessor.isLocked('file_transfer'))
        )
      },
      tab() {
        return this.$accessor.client.tab
      },
      membersCount() {
        var members = this.$accessor.user.members
        var curMembers = 0

        Object.keys(members).forEach(function (key) {
          if (members[key].connected) {
            curMembers++
          }
        })

        return curMembers
      },
    },
    watch: {
      tab: {
        immediate: true,
        handler() {
          this.onTabChange()
        },
      },
      filetransferAllowed: {
        immediate: true,
        handler() {
          this.onTabChange()
        },
      },
    },
    methods: {
      onTabChange() {
        // do not show the files tab if file transfer is disabled
        if (this.tab === 'files' && !this.filetransferAllowed) {
          this.change('chat')
        }
      },
      onFileTransferAllowedChange() {
        if (this.filetransferAllowed) {
          this.$accessor.files.refresh()
        }
      },
      change(tab: string) {
        this.$accessor.client.setTab(tab)
      },
    },
  })
</script>
