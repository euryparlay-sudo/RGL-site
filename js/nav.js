// ===== NAVIGATION =====
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
  }

  // Ambil nama file terakhir dari path. Sebelumnya .pop() bisa salah kalau
  // web di-host di subpath (GitHub Pages: user.github.io/nama-repo) dan
  // diakses tanpa trailing slash -- .pop() akan mengembalikan "nama-repo",
  // bukan string kosong, jadi fallback ke index.html tidak kepakai dan
  // link nav Home gagal ter-highlight aktif.
  const segments = window.location.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || "";
  const current = last.includes(".") ? last : "index.html";

  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current) link.classList.add("active");
    link.addEventListener("click", () => {
      if (navLinks) navLinks.classList.remove("open");
    });
  });
});
