import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'

config.global.plugins = [createPinia()]

config.global.stubs = {
  RouterLink: {
    template: '<a><slot /></a>',
  },
  RouterView: {
    template: '<div><slot /></div>',
  },
}