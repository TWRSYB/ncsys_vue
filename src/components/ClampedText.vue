<template>
    <div>
        <div ref="textElement" class="clamped-text">
            {{ dynamicText }}
            <el-tooltip v-if="showEllipsis" placement="bottom" effect="light" popper-class="tooltip" :show-after="50">
                <!-- 省略号提示区域 -->
                <div class="ellipsis-trigger"></div>
                <template #content>
                    <div class="tooltip-content">
                        {{ dynamicText }}
                    </div>
                </template>
            </el-tooltip>
        </div>
    </div>
</template>

<script setup>

const props = defineProps({
    text: String // 动态文本
});

const dynamicText = ref(props.text || '');
const textElement = ref(null);
const showEllipsis = ref(false);

// 检测文本是否溢出
const checkTextOverflow = () => {
    nextTick(() => {

        if (!textElement.value) return;

        const lineHeight = parseFloat(
            getComputedStyle(textElement.value).lineHeight
        );
        const maxHeight = lineHeight * 2; // 两行高度

        showEllipsis.value = textElement.value.scrollHeight > maxHeight;
    });
};

// 监听文本变化
watch(() => props.text, (newText) => {
    dynamicText.value = newText;
    checkTextOverflow();
});

onMounted(checkTextOverflow);
</script>

<style lang="scss" scoped>

.clamped-text {
    line-height: 1.5;
    /* 必须设置行高 */
    position: relative;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    /* 限制两行 */
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
}



.ellipsis-trigger {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 1em;
    /* 省略号区域宽度 */
    height: 1.5em;
    /* 与行高一致 */
    cursor: pointer;
    z-index: 10;
}

.tooltip {
    .tooltip-content {
        max-width: 300px;
    } 
}
</style>