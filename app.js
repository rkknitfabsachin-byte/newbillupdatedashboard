const API = "https://empty-grass-b8a5.rkknitfabsachin.workers.dev";
const LIMIT = 150;

let offset = 0;
let total = Infinity;
let loading = false;

let raw = [];
let filtered = [];

const wrap = document.getElementById("dataWrap");
const cards = document.getElementById("cards");
const tbody = document.querySelector("tbody");
const thead = document.querySelector("thead");

/* INITIAL LOAD */
loadMore();

/* SCROLL LOAD */
wrap.addEventListener("scroll", () => {
  if (
    wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 200 &&
    !loading
  ) {
    loadMore();
  }
});

async function loadMore(){
  if(offset >= total) return;
  loading = true;

  const res = await fetch(`${API}?offset=${offset}&limit=${LIMIT}`);
  const data = await res.json();

  total = data.total;
  offset += data.rows.length;
  raw.push(...data.rows);

  buildLists(raw);
  applyFilters();
  loading = false;
}

/* FILTERS */
function applyFilters(){
  filtered = raw.filter(r => {
    if (f_date.value && r.DATE !== f_date.value) return false;
    if (f_bill.value && !r["BILL NUMBER"].includes(f_bill.value)) return false;
    if (f_party.value && r["PARTY NAME"] !== f_party.value) return false;
    if (f_item.value && r.ITEM !== f_item.value) return false;
    if (f_lot.value && r["LOT NO"] !== f_lot.value) return false;
    if (f_colour.value && r.COLOUR !== f_colour.value) return false;
    if (f_rate.value && r.RATE != f_rate.value) return false;
    if (f_location.value && !r.LOCATION.includes(f_location.value)) return false;
    if (search.value &&
        !JSON.stringify(r).toLowerCase().includes(search.value.toLowerCase())
    ) return false;
    return true;
  });

  updateSummary();
  render();
}

/* SUMMARY */
function updateSummary(){
  let w=0,a=0,r=0;
  filtered.forEach(x=>{
    w+=+x.WEIGHT||0;
    a+=+x.TOTAL||0;
    r+=+x["NO OF ROLLS"]||0;
  });
  sumW.innerText=w.toFixed(2);
  sumA.innerText=a.toFixed(2);
  sumR.innerText=r;
}

/* RENDER */
function render(){
  if(window.innerWidth < 768){
    cards.innerHTML = filtered.map(r=>`
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

  if(!filtered.length) return;
  const h = Object.keys(filtered[0]);

  thead.innerHTML =
    "<tr>"+h.map(x=>`<th>${x}</th>`).join("")+"</tr>";

  tbody.innerHTML = filtered.map(r=>
    "<tr>"+h.map(x=>`<td>${r[x]||""}</td>`).join("")+"</tr>"
  ).join("");
}

/* LISTS */
function buildLists(src){
  fill("partyList","PARTY NAME",src);
  fill("itemList","ITEM",src);
  fill("lotList","LOT NO",src);
  fill("colourList","COLOUR",src);
}

function fill(id,col,src){
  document.getElementById(id).innerHTML =
    [...new Set(src.map(x=>x[col]).filter(Boolean))]
      .map(v=>`<option value="${v}">`).join("");
}

/* EVENTS */
document.querySelectorAll("input").forEach(i=>i.oninput=applyFilters);

function toggleTheme(){
  document.body.classList.toggle("light");
}
