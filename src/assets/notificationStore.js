import { reactive } from 'vue';

export const notificationStore = reactive({
    visivel: false,
    mensagem: '',
    tipo: 'success',
});