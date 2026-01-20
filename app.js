const API =
  "https://script.google.com/macros/s/AKfycbziGZTCLELTj7JTarAwzM9Xf0rRzgAGH5jc5-3A96FS1A3w43LHkWrG2XOvpWA2kfXs/exec";

let rawData = [];
let filtered = [];

/* ========= FETCH ========= */
fetch(API)
  .then(res => {
    if (!res.ok) throw new Error("API error " + res.status);
    return res.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error("Invalid JSON format");
    rawData = data;
    initFilters();
    renderTable(rawData);
  })
  .catch(err => {
    console.error("DATA LOAD FAILED:", err);
    alert("Failed to load data. Check API deployment.");
  });

/* ========= HELPERS ========= */
const $ = id => document.getElementById(id);

function unique(col) {
  return [...new Set(rawData.map(r => r[col]).filter(v => v !== "" && v != null))];
}

/* ========= FILTER INIT ========= */
function initFilters() {
  fill("party", "PARTY NAME");
  fill("item", "ITEM");
  fill("lot", "LOT NO");
  fill("colour", "COLOUR");
  fill("rate", "RATE");

  $("search").addEventListener("input", applyFilters);
}

/* ========= DROPDOWN BUILDER ========= */
function fill(id, col) {
  const el = $(id);
  el.innerHTML =
    `<option value="">All</option>` +
    unique(col).map(v => `<option value="${v}">${v}</option>`).join("");

  el.addEventListener("change", applyFilters);
}

/* ========= FILTER LOGIC ========= */
function applyFilters() {
  const search = $("search").value.toLowerCase();

  filtered = rawData.filter(r =>
    (!$("party").value || r["PARTY NAME"] === $("party").value) &&
    (!$("item").value || r["ITEM"] === $("item").value) &&
    (!$("lot").value || r["LOT NO"] === $("lot").value) &&
    (!$("colour").value || r["COLOUR"] === $("colour").value) &&
    (!$("rate").value || String(r["RATE"]) === $("rate").value) &&
    JSON.stringify(r).toLowerCase().includes(search)
  );

  renderTable(filtered);
}

/* ========= RESET ========= */
function resetFilters() {
  document.querySelectorAll("input, select").forEach(e => (e.value = ""));
  renderTable(rawData);
}

/* ========= TABLE RENDER ========= */
function renderTable(data) {
  const table = $("table");
  table.tHead.innerHTML = "";
  table.tBodies[0].innerHTML = "";

  if (!data.length) {
    table.tBodies[0].innerHTML =
      `<tr><td colspan="20" style="text-align:center;padding:20px;">No results</td></tr>`;
    return;
  }

  const headers = Object.keys(data[0]);

  table.tHead.innerHTML =
    "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr>";

  table.tBodies[0].innerHTML = data
    .map(
      row =>
        "<tr>" +
        headers.map(h => `<td>${row[h] ?? ""}</td>`).join("") +
        "</tr>"
    )
    .join("");
}
