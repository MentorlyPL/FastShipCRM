import axios from "axios"
import { Package, API_BASE } from "../shared/index.js"
import { openEditModal } from "../shared/editModal/editModal.js"

const container = document.getElementById("detailsContainer") as HTMLDivElement
const backBtn = document.getElementById("backBtn")!
const editBtn = document.getElementById("editBtn")!
const urlParams = new URLSearchParams(window.location.search)
const packageId = urlParams.get("id")
let loadedPackage: Package

if (!packageId) {
  container.innerHTML =
    "<p class='text-danger'>Brak ID paczki w adresie URL.</p>"
  throw new Error("Missing package ID")
}

backBtn.addEventListener("click", () => {
  window.location.href = "/"
})

async function loadPackage() {
  try {
    const { data } = await axios.get<Package>(
      `${API_BASE}/packages/${packageId}`
    )
    loadedPackage = data
    renderDetails(data)
  } catch (e) {
    container.innerHTML = "<p class='text-danger'>Nie znaleziono paczki.</p>"
  }
}

function renderDetails(pkg: Package) {
  const senderFull = `
    ${pkg.sender.name}<br>
    ${pkg.sender.address.street}<br>
    ${pkg.sender.address.zipCode} ${pkg.sender.address.city}<br>
    ${pkg.sender.address.country}<br>
    Email: ${pkg.sender.contact.email ?? "-"}<br>
    Telefon: ${pkg.sender.contact.phone ?? "-"}
  `

  const receiverFull = `
    ${pkg.receiver.name}<br>
    ${pkg.receiver.address.street}<br>
    ${pkg.receiver.address.zipCode} ${pkg.receiver.address.city}<br>
    ${pkg.receiver.address.country}<br>
    Email: ${pkg.receiver.contact.email ?? "-"}<br>
    Telefon: ${pkg.receiver.contact.phone ?? "-"}
  `

  container.innerHTML = `
    <div class="details-block">
      <span class="details-label">ID:</span> ${pkg.id}
    </div>

    <h4>Nadawca</h4>
    <div class="details-block">${senderFull}</div>

    <h4>Odbiorca</h4>
    <div class="details-block">${receiverFull}</div>

    <div class="details-block">
      <span class="details-label">Priorytet:</span> ${pkg.priority}
    </div>

    <div class="details-block">
      <span class="details-label">Waga:</span> ${pkg.weight} kg
    </div>

    <div class="details-block">
      <span class="details-label">Status:</span> ${pkg.status}
    </div>

    <div class="details-block">
      <span class="details-label">Utworzono:</span> ${new Date(
        pkg.createdAt
      ).toLocaleString()}
    </div>
  `
}

editBtn.addEventListener("click", () => {
  if (!loadedPackage) return

  openEditModal(loadedPackage, loadPackage)
})

loadPackage()
