const PARISH_API_URL = API_URL + "/sogne"

function setUpParishHandlers() {
  document.getElementById("parish-body").onclick = handleTableClick
  document.getElementById("btn-save").onclick = saveParishData
  document.getElementById("btn-add-parish").onclick = makeNewParish
}

function handleTableClick(evt) {
  evt.preventDefault()
  evt.stopPropagation()
  const parent = evt.target.parentNode;


  if (parent.getAttribute("data-is-delete")) {
    const id = parent.dataset.id;
    const options = {
      method: "DELETE"
    }
    document.getElementById("spinner").style.visibility = "visible"
    fetch(`${PARISH_API_URL}/${id}`, options)
      .then(() => fetchParishesAndMakeRows())
      .finally(() => document.getElementById("spinner").style.visibility = "visible")
  }

  if (parent.getAttribute("data-is-edit")) {
    const parish = JSON.parse(parent.dataset.parish)
    showModal(parish)
  }
}

function makeNewParish() {
  showModal({
    sognekode: null,
    navn: "",
    smitteTryk: -1,
    nedlukningsDato: null,
    kommunePostnummer: null
  })
}

function showModal(parish) {
  const myModal = new bootstrap.Modal(document.getElementById('parishModal'))
  document.getElementById("parishModalTitle").innerText = parish.sognekode ? "Edit sogn" : "Tilføj sogn"
  document.getElementById("sogne-kode").innerText = parish.sognekode
  document.getElementById("input-navn").value = parish.navn
  document.getElementById("input-smitte-tryk").value = parish.smitteTryk
  document.getElementById("input-dato").value = parish.nedlukningsDato
  document.getElementById("input-post-nummer").value = parish.kommunePostnummer
  myModal.show()
}

function saveParishData() {

  const parish = {}
  const id = document.getElementById("sogne-kode").innerText
  parish.sognekode = document.getElementById("sogne-kode").value
  parish.navn = document.getElementById("input-navn").value
  parish.smitteTryk = document.getElementById("input-smitte-tryk").value
  parish.nedlukningsDato = document.getElementById("input-dato").value
  parish.kommunePostnummer = document.getElementById("input-post-nummer").value

  const url = id ? `${PARISH_API_URL}/${id}` : PARISH_API_URL
  const method = id ? "PUT" : "POST"

  const options = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(parish)
  }
  document.getElementById("spinner").style.visibility = "visible"
  fetch(url, options)
    .then(async (r) => {
      if (!r.ok) {
        const error = await r.text();
        throw new Error(error)
      }
      r.json()
    })
    .then(() => fetchParishesAndMakeRows())
    .catch((e) => {
      const error = e.message
      const errorDiv = document.getElementById("add-error-msg");
      errorDiv.innerText = `Nyt sogn kunne ikke tilføjes (${e.message})`
      errorDiv.style.display = "block"
      setTimeout(() => errorDiv.style.display = "none", 5000)
    })
    .finally(() => document.getElementById("spinner").style.visibility = "hidden")


}

function fetchParishesAndMakeRows() {
  document.getElementById("spinner").style.visibility = "visible";
  fetch(PARISH_API_URL).then(r => r.json())
    //parishApiFacade.fetchParishes()
    .then(data => {
      var tbody = document.querySelector("#parish-body");
      tbody.innerHTML = ""
      data.forEach((row, i) => {
        const template = document.querySelector('#parish-rows');
        const clone = template.content.cloneNode(true);
        let tds = clone.querySelectorAll("td");
        tds[0].textContent = row.sognekode
        tds[1].textContent = row.navn
        tds[2].textContent = row.smitteTryk
        tds[3].textContent = row.nedlukningsDato
        tds[4].textContent = row.erLukket ? "Ja" : "nej"
        tds[5].textContent = row.kommune
        tds[6].textContent = row.kommunePostnummer
        tds[7].setAttribute("data-id", row.sognekode)
        tds[7].setAttribute("data-is-delete", row.sognekode)
        tds[8].setAttribute("data-is-edit", 1)
        tds[8].setAttribute("data-parish", JSON.stringify(row))
        tbody.appendChild(clone);
      })
    })
    .finally(() => document.getElementById("spinner").style.visibility = "hidden")
}
