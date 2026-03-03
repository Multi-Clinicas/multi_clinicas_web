import api from './api';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface ClinicaDTO {
    id: number;
    nomeFantasia: string;
    subdominio: string;
    ativo: boolean;
    createdAt: string;
}

export interface ClinicaCreateDTO {
    nomeFantasia: string;
    subdominio: string;
    ativo: boolean;
    adminNome?: string;
    adminEmail?: string;
    adminSenha?: string;
}

export interface ClinicaUpdateDTO {
    nomeFantasia: string;
    subdominio: string;
    ativo: boolean;
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function fetchClinicas(): Promise<ClinicaDTO[]> {
    const response = await api.get<ClinicaDTO[]>('/clinicas');
    return response.data;
}

export async function createClinica(data: ClinicaCreateDTO): Promise<ClinicaDTO> {
    const response = await api.post<ClinicaDTO>('/clinicas', data);
    return response.data;
}

export async function updateClinica(id: number, data: ClinicaUpdateDTO): Promise<ClinicaDTO> {
    const response = await api.put<ClinicaDTO>(`/clinicas/${id}`, data);
    return response.data;
}

export async function deleteClinica(id: number): Promise<void> {
    await api.delete(`/clinicas/${id}`);
}
