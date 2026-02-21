import { supabase } from '../https/url'; // Verifique se o caminho do seu client está correto


export const handler = async (user, pass) => {
    // Armazena o nome de usuário para uso futuro, se necessário
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('username', user)
            .single();

        if (error || !data) return false;

        if (data.password_hash === pass) {

            localStorage.setItem('usuario_sessao', JSON.stringify(data));

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
    return !!localStorage.getItem('usuario_sessao');
}