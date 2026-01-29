const express = require("express");
const morgan = require("morgan")

const app = express()

app.use(express.json())
app.use(express.static("dist"))

morgan.token("body", (req) => {
    return req.method === "POST" && JSON.stringify(req.body)
})

app.use(morgan(":method :url :status :res[content-length] :response-time ms :body"))

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
];

app.get("/", (req, res) => {
    res.send("<h1>Hello World!</h1>")
})

app.get("/api/persons", (req, res) => {
    res.json(persons)
})

app.get("/api/persons/:id", (req, res) => {
    const id = req.params.id
    const person = persons.find(note => note.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

const genId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => Number(n.id)))
        : 0

    return String(maxId + 1)
}

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

    if (persons.find(person => person.name === body.name)) {
        return res.status(400).json({
            error: "name must be unique"
        })
    }

    const person = {
        id: genId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    res.json(person)
})

app.delete("/api/persons/:id", (req, res) => {
    const id = req.params.id
    persons = persons.filter(note => note.id !== id)

    res.status(204).end()
})

app.get("/info", (req, res) => {
    const num = persons.length
    res.send(`<p>Phonebook has info for ${num} people</p><p>${Date()}</p>`)
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
