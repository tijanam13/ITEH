export async function fetchEdukatorKlijenti() {
  const res = await fetch('/api/edukator/klijenti', { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    throw new Error(err.error || 'Greška pri učitavanju klijenata.');
  }
  return await res.json();
}

export async function fetchEdukatorProdaja() {
  const res = await fetch('/api/edukator/prodaja', { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    throw new Error(err.error || 'Greška pri učitavanju prodaje.');
  }
  return await res.json();
}
