const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate")
const Booking = require("./BookingModel")
const methodOverride = require("method-override")
const { bookingSchema } = require("./BookingSchema")
const { ExpressError, asyncError } = require("./Error")
const app = express()

const port = 3000

mongoose.connect("mongodb://localhost:27017/bookings")
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
app.use(methodOverride("_method"))

const validateBooking = (req, res, next) => {
    const { room, teacher, date } = req.body
    const { error } = bookingSchema.validate({ room, teacher, date })
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    }
    next()
}


app.get("/bookings", asyncError(async (req, res) => {
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
}))

app.get("/bookings/new", (req, res) => {
    res.render("new")
})

app.get("/bookings/:id", asyncError(async (req, res) => {
    const { id } = req.params
    const booking = await Booking.findById(id)
    if (!booking) {
        throw new ExpressError("Not found booking!")
    }
    res.render("show", { booking })
}))

app.post("/bookings", validateBooking, asyncError(async (req, res) => {
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
}))

app.delete("/bookings/:id", asyncError(async (req, res) => {
    const { password } = req.body
    const { id } = req.params
    if (password === "1234") {
        const booking = await Booking.findById(id)
        if (!booking) {
            throw new ExpressError("Not found booking!", 400)
        }
        await booking.delete()
        res.redirect(`/bookings?type=${"success"}&status=${"Booking Deleted!"}`)
    } else {
        res.redirect(`/bookings?type=${"danger"}&status=${"Incorrect Password!"}`)
    }

}))

app.get("/availableBookings", asyncError(async (req, res) => {
    const {date} = req.query
    if (!date) {
        throw new ExpressError("Please provide a date", 400)
    }
    let dateToSearch = new Date(date)
    let nextDate = new Date(dateToSearch.getTime())
    nextDate.setDate(nextDate.getDate() + 1)

    const times = await Booking.find({ date: { $gte: dateToSearch, $lt: nextDate } }).sort({ date: 1 })
    const available = {"8:50": true, "10:40": true, "13:00": true, "14:40": true}
    for (let time of times) {
        for (let key in available) {
            if (`${time.getHours()}:${time.getMinutes()}` === key) {
                available[key] = false
            }
        }
    }
    res.send(available)
}))

app.use((err, req, res, next) => {
    const { status = 500 } = err
    res.status(status).render("error", { err })
})

app.listen(port, (req, res) => {
    console.log(`LISTENING ON PORT ${port}!`)
})