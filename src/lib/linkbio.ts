// ============================================================================
// SHARED CONFIG for link-in-bio batch pages (/links hub, /kelas, /layanan)
// ONE-LINE SWAP PLACEHOLDERS — Daniel belum kasih final values.
// To go live: change the values here; all three pages pick them up.
// ----------------------------------------------------------------------------
// TODO(Daniel): nomor WhatsApp final (format internasional tanpa "+", mis "628xxxxxxxxxx")
export const WA_NUMBER = "628814802249"; // PLACEHOLDER — sementara nomor situs. Ganti kalau ada nomor khusus.

// TODO(Daniel): harga/jadwal kelas. null = tampil "japri untuk slot & biaya". String = tampil teks itu.
export const KELAS_HARGA_JADWAL: string | null = null; // PLACEHOLDER
// ============================================================================

export function waLink(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WA_KELAS = waLink("Halo, saya mau tanya soal kelas digital marketing Alpha");
export const WA_JASA = waLink("Halo, saya mau tanya soal jasa Alpha Digital");
