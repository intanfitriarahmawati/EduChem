// script.js - logika kalkulasi, validasi, UI interactions, dan struk (receipt)

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('token-form');
  const meterInput = document.getElementById('meter');
  const nominalSelect = document.getElementById('nominal');
  const tariffInput = document.getElementById('tariff');
  const defaultTariffBtn = document.getElementById('use-default-tariff');

  const meterError = document.getElementById('meter-error');
  const nominalError = document.getElementById('nominal-error');

  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');

  const resultCard = document.getElementById('result-card');
  const outMeter = document.getElementById('out-meter');
  const outNominal = document.getElementById('out-nominal');
  const outAdmin = document.getElementById('out-admin');
  const outBase = document.getElementById('out-base');
  const outKwh = document.getElementById('out-kwh');
  const outTariff = document.getElementById('out-tariff');
  const outTotal = document.getElementById('out-total');

  const enableCompare = document.getElementById('enable-compare');
  const compareSection = document.getElementById('compare-section');
  const compareTableBody = document.getElementById('compare-table-body');

  const receiptCard = document.getElementById('receipt-card');
  const r_meter = document.getElementById('r_meter');
  const r_nominal = document.getElementById('r_nominal');
  const r_admin = document.getElementById('r_admin');
  const r_base = document.getElementById('r_base');
  const r_kwh = document.getElementById('r_kwh');
  const r_tariff = document.getElementById('r_tariff');
  const r_total = document.getElementById('r_total');
  const r_time = document.getElementById('r_time');
  const r_txid = document.getElementById('r_txid');
  const copyReceiptBtn = document.getElementById('copy-receipt');
  const printReceiptBtn = document.getElementById('print-receipt');

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  // Default tariff (example given in request)
  const DEFAULT_TARIFF = 1467.28;

  // Tariff map for bonus comparison (example/simulated values)
  const POWER_TARIFFS = {
    "450 VA": 1352.00,   // contoh ter-subsidi / simulasi
    "900 VA": 1467.28,
    "1300 VA": 1467.28,
    "2200 VA": 1699.53
  };

  // Utility: format currency to Indonesian Rupiah (no decimals)
  function formatRupiah(value) {
    if (isNaN(value)) return "Rp 0";
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  }

  // Utility: format number with 3 decimals for kWh
  function formatKwh(value) {
    return Number(value).toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' kWh';
  }

  // Apply default tariff button
  defaultTariffBtn.addEventListener('click', () => {
    tariffInput.value = DEFAULT_TARIFF;
  });

  // Theme toggle (persist to localStorage)
  function setTheme(isDark) {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      themeIcon.setAttribute('data-feather', 'sun');
    } else {
      html.classList.remove('dark');
      themeIcon.setAttribute('data-feather', 'moon');
    }
    lucide.createIcons();
  }

  // Initialize theme from storage or system preference
  const storedTheme = localStorage.getItem('pln_theme');
  if (storedTheme) {
    setTheme(storedTheme === 'dark');
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark);
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setTheme(isDark);
    localStorage.setItem('pln_theme', isDark ? 'dark' : 'light');
  });

  // Show result / receipt with animation helper
  function showResultAndReceipt() {
    // result
    resultCard.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
    resultCard.classList.add('opacity-100');
    // receipt
    receiptCard.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
    receiptCard.classList.add('opacity-100');
    lucide.createIcons();
  }

  function hideResultAndReceipt() {
    resultCard.classList.add('opacity-0');
    resultCard.classList.remove('opacity-100');
    receiptCard.classList.add('opacity-0');
    receiptCard.classList.remove('opacity-100');
  }

  // Validation
  function validate() {
    let ok = true;
    meterError.classList.add('hidden');
    nominalError.classList.add('hidden');

    if (!meterInput.value.trim()) {
      meterError.textContent = 'Nomor meteran tidak boleh kosong.';
      meterError.classList.remove('hidden');
      ok = false;
    }

    if (!nominalSelect.value) {
      nominalError.textContent = 'Silakan pilih nominal pembelian.';
      nominalError.classList.remove('hidden');
      ok = false;
    }

    return ok;
  }

  // Helper: generate TX id
  function generateTxId() {
    const rnd = Math.floor(Math.random() * 9000) + 1000; // 4 digit
    return 'TX' + Date.now().toString().slice(-8) + rnd.toString();
  }

  // Form submit (hitung)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) {
      hideResultAndReceipt();
      return;
    }

    const meter = meterInput.value.trim();
    const nominal = Number(nominalSelect.value);
    const tariff = Number(tariffInput.value) || DEFAULT_TARIFF;

    // Perhitungan sesuai spesifikasi
    // Harga dasar token (setelah potongan 6%) = nominal * 0.94
    const basePrice = nominal * 0.94;
    // Biaya admin = nominal * 0.06
    const adminFee = nominal * 0.06;
    // Daya (kWh) = harga dasar ÷ tarif per kWh
    const kwh = basePrice / tariff;
    // Total dibayar — di sini sama dengan nominal input (nominal sudah mencakup admin)
    const totalPaid = nominal;

    // Output (summary)
    outMeter.textContent = meter;
    outNominal.textContent = formatRupiah(nominal);
    outAdmin.textContent = formatRupiah(adminFee);
    outBase.textContent = formatRupiah(basePrice);
    outTariff.textContent = tariff.toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' / kWh';
    outKwh.textContent = formatKwh(kwh);
    outTotal.textContent = formatRupiah(totalPaid);

    // Populate receipt (struk)
    r_meter.textContent = meter;
    r_nominal.textContent = formatRupiah(nominal);
    r_admin.textContent = formatRupiah(adminFee);
    r_base.textContent = formatRupiah(basePrice);
    r_tariff.textContent = tariff.toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' / kWh';
    r_kwh.textContent = formatKwh(kwh);
    r_total.textContent = formatRupiah(totalPaid);
    r_time.textContent = new Date().toLocaleString('id-ID');
    r_txid.textContent = generateTxId();

    // Show result and receipt panel
    showResultAndReceipt();

    // If comparison checkbox enabled, populate table
    if (enableCompare.checked) {
      compareSection.classList.remove('hidden');
      compareTableBody.innerHTML = '';
      Object.entries(POWER_TARIFFS).forEach(([power, t]) => {
        const kwhSim = basePrice / t;
        const tr = document.createElement('tr');
        tr.className = 'odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-800';
        tr.innerHTML = `
          <td class="px-3 py-2">${power}</td>
          <td class="px-3 py-2">${t.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</td>
          <td class="px-3 py-2 font-medium">${formatKwh(kwhSim)}</td>
        `;
        compareTableBody.appendChild(tr);
      });
    } else {
      compareSection.classList.add('hidden');
    }
  });

  // Reset handler
  resetBtn.addEventListener('click', () => {
    form.reset();
    meterError.classList.add('hidden');
    nominalError.classList.add('hidden');
    hideResultAndReceipt();
    // restore default tariff input
    tariffInput.value = DEFAULT_TARIFF;
  });

  // Toggle compare section live when checkbox changes (if results already shown, recompute)
  enableCompare.addEventListener('change', () => {
    if (resultCard.classList.contains('opacity-100')) {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(event);
    }
  });

  // Copy receipt to clipboard (text)
  copyReceiptBtn.addEventListener('click', async () => {
    const parts = [
      'STRUK TOKEN PLN',
      '--------------------------',
      `Nomor Meteran: ${r_meter.textContent || '-'}`,
      `Nominal: ${r_nominal.textContent || '-'}`,
      `Biaya Admin: ${r_admin.textContent || '-'}`,
      `Harga Dasar: ${r_base.textContent || '-'}`,
      `Tarif: ${r_tariff.textContent || '-'}`,
      `Daya (kWh): ${r_kwh.textContent || '-'}`,
      `Total Dibayar: ${r_total.textContent || '-'}`,
      '--------------------------',
      `Waktu: ${r_time.textContent || '-'}`,
      `ID: ${r_txid.textContent || '-'}`,
      '',
      'Terima kasih — PLN'
    ];
    const text = parts.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      copyReceiptBtn.setAttribute('aria-label', 'Struk disalin');
      // small visual feedback
      copyReceiptBtn.classList.add('opacity-70');
      setTimeout(() => copyReceiptBtn.classList.remove('opacity-70'), 800);
    } catch (err) {
      alert('Gagal menyalin struk ke clipboard.');
      console.error(err);
    }
  });

  // Print receipt - open new window with receipt content and print
  printReceiptBtn.addEventListener('click', () => {
    const receiptHTML = document.querySelector('.receipt').outerHTML;
    const win = window.open('', '_blank', 'width=600,height=800');
    if (!win) {
      alert('Pop-up terblokir. Izinkan pop-up untuk mencetak struk.');
      return;
    }
    // Minimal inline styles for print
    win.document.write(`
      <html>
        <head>
          <title>Struk Token PLN</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding: 16px; color: #111; }
            .receipt { max-width: 420px; margin: 0 auto; }
            .receipt hr { border-style: dashed; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          ${receiptHTML}
          <script>
            window.onload = function() { setTimeout(()=>{ window.print(); window.close(); }, 300); };
          <\/script>
        </body>
      </html>
    `);
    win.document.close();
  });

  // Small polish: hide result on initial load
  hideResultAndReceipt();

  // Ensure lucide icons render (for dynamic icons)
  lucide.createIcons();
});