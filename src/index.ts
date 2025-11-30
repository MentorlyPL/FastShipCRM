import axios from "axios"
import { Package } from "./shared/index.js"

const API_BASE = "http://localhost:8080"

const tableBody = document.querySelector(
  "#package-table-body"
) as HTMLTableSectionElement | null
const errorBox = document.querySelector("#error-box") as HTMLDivElement | null
const loader = document.querySelector("#loader") as HTMLDivElement | null

if (!tableBody || !errorBox || !loader) {
  console.error("Brakuje elementów DOM (tableBody/errorBox/loader)")
}

async function loadPackages() {
  if (loader) loader.style.display = "block"
  if (errorBox) {
    errorBox.style.display = "none"
    errorBox.textContent = ""
  }

  try {
    const response = await axios.get<Package[]>(`${API_BASE}/packages`)
    const packages = response.data

    if (tableBody && packages) {
      tableBody.innerHTML = ""
      packages.forEach((p) => {
        const row = document.createElement("tr")
        row.innerHTML = `
          <td>${p.id} xddd</td>
          <td>${p.sender}</td>
          <td>${p.receiver}</td>
          <td>${p.priority}</td>
          <td>${p.weight}</td>
          <td>${new Date(p.createdAt).toLocaleString()}</td>
          <td>
            <a href="../detailsPage/index.html?id=${encodeURIComponent(
              p.id
            )}" class="btn btn-sm btn-primary me-1">Szczegóły</a>
            <button class="btn btn-sm btn-secondary me-1 edit-btn" data-id="${
              p.id
            }">Edytuj</button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${
              p.id
            }">Usuń</button>
          </td>
        `
        tableBody.appendChild(row)
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
          // tutaj powinieneś otworzyć modal edycji — ten modal zrobimy w kolejnym tickecie
          // tymczasowo przekierowujemy do detailsPage z parametrem edit=true
          window.location.href = `../detailsPage/index.html?id=${encodeURIComponent(
            id
          )}&edit=true`
        })
      })
    }
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

// uruchomienie
loadPackages()
