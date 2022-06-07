const Joi = require("joi")

module.exports.bookingSchema = Joi.object({
    room: Joi.string().valid("B101", "B102").required(),
    teacher: Joi.string().required(),
    date: Joi.date().required()
})