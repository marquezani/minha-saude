import { notificationStore } from '@/components/notificationStore.js';

export function useNotification() {
    const exibirMensagem = (texto, tipo = 'success') => {
        notificationStore.mensagem = texto;
        notificationStore.tipo = tipo;
        notificationStore.visivel = true;

        // Esconde a notificação após 3 segundos
        setTimeout(() => {
            notificationStore.visivel = false;
        }, 3000);
    };

    return { exibirMensagem };
}