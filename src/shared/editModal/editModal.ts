import axios from "axios"
import { API_BASE, Package, PersonData, Priority, Statuses } from "../index.js"

export function openEditModal(
  pkg: Package,
  onSave: (updated: Package) => void
) {
  closeExistingModal()

  const dialog = document.createElement("dialog")
  dialog.id = "editModalDialog"

  const modal = document.createElement("div")
  modal.id = "editModal"

  modal.innerHTML = `
    <div class="modal-header">
      <h3>Edycja paczki – ${pkg.id}</h3>
      <button class="close-btn" id="closeEditModal">&times;</button>
    </div>

    <form id="editForm" method="dialog">

      ${personSection("sender", "Dane nadawcy", pkg.sender)}
      ${personSection("receiver", "Dane odbiorcy", pkg.receiver)}

      <div class="form-section">
        <h4>Parametry paczki</h4>

        <label>Priorytet:</label>
        <select class="form-control mb-2" name="priority" required>
          <option value="standard" ${
            pkg.priority === "standard" ? "selected" : ""
          }>Standard</option>
          <option value="express" ${
            pkg.priority === "express" ? "selected" : ""
          }>Express</option>
        </select>

        <label>Waga (kg):</label>
        <input type="number" min="0.1" step="0.1" class="form-control mb-2" name="weight" value="${
          pkg.weight
        }" required />

        <label>Status:</label>
        <select class="form-control mb-2" name="status" required>
          ${Object.values(Statuses)
            .map(
              (s) =>
                `<option value="${s}" ${
                  pkg.status === s ? "selected" : ""
                }>${s}</option>`
            )
            .join("")}
        </select>
      </div>

      <button class="btn btn-primary w-100 mt-3" type="submit">Zapisz zmiany</button>
    </form>
  `

  dialog.appendChild(modal)
  document.body.appendChild(dialog)

  dialog.showModal()

  document
    .getElementById("closeEditModal")!
    .addEventListener("click", closeExistingModal)

  const form = document.getElementById("editForm") as HTMLFormElement

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const formData = new FormData(form)

    const updatedPackage: Package = {
      ...pkg,
      sender: extractPerson("sender", formData),
      receiver: extractPerson("receiver", formData),
      priority: formData.get("priority") as Priority,
      weight: Number(formData.get("weight")),
      status: formData.get("status") as string
    }

    const senderContactValid = validateContact(updatedPackage.sender.contact)
    const receiverContactValid = validateContact(
      updatedPackage.receiver.contact
    )

    if (!senderContactValid || !receiverContactValid) {
      alert("Nadawca i odbiorca muszą mieć podany email lub telefon.")
      return
    }

    await axios.put(`${API_BASE}/packages/${pkg.id}`, updatedPackage)

    closeExistingModal()
    onSave(updatedPackage)
  })
}

function personSection(key: string, title: string, data: any) {
  return `
    <div class="form-section">
      <h4>${title}</h4>

      <label>Imię i nazwisko:</label>
      <input class="form-control mb-2" name="${key}.name" value="${
    data.name
  }" required />

      <label>Ulica:</label>
      <input class="form-control mb-2" name="${key}.street" value="${
    data.address.street
  }" required />

      <label>Miasto:</label>
      <input class="form-control mb-2" name="${key}.city" value="${
    data.address.city
  }" required />

      <label>Kod pocztowy:</label>
      <input class="form-control mb-2" name="${key}.zipCode" value="${
    data.address.zipCode
  }" required />

      <label>Kraj:</label>
      <input class="form-control mb-2" name="${key}.country" value="${
    data.address.country
  }" required />

      <label>Email:</label>
      <input class="form-control mb-2" name="${key}.email" value="${
    data.contact.email ?? ""
  }" />

      <label>Telefon:</label>
      <input class="form-control mb-2" name="${key}.phone" value="${
    data.contact.phone ?? ""
  }" />
    </div>
  `
}

function extractPerson(prefix: string, form: FormData): PersonData {
  return {
    name: form.get(`${prefix}.name`) as string,
    address: {
      street: form.get(`${prefix}.street`) as string,
      city: form.get(`${prefix}.city`) as string,
      zipCode: form.get(`${prefix}.zipCode`) as string,
      country: form.get(`${prefix}.country`) as string
    },
    contact: {
      email: (form.get(`${prefix}.email`) as string) || undefined,
      phone: (form.get(`${prefix}.phone`) as string) || undefined
    }
  }
}

function validateContact(contact: { email?: string; phone?: string }) {
  return Boolean(contact.email) || Boolean(contact.phone)
}

function closeExistingModal() {
  const existing = document.getElementById("editModalDialog")
  if (existing) existing.remove()
}

export default { openEditModal }
