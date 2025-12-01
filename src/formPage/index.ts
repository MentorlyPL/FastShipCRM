import axios from "axios"
import {
  Package,
  Priority,
  Statuses,
  PersonData,
  API_BASE
} from "../shared/index.js"

const form = document.querySelector("#package-form") as HTMLFormElement
const errorBox = document.querySelector("#error-box") as HTMLDivElement

function uuid(): string {
  return crypto.randomUUID()
}

function getPerson(prefix: "sender" | "receiver"): PersonData {
  const name = (
    document.querySelector(`#${prefix}-name`) as HTMLInputElement
  ).value.trim()

  const street = (
    document.querySelector(`#${prefix}-street`) as HTMLInputElement
  ).value.trim()
  const city = (
    document.querySelector(`#${prefix}-city`) as HTMLInputElement
  ).value.trim()
  const zipCode = (
    document.querySelector(`#${prefix}-zip`) as HTMLInputElement
  ).value.trim()
  const country = (
    document.querySelector(`#${prefix}-country`) as HTMLInputElement
  ).value.trim()

  const email = (
    document.querySelector(`#${prefix}-email`) as HTMLInputElement
  ).value.trim()
  const phone = (
    document.querySelector(`#${prefix}-phone`) as HTMLInputElement
  ).value.trim()

  if (!email && !phone) {
    throw new Error(
      `Dane kontaktowe (${
        prefix === "sender" ? "Nadawca" : "Odbiorca"
      }) muszą zawierać email lub telefon.`
    )
  }

  return {
    name,
    address: {
      street,
      city,
      zipCode,
      country
    },
    contact: { email, phone }
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault()

  errorBox.classList.add("d-none")
  errorBox.textContent = ""

  try {
    const sender = getPerson("sender")
    const receiver = getPerson("receiver")

    const priority = (document.querySelector("#priority") as HTMLSelectElement)
      .value as Priority
    const weight = parseFloat(
      (document.querySelector("#weight") as HTMLInputElement).value
    )

    if (weight <= 0) {
      throw new Error("Waga musi być większa niż 0.")
    }

    const newPackage: Package = {
      id: uuid(),
      sender,
      receiver,
      priority,
      weight,
      status: Statuses.created,
      createdAt: new Date().toISOString()
    }

    await axios.post(`${API_BASE}/packages`, newPackage)

    window.location.href = "../index.html"
  } catch (err: any) {
    errorBox.textContent = err.message || "Nieznany błąd"
    errorBox.classList.remove("d-none")
  }
})
