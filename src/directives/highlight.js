import { highlightSQL } from '@/utils/highlight';

export default {
  mounted(el, binding) {
    if (binding.value) {
      el.innerHTML = highlightSQL(binding.value);
    }
  },
  updated(el, binding) {
    if (binding.value) {
      el.innerHTML = highlightSQL(binding.value);
    }
  }
}