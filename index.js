require('dotenv').config()
console.log("MONGODB_URI IS:", process.env.MONGODB_URI);

const express = require('express')
const app = express()
app.use(express.json())
app.use(express.static('dist'))

const morgan = require('morgan')
// app.use(morgan('tiny'))
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :response-time ms :body'))

const Contact = require('./models/contact')

app.get('/api/contacts', (request, response, next) => {
    Contact.find({}).then(contacts => response.json(contacts))
                    .catch(error => next(error))
})

app.get('/api/contacts/:id', (request, response, next) => {
    const id = request.params.id
    Contact.findById(id)
        .then(note => {
            if (note) response.json(contact)
            else response.status(404).end()
        })
        .catch(error => next(error))
})

app.get('/api/contacts/info', (request, response, next) => {
  Contact.find({})
    .then(contacts => {
        response.send(`<p>Phonebook has info for ${contacts.length} people</p>
                       <p>${new Date()}</p>`)
    })
    .catch(error => next(error))

})

app.post('/api/contacts/', (request, response) => {
    const body = request.body
    if (!body.name || !body.number) {
      return response.status(400)
                     .json({error: 'new entry missing name and/or number'})
    }
    // else if (contacts.some(contact => contact.name === body.name)) {
    //   return response.status(400).json({error: 'name already exists'})
    // }
    const contact = new Contact({
        name: body.name,
        number: body.number
    })
    contact.save()
           .then(savedContact => response.json(savedContact))
})

app.put('/api/contacts/:id', (request, response, next) => {
    const id = request.params.id
    const body = request.body
    if (!body.name || !body.number) {
      return response.status(400)
                     .json({error: 'new entry missing name and/or number'})
    }
    Contact.findById(id)
        .then(contact => {
            if (!contact) {
                return response.status(404).end()
            }

            contact.name = body.name;
            contact.number = body.number;

            return contact.save().then((updatedContact) => {
                response.json(updatedContact)
            })
        })
        .catch(error => next(error))
})

app.delete('/api/contacts/:id', (request, response, next) => {
    const id = request.params.id
    Contact.findByIdAndDelete(id)
        .then(result => response.status(204).end())
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})