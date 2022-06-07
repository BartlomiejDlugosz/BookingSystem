const searchBtn = document.querySelector("#searchDate")
const bookButtons = document.querySelectorAll(".bookBtn")
const date = document.querySelector("#date")

let currentSelectedTime

const getData = async (date) => {
    const result = await fetch(`/availableBookings?date=${date}`)
    if (result) {
        let i = 0
        for (let key in result) {
            if (result[key] === false) {
                date[i].classList.add("disabled")
            }
            i++
        }
    }
}

const removeSelectedClass = () => {
    for (let button of bookButtons) {
        button.classList.remove("selected")
    }
}

for (let button of bookButtons) {
    button.addEventListener("click", e => {
        currentSelectedTime = button.id
        removeSelectedClass()
        button.classList.add("selected")
    })
}

searchBtn.addEventListener("click", async e => {
    getData(date.value)
})