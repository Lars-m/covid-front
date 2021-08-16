const MUNICIPALITY_API_URL = API_URL + "/kommuner"

function fetchMunicipalityAndMakeRows() {
  fetch(MUNICIPALITY_API_URL).then(r => r.json())
    .then(data => {
      var tbody = document.querySelector("#municipality-body");
      tbody.innerHTML = ""
      data.forEach((row, i) => {
        const template = document.querySelector('#municipality-rows');
        const clone = template.content.cloneNode(true);
        let tds = clone.querySelectorAll("td");
        tds[0].textContent = row.id
        tds[1].textContent = row.name
        tds[2].textContent = row.zip
        tds[3].textContent = JSON.stringify(row.parishes.map(r => r.navn))
        tbody.appendChild(clone);
      })
    })
}