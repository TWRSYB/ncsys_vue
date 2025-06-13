import { defineStore } from "pinia";
export const useUserInfoStore = defineStore("userInfo", () => {
    const info = ref({});

    function setInfo(newInfo) {
        info.value = newInfo;
    }

    function removeInfo() {
        info.value = {};
    }

    return { info, setInfo, removeInfo };
}, { persist: true });