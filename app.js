const API = "https://empty-grass-b8a5.rkknitfabsachin.workers.dev";
const LIMIT = 150;

/* STATE */
let offset = 0;
let total = Infinity;
let loading = false;
let raw = [];
let filtered = [];

document.addEventListener("DOMContentLoaded", () => {

  /* SAFE GETTER */
  const $ = id => document.getElementById(id);

  const wrap = $("dataWrap");
  const cards = $("cards");
  const table = $("table");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  const inputs = {
    search: $("search"),
    fromDate: $("fromDate"),
    toDate: $("toDate"),
    bill: $("f_bill"),
    party: $("f_party"),
    item: $("f_item"),
    lot: $("f_lot"),
    colour: $("f_colour"),
    rate: $("f_rate"),
    location: $("f_location")
  };

  const sumW = $("sumW");
  const sumA = $("sumA");
  const sumR = $("sumR");

  /* LOAD FIRST CHUNK */
  loadMore();

  /* SCROLL LOAD */
  wrap?.addEventListener("scroll", () => {
    if (
      wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 200 &&
      !loading
    ) {
      loadMore();
    }
  });

  /* FILTER EVENTS (NULL SAFE) */
  Object.values(inputs).forEach(el => {
    if (el) el.addEventListener("input", applyFilters);
  });

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
      if (inputs.fromDate?.value && new Date(r.DATE) < new Date(inputs.fromDate.value)) return false;
      if (inputs.toDate?.value && new Date(r.DATE) > new Date(inputs.toDate.value)) return false;

      if (inputs.bill?.value && !String(r["BILL NUMBER"]).includes(inputs.bill.value)) return false;
      if (inputs.party?.value && r["PARTY NAME"] !== inputs.party.value) return false;
      if (inputs.item?.value && r.ITEM !== inputs.item.value) return false;
      if (inputs.lot?.value && r["LOT NO"] !== inputs.lot.value) return false;
      if (inputs.colour?.value && r.COLOUR !== inputs.colour.value) return false;
      if (inputs.rate?.value && String(r.RATE) !== inputs.rate.value) return false;
      if (inputs.location?.value && !String(r.LOCATION).includes(inputs.location.value)) return false;

      if (
        inputs.search?.value &&
        !JSON.stringify(r).toLowerCase().includes(inputs.search.value.toLowerCase())
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
    if (sumW) sumW.textContent = w.toFixed(2);
    if (sumA) sumA.textContent = a.toFixed(2);
    if (sumR) sumR.textContent = r;
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
    const el = $(id);
    if (!el) return;
    el.innerHTML =
      [...new Set(src.map(x => x[col]).filter(Boolean))]
        .map(v => `<option value="${v}">`)
        .join("");
  }

});

/* THEME */
function toggleTheme() {
  document.body.classList.toggle("light");
}
