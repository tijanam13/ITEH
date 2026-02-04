export async function fetchMesecniIzvestaji() {
  const res = await fetch('/api/izvestaji', { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    throw new Error(err.error || 'Greška pri učitavanju izveštaja.');
  }
  return await res.json();
}

export async function fetchStatistikaProdaje() {
  const res = await fetch('/api/statistika-prodaje', { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    throw new Error(err.error || 'Greška pri učitavanju statistike prodaje.');
  }
  return await res.json();
}
