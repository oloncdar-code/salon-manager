import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppInput from '../AppInput.vue'

describe('AppInput', () => {
  it('renders input with label', () => {
    const wrapper = mount(AppInput, {
      props: { label: 'Name', modelValue: '' }
    })
    expect(wrapper.find('label').text()).toBe('Name')
  })

  it('binds modelValue and emits update:modelValue on input', async () => {
    const wrapper = mount(AppInput, {
      props: { modelValue: 'initial' }
    })
    const input = wrapper.find('input')
    await input.setValue('new value')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['new value'])
  })

  it('shows error message when error prop is provided', () => {
    const wrapper = mount(AppInput, {
        props: { error: 'This field is required' }
    })
    expect(wrapper.html()).toContain('This field is required')
  })

  it('applies placeholder', () => {
    const wrapper = mount(AppInput, {
      props: { placeholder: 'Enter text' }
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter text')
  })
})