import { ref, onMounted, onUnmounted } from 'vue';
import { menuController } from '@ionic/vue';

export const isMobile = ref(window.innerWidth < 992);

export const checkScreenSize = () => {
    isMobile.value = window.innerWidth < 992;
};

export const openSidebar = async () => {
    await menuController.open('sidebar-menu');
};

export const closeSidebar = async () => {
    await menuController.close('sidebar-menu');
};

export const useScreenSizeWatcher = () => {
    onMounted(() => {
        window.addEventListener('resize', checkScreenSize);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', checkScreenSize);
    });
};