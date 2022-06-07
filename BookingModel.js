const mongoose = require("mongoose")
const { Schema } = mongoose

const BookingSchema = new Schema({
    room: {
        type: String,
        required: true,
        enum: ["B101", "B102"]
    },
    teacher: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
})

const Booking = new mongoose.model("Booking", BookingSchema)
module.exports = Booking