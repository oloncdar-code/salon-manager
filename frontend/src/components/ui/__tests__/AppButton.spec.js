import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from '../AppButton.vue'

describe('AppButton', () => {
  it('renders button with default variant', () => {
    const wrapper = mount(AppButton, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('bg-blue-600')
  })

  it('applies primary variant correctly', () => {
    const wrapper = mount(AppButton, {
      props: { variant: 'primary' },
      slots: { default: 'Primary' }
    })
    expect(wrapper.classes()).toContain('bg-blue-600')
  })

  it('applies secondary variant correctly', () => {
    const wrapper = mount(AppButton, {
      props: { variant: 'secondary' },
      slots: { default: 'Secondary' }
    })
    expect(wrapper.classes()).toContain('bg-gray-200')
  })

  it('applies danger variant correctly', () => {
    const wrapper = mount(AppButton, {
      props: { variant: 'danger' },
      slots: { default: 'Danger' }
    })
    expect(wrapper.classes()).toContain('bg-red-600')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(AppButton, {
      slots: { default: 'Click' }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(AppButton, {
      props: { disabled: true },
      slots: { default: 'Disabled' }
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})