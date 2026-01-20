const API = "PASTE_YOUR_SCRIPT_URL_HERE";
let rawData = [];
let filtered = [];

fetch(API).then(r=>r.json()).then(d=>{
  rawData = d;
  initFilters();
  renderTable(d);
});

function unique(col){
  return [...new Set(rawData.map(r=>r[col]).filter(Boolean))];
}

function initFilters(){
  fill("party","PARTY NAME");
  fill("item","ITEM");
  fill("lot","LOT NO");
  fill("colour","COLOUR");
  fill("rate","RATE");
}

function fill(id,col){
  const s=document.getElementById(id);
  s.innerHTML=`<option value="">All</option>`+
    unique(col).map(v=>`<option>${v}</option>`).join("");
  s.onchange=applyFilters;
}

document.getElementById("search").oninput=applyFilters;

function applyFilters(){
  const s=document.getElementById("search").value.toLowerCase();
  filtered = rawData.filter(r=>
    (!party.value||r["PARTY NAME"]==party.value) &&
    (!item.value||r["ITEM"]==item.value) &&
    (!lot.value||r["LOT NO"]==lot.value) &&
    (!colour.value||r["COLOUR"]==colour.value) &&
    (!rate.value||r["RATE"]==rate.value) &&
    JSON.stringify(r).toLowerCase().includes(s)
  );
  renderTable(filtered);
}

function resetFilters(){
  document.querySelectorAll("input,select").forEach(e=>e.value="");
  renderTable(rawData);
}

function renderTable(data){
  const table=document.getElementById("table");
  table.tHead.innerHTML="";
  table.tBodies[0].innerHTML="";

  if(!data.length) return;

  const h=Object.keys(data[0]);
  table.tHead.innerHTML="<tr>"+h.map(x=>`<th>${x}</th>`).join("")+"</tr>";
  table.tBodies[0].innerHTML=data.map(r=>
    "<tr>"+h.map(x=>`<td>${r[x]??""}</td>`).join("")+"</tr>"
  ).join("");
}
