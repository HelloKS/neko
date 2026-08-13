import { defineStore } from 'pinia'
import { FileListItem, FileTransfer } from '~/neko/types'
import { EVENT } from '~/neko/events'
import { useRootStore } from './index'

export const useFilesStore = defineStore('files', {
  state: () => ({
    cwd: '',
    files: [] as FileListItem[],
    transfers: [] as FileTransfer[],
  }),

  getters: {
    //
  },

  actions: {
    _setCwd(cwd: string) {
      this.cwd = cwd
    },

    _setFileList(files: FileListItem[]) {
      this.files = files
    },

    _addTransfer(transfer: FileTransfer) {
      this.transfers = [...this.transfers, transfer]
    },

    _removeTransfer(transfer: FileTransfer) {
      this.transfers = this.transfers.filter((t) => t.id !== transfer.id)
    },

    setCwd(cwd: string) {
      this._setCwd(cwd)
    },

    setFileList(files: FileListItem[]) {
      this._setFileList(files)
    },

    addTransfer(transfer: FileTransfer) {
      if (transfer.status !== 'pending') {
        return
      }
      this._addTransfer(transfer)
    },

    removeTransfer(transfer: FileTransfer) {
      this._removeTransfer(transfer)
    },

    cancelAllTransfers() {
      for (const t of this.transfers) {
        if (t.status !== 'completed') {
          t.abortController?.abort()
        }
        this.removeTransfer(t)
      }
    },

    refresh() {
      if (!useRootStore().connected) {
        return
      }
      $client.sendMessage(EVENT.FILETRANSFER.REFRESH)
    },
  },
})
