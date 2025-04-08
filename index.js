const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(morgan('tiny'))
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :response-time ms :body'))

let contacts = [
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
]

app.get('/api/contacts', (req, res) => {
    res.json(contacts)
})

app.get('/api/contacts/:id', (req, res) => {
    const id = req.params.id
    const contact = contacts.find(contact => contact.id === id)
    if (contact) res.json(contact)
    else res.status(404).json({error: 'id does not exist'})
})

app.get('/api/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${contacts.length} people</p>
            <p>${new Date()}</p>`)
})

app.post('/api/contacts/', (req, res) => {
    const body = req.body
    if (!body.name || !body.number) return res.status(400).json({error: 'new entry missing name and/or number'})
    else if (contacts.some(contact => contact.name === body.name)) {
      return res.status(400).json({error: 'name already exists'})
  }
    const newContact = {
        id: Math.floor(Math.random() * 1000000),
        name: body.name,
        number: body.number
    }

    contacts = (contacts.concat(newContact))
    res.json(newContact)
})

app.delete('/api/contacts/:id', (req, res) => {
    const id = req.params.id
    contacts = contacts.filter(contact => contact.id !== id)
    res.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})