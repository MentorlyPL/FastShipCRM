import axios from "axios"
import { Package, PersonData, API_BASE } from "./shared/index.js"
import { openEditModal } from "./shared/editModal/editModal.js"

const tableBody = document.querySelector(
  "#package-table-body"
) as HTMLTableSectionElement | null
const errorBox = document.querySelector("#error-box") as HTMLDivElement | null
const loader = document.querySelector("#loader") as HTMLDivElement | null
const statusSelect = document.getElementById(
  "filterStatus"
) as HTMLSelectElement
const prioritySelect = document.getElementById(
  "filterPriority"
) as HTMLSelectElement
const sortSelect = document.getElementById("sortSelect") as HTMLSelectElement

let loadedPackages: Package[]
let filteredPackages: Package[]

if (!tableBody || !errorBox || !loader) {
  console.error("Brakuje elementów DOM (tableBody/errorBox/loader)")
}

function personToString(sender: PersonData): string {
  return `${sender.name}`
}

function renderTable(packages: Package[]) {
  if (!tableBody) return

  tableBody.innerHTML = ""
  packages.forEach((pkg) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td>${pkg.id}</td>
      <td>${personToString(pkg.sender)}</td>
      <td>${personToString(pkg.receiver)}</td>
      <td>${pkg.priority}</td>
      <td>${pkg.weight} kg</td>
      <td>${pkg.status}</td>
      <td>${new Date(pkg.createdAt).toLocaleString()}</td>
      <td class="buttons-container">
        <button href="/src/detailsPage/index.html?id=${encodeURIComponent(
          pkg.id
        )}" class="btn btn-sm btn-primary action-btn me-1 details-btn">Szczegóły</button>
        <button class="btn btn-sm btn-secondary action-btn me-1 edit-btn" data-id="${
          pkg.id
        }">Edytuj</button>
        <button class="btn btn-sm btn-danger action-btn delete-btn" data-id="${
          pkg.id
        }">Usuń</button>
      </td>
    `
    tableBody.appendChild(row)
  })

  tableBody.querySelector(".details-btn")?.addEventListener("click", (ev) => {
    window.location.href =
      (ev.currentTarget as HTMLButtonElement).getAttribute("href") || "/"
  })

  tableBody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (ev) => {
      const id = (ev.currentTarget as HTMLElement).getAttribute("data-id")
      if (!id) return
      const confirmDelete = confirm(`Czy na pewno usunąć paczkę ${id}?`)
      if (!confirmDelete) return

      try {
        await axios.delete(`${API_BASE}/packages/${id}`)
        loadPackages()
      } catch (err) {
        alert("Nie udało się usunąć paczki.")
        console.error(err)
      }
    })
  })

  tableBody.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      const id = (ev.currentTarget as HTMLElement).getAttribute("data-id")
      if (!id) return
      const pkg = loadedPackages.find((p) => p.id === id)
      if (!pkg) return

      openEditModal(pkg, loadPackages)
    })
  })
}

async function loadPackages() {
  if (loader) loader.style.display = "block"
  if (errorBox) {
    errorBox.style.display = "none"
    errorBox.textContent = ""
  }

  try {
    const response = await axios.get<Package[]>(`${API_BASE}/packages`)
    loadedPackages = response.data
    applyFiltersAndSorting()
  } catch (error) {
    console.error(error)
    if (errorBox) {
      errorBox.style.display = "block"
      errorBox.textContent =
        "Nie udało się pobrać listy paczek. Upewnij się, że backend działa"
    }
  } finally {
    if (loader) loader.style.display = "none"
  }
}

function applyFiltersAndSorting() {
  let data = [...loadedPackages]

  if (statusSelect.value) {
    data = data.filter((p) => p.status === statusSelect.value)
  }

  if (prioritySelect.value) {
    data = data.filter((p) => p.priority === prioritySelect.value)
  }

  switch (sortSelect.value) {
    case "dateAsc":
      data.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
      break

    case "dateDesc":
      data.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      break

    case "weightAsc":
      data.sort((a, b) => a.weight - b.weight)
      break

    case "weightDesc":
      data.sort((a, b) => b.weight - a.weight)
      break
  }

  filteredPackages = data
  renderTable(filteredPackages)
}

statusSelect.addEventListener("change", applyFiltersAndSorting)
prioritySelect.addEventListener("change", applyFiltersAndSorting)
sortSelect.addEventListener("change", applyFiltersAndSorting)

loadPackages()
