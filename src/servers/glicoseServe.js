import { supabase } from '../https/url';



export async function obterRegistros() {
    try {
        const { data, error } = await supabase
            .from('glicose')
            .select('*')
            .order('data_horario', { ascending: false });

        if (error) {
            console.error("Erro Supabase:", error.message);
            return []; // Retorna array vazio em caso de erro
        }

        return data; // IMPORTANTE: Agora ele retorna a lista de registros
    } catch (error) {
        console.error("Erro ao obter registros:", error);
        return [];
    }
}

export async function salvarRegistro(form) {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_sessao'));

    // Monta a data no formato ISO que o Postgres aceita
    const dataHorarioIso = `${form.data}T${form.horario}:00`;

    const { status, error } = await supabase
        .from('glicose')
        .insert([
            {
                usuario_id: usuarioLogado.id,
                data_horario: dataHorarioIso,
                em_jejum: form.emJejum === 'sim',
                mg_dl: parseInt(form.mdDl),
                // Aqui pegamos o valor calculado que você passou no payload
                horas_jejum: form.horas_jejum
            }
        ]);

    if (error) throw error;
    return { status };
}
export async function deletarRegistro(id) {
    const { status, error } = await supabase
        .from('glicose')
        .delete()
        .eq('id', id); // Filtra pelo ID do registro

    if (error) {
        console.error("Erro ao deletar:", error.message);
        throw error;
    }

    return status;
}