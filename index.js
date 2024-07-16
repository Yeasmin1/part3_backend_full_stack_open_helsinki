const express = require('express')
const app = express()
require('dotenv').config()

const Person = require('./models/person')
const initialPersons = [
  {
      "name": "Farida",
      "number": "09-1234556"
  },
  {
      "name": "Yeasmin",
      "number": "05-1234556"
  }
]
app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(requestLogger)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error:'unknown endpoint' })
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.countDocuments().then((personCount) => {
      if (personCount === 0) {
          Person.insertMany(initialPersons).then(() => {
              Person.find().then((data) => {
                  response.json(data);
              })
          })
      } else {
          Person.find().then((data) => {
              response.json(data);
          })
      }
  })
});


app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  const person = new Person({ name, number })
  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person){
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next (error))
})

app.delete('/api/persons/:id', (request,response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(response.status(204).end())
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  const person = { name, number }
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
