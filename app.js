const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate")
const Booking = require("./BookingModel")
const app = express()

const port = 3000

mongoose.connect("MONGO_DB_LINK_REDACTED")
    .then(() => {
        console.log("MONGO CONNECTED!")
    })
    .catch(e => {
        console.log("ERROR OCCURED CONNECTING!")
        console.log(e)
    })



app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "/views"))

app.engine("ejs", ejsMate)

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "/public")))

app.get("/bookings", async (req, res) => {
    let bookings = await Booking.find({}).sort({ date: 1 })
    const { type, status, filter } = req.query

    if (filter) {
        let dateToSearch = new Date(filter)
        let nextDate = new Date(dateToSearch.getTime())
        nextDate.setDate(nextDate.getDate() + 1)

        bookings = await Booking.find({ date: { $gte: dateToSearch, $lt: nextDate } }).sort({ date: 1 })
    }

    if (type && status) {
        res.render("index", { bookings, type, status, filter })
    }
    else {
        res.render("index", { bookings, filter })
    }
})

app.get("/bookings/new", (req, res) => {
    res.render("new")
})

app.get("/bookings/:id", async (req, res) => {
    const { id } = req.params
    const booking = await Booking.findById(id)
    res.render("show", { booking })
})

app.post("/bookings", async (req, res) => {
    const { room, teacher, date, password } = req.body
    if (password === "1234") {
        const newBooking = new Booking({ room, teacher, date })
        await newBooking.save()
        res.redirect(`/bookings?type=${"success"}&status=${"Saved Booking!"}`)
    }
    else {
        console.log(password)
        res.redirect(`/bookings?type=${"danger"}&status=${"Incorrect Password!"}`)
    }
})

app.listen(port, (req, res) => {
    console.log(`LISTENING ON PORT ${port}!`)
})