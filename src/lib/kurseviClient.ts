export async function fetchKursevi() {
  const res = await fetch('/api/kursevi', { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    throw new Error(err.error || 'Greška pri učitavanju kurseva.');
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Greška pri učitavanju kurseva.');
  return data;
}

export async function getKursSaLekcijama(id: string) {
  const res = await fetch(`/api/kursevi/${id}`, { method: 'GET' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    throw new Error(err.error || 'Greška pri učitavanju detalja kursa.');
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Greška pri učitavanju detalja kursa.');
  return data.kurs;
}

export async function obrisiKurs(id: string) {
  const res = await fetch(`/api/kursevi/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    return { success: false, error: err.error || 'Greška pri brisanju kursa.' };
  }
  const data = await res.json();
  return data;
}

export async function createKurs(payload: any) {
  const res = await fetch('/api/kursevi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    return { success: false, error: err.error || 'Greška pri kreiranju kursa.' };
  }
  return await res.json();
}

export async function updateKurs(id: string, payload: any) {
  const res = await fetch(`/api/kursevi/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    return { success: false, error: err.error || 'Greška pri izmeni kursa.' };
  }
  return await res.json();
}
