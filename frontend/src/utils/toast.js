import { useToast } from 'vue-toastification'

export const toast = useToast()

export const showToast = {
  success(message) {
    toast.success(message)
  },
  error(message) {
    toast.error(message)
  },
  warning(message) {
    toast.warning(message)
  },
  info(message) {
    toast.info(message)
  },
}