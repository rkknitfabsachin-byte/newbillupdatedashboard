const API = "https://empty-grass-b8a5.rkknitfabsachin.workers.dev";
const LIMIT = 150;

let offset = 0;
let total = Infinity;
let loading = false;

let raw = [];
let filtered = [];

const wrap = document.getElementById("tableWrap");
const tbody = document.querySelector("tbody");
const thead = document.querySelector("thead");

/* INITIAL LOAD */
loadMore();

/* LOAD ON SCROLL */
wrap.addEventListener("scroll", () => {
  if (
    wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 200 &&
    !loading
  ) {
    loadMore();
  }
});

/* FETCH CHUNK */
async function loadMore() {
  if (offset >= total) return;
  loading = true;

  const res = await fetch(`${API}?offset=${offset}&limit=${LIMIT}`);
  const data = await res.json();

  total = data.total;
  offset += data.rows.length;
  raw.push(...data.rows);

  applyFilters();
  loading = false;
}

/* FILTER */
function applyFilters() {
  const s = search.value.toLowerCase();
  const f = fromDate.value;
  const t = toDate.value;

  filtered = raw.filter(r => {
    if (f && new Date(r.DATE) < new Date(f)) return false;
    if (t && new Date(r.DATE) > new Date(t)) return false;
    if (!JSON.stringify(r).toLowerCase().includes(s)) return false;
    return true;
  });

  updateSummary();
  render();
}

/* SUMMARY */
function updateSummary() {
  let w=0,a=0,r=0;
  filtered.forEach(x=>{
    w+=+x.WEIGHT||0;
    a+=+x.TOTAL||0;
    r+=+x["NO OF ROLLS"]||0;
  });
  document.getElementById("w").innerText=w.toFixed(2);
  document.getElementById("a").innerText=a.toFixed(2);
  document.getElementById("r").innerText=r;
}

/* TABLE */
function render() {
  if (!filtered.length) return;

  const headers = Object.keys(filtered[0]);
  thead.innerHTML =
    "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr>";

  tbody.innerHTML = filtered.map(r =>
    "<tr>" + headers.map(h => `<td>${r[h]||""}</td>`).join("") + "</tr>"
  ).join("");
}

/* EVENTS */
search.oninput = applyFilters;
fromDate.onchange = applyFilters;
toDate.onchange = applyFilters;

function toggleTheme(){
  document.body.classList.toggle("light");
}
