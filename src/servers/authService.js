import { supabase } from '../https/url'; // Verifique se o caminho do seu client está correto
let USER_KEY = '';

export const handler = async (user, pass) => {

    USER_KEY = user; // Armazena o nome de usuário para uso futuro, se necessário
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('username', user)
            .single();

        if (error || !data) return false;

        if (data.password_hash === pass) {

            localStorage.setItem(USER_KEY, JSON.stringify(data));

            return true;
        }

        return false;
    } catch (e) {
        console.error("Erro no serviço de auth:", e);
        return false;
    }
};

export function logout() {
    localStorage.clear();
}

export function isAuthenticated() {
    return !!localStorage.getItem(USER_KEY);
}