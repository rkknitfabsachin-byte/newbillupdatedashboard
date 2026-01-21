const API = "https://empty-grass-b8a5.rkknitfabsachin.workers.dev";
const LIMIT = 150;

/* ===== STATE ===== */
let offset = 0;
let total = Infinity;
let loading = false;

let raw = [];
let filtered = [];

/* ===== DOM READY ===== */
document.addEventListener("DOMContentLoaded", () => {

  /* ---- CACHE ELEMENTS ---- */
  const wrap = document.getElementById("dataWrap");
  const cards = document.getElementById("cards");
  const table = document.getElementById("table");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  const search = document.getElementById("search");
  const fromDate = document.getElementById("fromDate");
  const toDate = document.getElementById("toDate");

  const f_bill = document.getElementById("f_bill");
  const f_party = document.getElementById("f_party");
  const f_item = document.getElementById("f_item");
  const f_lot = document.getElementById("f_lot");
  const f_colour = document.getElementById("f_colour");
  const f_rate = document.getElementById("f_rate");
  const f_location = document.getElementById("f_location");

  const sumW = document.getElementById("sumW");
  const sumA = document.getElementById("sumA");
  const sumR = document.getElementById("sumR");

  /* ===== INITIAL LOAD ===== */
  loadMore();

  /* ===== SCROLL LOAD ===== */
  wrap.addEventListener("scroll", () => {
    if (
      wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 200 &&
      !loading
    ) {
      loadMore();
    }
  });

  /* ===== FILTER EVENTS ===== */
  [
    search, fromDate, toDate,
    f_bill, f_party, f_item,
    f_lot, f_colour, f_rate, f_location
  ].forEach(el => el.addEventListener("input", applyFilters));

  /* ===== FUNCTIONS ===== */

  async function loadMore() {
    if (offset >= total) return;
    loading = true;

    try {
      const res = await fetch(`${API}?offset=${offset}&limit=${LIMIT}`);
      const data = await res.json();

      total = data.total;
      offset += data.rows.length;
      raw.push(...data.rows);

      buildLists(raw);
      applyFilters();
    } catch (e) {
      console.error("LOAD ERROR:", e);
    }

    loading = false;
  }

  function applyFilters() {
    filtered = raw.filter(r => {
      if (fromDate.value && new Date(r.DATE) < new Date(fromDate.value)) return false;
      if (toDate.value && new Date(r.DATE) > new Date(toDate.value)) return false;

      if (f_bill.value && !String(r["BILL NUMBER"]).includes(f_bill.value)) return false;
      if (f_party.value && r["PARTY NAME"] !== f_party.value) return false;
      if (f_item.value && r.ITEM !== f_item.value) return false;
      if (f_lot.value && r["LOT NO"] !== f_lot.value) return false;
      if (f_colour.value && r.COLOUR !== f_colour.value) return false;
      if (f_rate.value && String(r.RATE) !== f_rate.value) return false;
      if (f_location.value && !String(r.LOCATION).includes(f_location.value)) return false;

      if (
        search.value &&
        !JSON.stringify(r).toLowerCase().includes(search.value.toLowerCase())
      ) return false;

      return true;
    });

    updateSummary();
    render();
  }

  function updateSummary() {
    let w = 0, a = 0, r = 0;
    filtered.forEach(x => {
      w += Number(x.WEIGHT) || 0;
      a += Number(x.TOTAL) || 0;
      r += Number(x["NO OF ROLLS"]) || 0;
    });
    sumW.textContent = w.toFixed(2);
    sumA.textContent = a.toFixed(2);
    sumR.textContent = r;
  }

  function render() {
    if (window.innerWidth < 768) {
      cards.innerHTML = filtered.map(r => `
        <div class="card">
          <h3>${r["PARTY NAME"]}</h3>
          <div><span>Item:</span> ${r.ITEM}</div>
          <div><span>Lot:</span> ${r["LOT NO"]}</div>
          <div><span>Colour:</span> ${r.COLOUR}</div>
          <div><span>Weight:</span> ${r.WEIGHT}</div>
          <div><span>Total:</span> ₹${r.TOTAL}</div>
          <div><span>Date:</span> ${r.DATE}</div>
        </div>
      `).join("");
      return;
    }

    if (!filtered.length) return;

    const headers = Object.keys(filtered[0]);
    thead.innerHTML =
      "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr>";

    tbody.innerHTML = filtered.map(r =>
      "<tr>" + headers.map(h => `<td>${r[h] || ""}</td>`).join("") + "</tr>"
    ).join("");
  }

  function buildLists(src) {
    fill("partyList", "PARTY NAME", src);
    fill("itemList", "ITEM", src);
    fill("lotList", "LOT NO", src);
    fill("colourList", "COLOUR", src);
  }

  function fill(id, col, src) {
    document.getElementById(id).innerHTML =
      [...new Set(src.map(x => x[col]).filter(Boolean))]
        .map(v => `<option value="${v}">`)
        .join("");
  }

});

/* ===== THEME ===== */
function toggleTheme() {
  document.body.classList.toggle("light");
}
