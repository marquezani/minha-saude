import { supabase } from '../https/url';



export async function obterRegistros() {
    try {
        const { data, error } = await supabase
            .from('glicose')
            .select('*')
            .order('data_horario', { ascending: false });

        if (error) {
            console.error("Erro Supabase:", error.message);
            return [];
        }

        return data;
    } catch (error) {
        console.error("Erro ao obter registros:", error);
        return [];
    }
}

export async function salvarRegistro(form) {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_sessao'));

    const dataHorarioIso = `${form.data}T${form.horario}:00`;

    const { status, error } = await supabase
        .from('glicose')
        .insert([
            {
                usuario_id: usuarioLogado.id,
                data_horario: dataHorarioIso,
                em_jejum: form.emJejum === 'sim',
                mg_dl: parseInt(form.mdDl),
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
        .eq('id', id);

    if (error) {
        console.error("Erro ao deletar:", error.message);
        throw error;
    }

    return status;
}