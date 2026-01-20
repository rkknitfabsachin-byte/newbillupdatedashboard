const API = "https://empty-grass-b8a5.rkknitfabsachin.workers.dev";

let rawData = [];
let filtered = [];

const $ = id => document.getElementById(id);

/* LOAD DATA */
fetch(API)
  .then(r => r.json())
  .then(d => {
    if (d.error) {
      console.error(d);
      alert("API Error – check worker response");
      return;
    }
    rawData = d;
    filtered = d;
    initFilters();
    renderTable(filtered);
  })
  .catch(err => {
    console.error(err);
    alert("Failed to load data");
  });


/* FILTER SETUP */
function initFilters(){
  updateFilters(rawData);
  $("search").addEventListener("input", applyFilters);
}

/* DEPENDENT FILTERS */
function updateFilters(source){
  build("party","PARTY NAME",source);
  build("item","ITEM",source);
  build("lot","LOT NO",source);
  build("colour","COLOUR",source);
  build("rate","RATE",source);
}

function build(id,col,source){
  const el=$(id);
  const cur=el.value;
  const vals=[...new Set(source.map(r=>r[col]).filter(v=>v))];

  el.innerHTML=`<option value="">All</option>`+
    vals.map(v=>`<option value="${v}">${v}</option>`).join("");

  el.value=cur;
  el.onchange=applyFilters;
}

/* APPLY FILTERS */
function applyFilters(){
  const s=$("search").value.toLowerCase();

  filtered=rawData.filter(r=>
    (!$("party").value || r["PARTY NAME"]===$("party").value) &&
    (!$("item").value || r["ITEM"]===$("item").value) &&
    (!$("lot").value || r["LOT NO"]===$("lot").value) &&
    (!$("colour").value || r["COLOUR"]===$("colour").value) &&
    (!$("rate").value || String(r["RATE"])===$("rate").value) &&
    JSON.stringify(r).toLowerCase().includes(s)
  );

  updateFilters(filtered);
  renderTable(filtered);
}

/* RESET */
function resetFilters(){
  document.querySelectorAll("input,select").forEach(e=>e.value="");
  filtered=rawData;
  updateFilters(rawData);
  renderTable(rawData);
}

/* TABLE */
function renderTable(data){
  const table=$("table");
  table.tHead.innerHTML="";
  table.tBodies[0].innerHTML="";

  if(!data.length){
    table.tBodies[0].innerHTML=
      `<tr><td colspan="20" style="text-align:center;padding:20px;">No Data</td></tr>`;
    return;
  }

  const headers=Object.keys(data[0]);

  table.tHead.innerHTML=
    "<tr>"+headers.map(h=>`<th>${h}</th>`).join("")+"</tr>";

  table.tBodies[0].innerHTML=data.map(r=>
    "<tr>"+headers.map(h=>`<td>${r[h]??""}</td>`).join("")+"</tr>"
  ).join("");
}
