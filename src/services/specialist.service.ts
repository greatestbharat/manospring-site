import { apiFetch } from './api';
import { Specialist } from '../types';

export const specialistService = {
  async getSpecialists(filters?: { specialty?: string; mode?: string; search?: string }): Promise<Specialist[]> {
    const params = new URLSearchParams();
    if (filters?.specialty && filters.specialty !== 'all') params.set('specialty', filters.specialty);
    if (filters?.mode && filters.mode !== 'all') params.set('mode', filters.mode);
    if (filters?.search) params.set('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch<{ ok: boolean; specialists: Specialist[] }>(`/specialists${query}`);
    return res.specialists || [];
  },

  async getById(id: string): Promise<Specialist> {
    const res = await apiFetch<{ ok: boolean; specialist: Specialist }>(`/specialists/${id}`);
    return res.specialist;
  }
};
