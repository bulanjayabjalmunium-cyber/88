// ========================================
// SMART TOKO - ALUMINIUM EDITION SYSTEM
// ========================================

// Data awal produk bertema aluminium & kaca
let defaultBarang = [
    { kode: "ALM-01", nama: "Kusen Aluminium 4 Inch YKK", harga: 145000, stok: 35 },
    { kode: "ALM-02", nama: "Pintu Aluminium Spandrel Lengkap", harga: 850000, stok: 12 },
    { kode: "ALM-03", nama: "Jendela Casement Aluminium Putih", harga: 320000, stok: 20 },
    { kode: "ALM-04", nama: "Etalase Kaca Aluminium 3 Susun", harga: 1250000, stok: 8 },
    { kode: "ALM-05", nama: "Kaca Polos 5mm (Per Meter)", harga: 95000, stok: 50 },
    { kode: "ALM-06", nama: "Silikon Sealant Kaca / Aluminium", harga: 38000, stok: 60 },
    { kode: "ALM-07", nama: "Roda Pintu Geser Aluminium", harga: 45000, stok: 40 },
    { kode: "ALM-08", nama: "Handle Pintu Aluminium Minimalis", harga: 75000, stok: 25 }
];

let barang = JSON.parse(localStorage.getItem("smart_toko_barang_alm")) || defaultBarang;
let riwayatTransaksi = JSON.parse(localStorage.getItem("smart_toko_riwayat_alm")) || [];
let totalPenjualan = Number(localStorage.getItem("smart_toko_pendapatan_alm")) || 0;

let keranjang = [];

// ========================================
// SISTEM LOGIN KEAMANAN
// ========================================

function prosesLogin() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").trim();

    // Username default: admin, Password: 123 (Bisa Anda ganti di sini)
    if (user === "admin" && pass === "123") {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("appContainer").style.display = "flex";
        
        updateDashboard();
        tampilkanBarang();
        tampilkanProdukKasir();
        tampilkanRiwayat();
    } else {
        alert("Akses Ditolak! Username atau Password salah.");
    }
}

function logout() {
    if (confirm("Apakah Anda ingin keluar dari sistem?")) {
        document.getElementById("loginPage").style.display = "flex";
        document.getElementById("appContainer").style.display = "none";
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
    }
}

function simpanData() {
    localStorage.setItem("smart_toko_barang_alm", JSON.stringify(barang));
    localStorage.setItem("smart_toko_riwayat_alm", JSON.stringify(riwayatTransaksi));
    localStorage.setItem("smart_toko_pendapatan_alm", totalPenjualan);
}

// ========================================
// NAVIGASI MENU
// ========================================

function showPage(page) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(item => item.classList.remove("active"));

    document.getElementById(page).classList.add("active");

    if (page === "dashboard") updateDashboard();
    if (page === "barang") tampilkanBarang();
    if (page === "kasir") {
        tampilkanProdukKasir();
        tampilkanKeranjang();
    }
    if (page === "riwayat") tampilkanRiwayat();
}

// ========================================
// FORMAT RUPIAH
// ========================================

function rupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(angka);
}

// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {
    document.getElementById("totalBarang").innerText = barang.length;

    let stok = 0;
    barang.forEach(item => stok += Number(item.stok));
    document.getElementById("totalStok").innerText = stok;

    document.getElementById("totalPenjualan").innerText = rupiah(totalPenjualan);
}

// ========================================
// TAMBAH BARANG
// ========================================

function tambahBarang() {
    const kode = document.getElementById("kodeBarang").value.trim();
    const nama = document.getElementById("namaBarang").value.trim();
    const harga = Number(document.getElementById("hargaBarang").value);
    const stok = Number(document.getElementById("stokBarang").value);

    if (!kode || !nama || harga <= 0 || stok < 0) {
        alert("Mohon lengkapi seluruh formulir data barang dengan benar.");
        return;
    }

    const sudahAda = barang.some(item => item.kode.toLowerCase() === kode.toLowerCase());
    if (sudahAda) {
        alert("Kode barang / SKU tersebut sudah terdaftar.");
        return;
    }

    barang.push({ kode, nama, harga, stok });
    simpanData();

    alert("Data barang aluminium berhasil disimpan!");

    document.getElementById("kodeBarang").value = "";
    document.getElementById("namaBarang").value = "";
    document.getElementById("hargaBarang").value = "";
    document.getElementById("stokBarang").value = "";

    showPage("barang");
}

// ========================================
// TAMPIL DATA BARANG
// ========================================

function tampilkanBarang() {
    const tabel = document.getElementById("tabelBarang");
    tabel.innerHTML = "";

    if (barang.length === 0) {
        tabel.innerHTML = `<tr><td colspan="6" style="text-align:center">Belum ada inventaris barang</td></tr>`;
        return;
    }

    barang.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${item.kode}</strong></td>
            <td>${item.nama}</td>
            <td>${rupiah(item.harga)}</td>
            <td>${item.stok} unit</td>
            <td>
                <button class="btn-delete" onclick="hapusBarang(${index})">Hapus</button>
            </td>
        `;
        tabel.appendChild(row);
    });
}

function hapusBarang(index) {
    const nama = barang[index].nama;
    if (!confirm("Hapus produk " + nama + " dari sistem?")) return;

    barang.splice(index, 1);
    simpanData();

    tampilkanBarang();
    tampilkanProdukKasir();
    updateDashboard();
}

// ========================================
// KASIR & KERANJANG
// ========================================

function tampilkanProdukKasir() {
    const container = document.getElementById("produkKasir");
    container.innerHTML = "";

    if (barang.length === 0) {
        container.innerHTML = "<p>Katalog produk kosong.</p>";
        return;
    }

    barang.forEach((item, index) => {
        const produk = document.createElement("div");
        produk.className = "produk";
        produk.onclick = () => tambahKeKeranjang(index);

        produk.innerHTML = `
            <div class="produk-name">${item.nama}</div>
            <div class="produk-price">${rupiah(item.harga)}</div>
            <div class="produk-stock">Stok tersedia: ${item.stok} unit</div>
        `;
        container.appendChild(produk);
    });
}

function tambahKeKeranjang(index) {
    const produk = barang[index];

    if (produk.stok <= 0) {
        alert("Stok barang ini sudah habis!");
        return;
    }

    const existing = keranjang.find(item => item.kode === produk.kode);

    if (existing) {
        if (existing.qty >= produk.stok) {
            alert("Jumlah pesanan melebihi batas stok!");
            return;
        }
        existing.qty++;
    } else {
        keranjang.push({
            kode: produk.kode,
            nama: produk.nama,
            harga: produk.harga,
            qty: 1
        });
    }

    tampilkanKeranjang();
}

function tampilkanKeranjang() {
    const container = document.getElementById("keranjang");
    container.innerHTML = "";

    if (keranjang.length === 0) {
        container.innerHTML = '<p class="empty">Belum ada item dipilih</p>';
        document.getElementById("totalKasir").innerText = rupiah(0);
        return;
    }

    keranjang.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        const subtotal = item.harga * item.qty;

        div.innerHTML = `
            <div>
                <div class="cart-item-name">${item.nama}</div>
                <div class="cart-item-price">${rupiah(item.harga)}</div>
            </div>
            <div class="qty">
                <button onclick="kurangiQty(${index})">-</button>
                <span style="padding: 0 8px; font-weight: bold;">${item.qty}</span>
                <button onclick="tambahQty(${index})">+</button>
            </div>
            <div><strong>${rupiah(subtotal)}</strong></div>
        `;
        container.appendChild(div);
    });

    hitungTotal();
}

function tambahQty(index) {
    const item = keranjang[index];
    const produk = barang.find(b => b.kode === item.kode);

    if (item.qty >= produk.stok) {
        alert("Jumlah pesanan melebihi batas stok!");
        return;
    }
    item.qty++;
    tampilkanKeranjang();
}

function kurangiQty(index) {
    keranjang[index].qty--;
    if (keranjang[index].qty <= 0) {
        keranjang.splice(index, 1);
    }
    tampilkanKeranjang();
}

function hitungTotal() {
    let total = 0;
    keranjang.forEach(item => total += item.harga * item.qty);
    document.getElementById("totalKasir").innerText = rupiah(total);
    hitungKembalian();
}

function hitungKembalian() {
    let total = 0;
    keranjang.forEach(item => total += item.harga * item.qty);

    const pembayaran = Number(document.getElementById("pembayaran").value) || 0;
    const kembali = pembayaran - total;

    document.getElementById("kembalian").innerText = rupiah(Math.max(kembali, 0));
}

// ========================================
// PEMBAYARAN & RIWAYAT
// ========================================

function prosesPembayaran() {
    if (keranjang.length === 0) {
        alert("Keranjang belanja masih kosong!");
        return;
    }

    let total = 0;
    keranjang.forEach(item => total += item.harga * item.qty);

    const pembayaran = Number(document.getElementById("pembayaran").value) || 0;

    if (pembayaran < total) {
        alert("Pembayaran kurang sebesar " + rupiah(total - pembayaran));
        return;
    }

    const kembali = pembayaran - total;

    buatStruk(total, pembayaran, kembali);

    // Kurangi stok produk secara otomatis
    keranjang.forEach(item => {
        const produk = barang.find(b => b.kode === item.kode);
        if (produk) {
            produk.stok -= item.qty;
        }
    });

    totalPenjualan += total;

    const waktuSkrg = new Date().toLocaleString("id-ID");
    const rincianStr = keranjang.map(i => `${i.nama} (x${i.qty})`).join(", ");

    riwayatTransaksi.unshift({
        waktu: waktuSkrg,
        rincian: rincianStr,
        total: total,
        bayar: pembayaran,
        kembali: kembali
    });

    simpanData();

    keranjang = [];
    document.getElementById("pembayaran").value = "";
    document.getElementById("kembalian").innerText = rupiah(0);

    tampilkanKeranjang();
    tampilkanProdukKasir();
    tampilkanBarang();
    updateDashboard();
    tampilkanRiwayat();
}

function tampilkanRiwayat() {
    const tabel = document.getElementById("tabelRiwayat");
    if (!tabel) return;
    
    tabel.innerHTML = "";

    if (riwayatTransaksi.length === 0) {
        tabel.innerHTML = `<tr><td colspan="6" style="text-align:center">Belum ada riwayat transaksi</td></tr>`;
        return;
    }

    riwayatTransaksi.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.waktu}</td>
            <td>${item.rincian}</td>
            <td>${rupiah(item.total)}</td>
            <td>${rupiah(item.bayar)}</td>
            <td>${rupiah(item.kembali)}</td>
        `;
        tabel.appendChild(row);
    });
}

// ========================================
// STRUK PEMBELIAN
// ========================================

function buatStruk(total, pembayaran, kembali) {
    const isi = document.getElementById("isiStruk");
    isi.innerHTML = "";

    keranjang.forEach(item => {
        const subtotal = item.harga * item.qty;
        const div = document.createElement("div");
        div.className = "struk-item";
        div.innerHTML = `<span>${item.nama} x${item.qty}</span><span>${rupiah(subtotal)}</span>`;
        isi.appendChild(div);
    });

    document.getElementById("strukTotal").innerText = rupiah(total);
    document.getElementById("strukBayar").innerText = rupiah(pembayaran);
    document.getElementById("strukKembali").innerText = rupiah(kembali);
    document.getElementById("struk").classList.add("show");
}

function tutupStruk() {
    document.getElementById("struk").classList.remove("show");
}
