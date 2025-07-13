export default {
    mounted(el, binding) {
        el.clickOutsideEvent = function (event) {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        // 绑定事件监听器
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        // 移除事件监听器
        document.removeEventListener('click', el.clickOutsideEvent);
    },
}