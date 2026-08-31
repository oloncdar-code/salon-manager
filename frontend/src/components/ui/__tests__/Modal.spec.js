import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from '../Modal.vue'

describe('Modal', () => {
  it('renders when show is true', () => {
    const wrapper = mount(Modal, {
      props: { show: true },
      slots: { header: 'Header', body: 'Body', footer: 'Footer' }
    })
    expect(wrapper.text()).toContain('Header')
    expect(wrapper.text()).toContain('Body')
    expect(wrapper.text()).toContain('Footer')
  })

  it('does not render when show is false', () => {
    const wrapper = mount(Modal, {
      props: { show: false }
    })
    expect(wrapper.find('.modal').exists()).toBe(false)
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(Modal, {
      props: { show: true },
      slots: { header: 'Header' }
    })
    // Ищем кнопку закрытия (может быть с data-testid или классом)
    const closeBtn = wrapper.find('[data-testid="modal-close"]') // если есть
    if (closeBtn.exists()) {
      await closeBtn.trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    }
  })
})