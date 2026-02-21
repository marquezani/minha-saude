import { supabase } from '../https/url';

export async function obterMedidas() {
    try {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario_sessao'));
        if (!usuarioLogado?.id) {
            console.error("Usuário não logado ou sem ID.");
            return [];
        }

        const { data, error } = await supabase
            .from('medidas_corporais')
            .select('*')
            .eq('usuario_id', usuarioLogado.id)
            .order('data', { ascending: false });

        if (error) {
            console.error("Erro Supabase ao obter medidas:", error.message);
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Erro ao obter medidas corporais:", error);
        return [];
    }
}

export async function salvarMedida(formMedida) {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_sessao'));
    if (!usuarioLogado?.id) {
        throw new Error("Usuário não autenticado.");
    }

    const { status, error } = await supabase
        .from('medidas_corporais')
        .insert([
            {
                usuario_id: usuarioLogado.id,
                data: formMedida.data,
                peso: parseFloat(formMedida.peso),
                circunferencia_abdominal: parseFloat(formMedida.circunferencia_abdominal),
            }
        ]);

    if (error) throw error;
    return { status };
}

export async function deletarMedida(id) {
    const { status, error } = await supabase
        .from('medidas_corporais')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Erro ao deletar medida:", error.message);
        throw error;
    }

    return status;
}