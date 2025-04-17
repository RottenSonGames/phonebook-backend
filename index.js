require('dotenv').config()

const express = require('express')
const app = express()
app.use(express.json())
app.use(express.static('dist'))

const morgan = require('morgan')
morgan.token ('body', (request) => JSON.stringify(request.body))
app.use(morgan(':method :url :status :response-time ms :body'))

const Contact = require('./models/contact')

app.get('/api/contacts', (request, response, next) => {
  Contact.find({})
    .then(contacts => response.json(contacts))
    .catch(error => next(error))
})

app.get('/api/contacts/:id', (request, response, next) => {
  Contact.findById(request.params.id)
    .then(contact => {
      if (contact) response.json(contact)
      else response.status(404).end()
    })
    .catch(error => next(error))
})

app.get('/api/contacts/info', (request, response, next) => {
  Contact.find({})
    .then(contacts => {
      response.send(`<p>Phonebook has ${contacts.length} contacts</p>
                    <p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

app.post('/api/contacts', (request, response, next) => {
  const contact = new Contact({
    name: request.body.name,
    number: request.body.number
  })
  contact.save()
    .then(savedContact => response.json(savedContact))
    .catch(error => next(error))
})

app.put('/api/contacts/:id', (request, response, next) => {
  Contact.findByIdAndUpdate(request.params.id)
    .then(contact => {
      if (!contact) return response.status(404).end()
      contact.name = request.body.name
      contact.number = request.body.number
      return contact.save().then((updatedContact) => response.json(updatedContact))
    })
    .catch(error => next(error))
})

app.delete('/api/contacts/:id', (request, response, next) => {
  Contact.findByIdAndDelete(request.params.id)
    .then(result => response.status(204).end())
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  return response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log('error: ', error)

  if (error.name === 'CastError') return response.status(400).send({ error: 'malformatted id' })
  else if (error.name === 'ValidationError') {
    console.log('error.errors: ', error.errors)
    if (error.errors.name) {
      return response.status(400).send({ error: 'name must be at least three characters long' })
    }
    if (error.errors.number) {
      return response.status(400).send({ error: 'number does not follow correct format for Finnish numbers' })
    }
    return response.status(400).send({ error: 'name or number missing' })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)