require("dotenv").config()
const express = require("express");
const morgan = require("morgan")
const Person = require("./models/person")

const axios = require("axios")

const app = express()

app.use(express.json())
app.use(express.static("dist"))

morgan.token("body", (req) => {
    return req.method === "POST" && JSON.stringify(req.body)
})

app.use(morgan(":method :url :status :res[content-length] :response-time ms :body"))

app.get("/api/persons", (req, res) => {
    Person.find({}).then(people => {
        res.json(people)
    })
})

app.get("/api/persons/:id", (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.send(404).end()
            }
        })
        .catch(error => next(error))
})

app.post("/api/persons", (req, res) => {
    const body = req.body

    if (!body.name) {
        return res.status(400).json({
            error: "name missing"
        })
    }

    if (!body.number) {
        return res.status(400).json({
            error: "number missing"
        })
    }

    Person.find({ name: body.name }).then((response) => {
        if (response.length > 0) {
            const id = String(response[0]._id)

            const updated = {
                name: body.name,
                number: body.number
            }

            axios
                .put(`${req.protocol}://${req.hostname}:${process.env.PORT}/api/persons/${id}`, updated)
                .then(({ updated }) => res.status(200).json(updated))
        } else {
            const person = new Person({
                name: body.name,
                number: body.number
            })

            person.save().then(savedPerson => {
                res.json(savedPerson)
            })
        }
    })
})

app.put("/api/persons/:id", (req, res, next) => {
    const { name, number } = req.body

    Person.findById(req.params.id)
        .then(person => {
            if (!person) {
                return res.status(404).end()
            }

            person.name = name
            person.number = number

            return person.save()
                .then(updatedPerson => {
                    res.json(updatedPerson)
                })
        })
        .catch(error => next(error))
})

app.delete("/api/persons/:id", (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then((deleted) => {
            res.json(deleted)
        })
        .catch(error => next(error))
})

app.get("/info", (req, res) => {
    Person.countDocuments().exec().then(num => {
        res.send(`<p>Phonebook has info for ${num} people</p><p>${Date()}</p>`)
    })
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" })
    } else if (error.name === "ValidationError") {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
