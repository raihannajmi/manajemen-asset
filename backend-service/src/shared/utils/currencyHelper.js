/**
 * currencyHelper.js
 * Utilitas konversi mata uang untuk Rupiah Indonesia.
 * Diadopsi dan diperluas dari sistem referensi (manajemen-asset-dosen).
 */

const SATUAN = [
  '', 'satu', 'dua', 'tiga', 'empat', 'lima',
  'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'
];

/**
 * Membaca angka menjadi kata-kata dalam Bahasa Indonesia.
 * @param {number} num
 * @returns {string}
 */
function readNumber(num) {
  if (num < 12) return SATUAN[num];
  if (num < 20) return `${readNumber(num - 10)} belas`;
  if (num < 100) {
    const tens = Math.floor(num / 10);
    const remainder = num % 10;
    return `${readNumber(tens)} puluh${remainder ? ' ' + readNumber(remainder) : ''}`;
  }
  if (num < 200) return `seratus${num > 100 ? ' ' + readNumber(num - 100) : ''}`;
  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    return `${readNumber(hundreds)} ratus${remainder ? ' ' + readNumber(remainder) : ''}`;
  }
  if (num < 2000) return `seribu${num > 1000 ? ' ' + readNumber(num - 1000) : ''}`;
  if (num < 1_000_000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    return `${readNumber(thousands)} ribu${remainder ? ' ' + readNumber(remainder) : ''}`;
  }
  if (num < 1_000_000_000) {
    const millions = Math.floor(num / 1_000_000);
    const remainder = num % 1_000_000;
    return `${readNumber(millions)} juta${remainder ? ' ' + readNumber(remainder) : ''}`;
  }
  if (num < 1_000_000_000_000) {
    const billions = Math.floor(num / 1_000_000_000);
    const remainder = num % 1_000_000_000;
    return `${readNumber(billions)} miliar${remainder ? ' ' + readNumber(remainder) : ''}`;
  }
  const trillions = Math.floor(num / 1_000_000_000_000);
  const remainder = num % 1_000_000_000_000;
  return `${readNumber(trillions)} triliun${remainder ? ' ' + readNumber(remainder) : ''}`;
}

/**
 * Mengkonversi angka nominal ke kalimat Rupiah dalam Bahasa Indonesia.
 * Contoh: 12500000 → "dua belas juta lima ratus ribu rupiah"
 * @param {number|string} value
 * @returns {string}
 */
function terbilangRupiah(value) {
  const num = Math.floor(Math.abs(Number(value) || 0));
  if (num === 0) return 'nol rupiah';
  const prefix = Number(value) < 0 ? 'minus ' : '';
  return `${prefix}${readNumber(num)} rupiah`;
}

/**
 * Memformat angka ke format mata uang Rupiah Indonesia.
 * Contoh: 12500000 → "Rp 12.500.000"
 * @param {number|string} value
 * @returns {string}
 */
function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

/**
 * Memformat angka ke string angka dengan titik pemisah ribuan.
 * Contoh: 12500000 → "12.500.000"
 * @param {number|string} value
 * @returns {string}
 */
function formatNumber(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

module.exports = { terbilangRupiah, formatRupiah, formatNumber };
