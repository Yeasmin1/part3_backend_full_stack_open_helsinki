require('dotenv').config()

const express = require('express');
const cors = require('cors')
const Person = require('./models/person')
const app = express();
// Middleware to parse JSON bodies
app.use(express.json())

//To make Express show static content, the page index.html and the JavaScript, etc., it fetches, we need a built-in middleware from Express called static.
app.use(express.static('dist')) 
app.use(cors())
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
app.use(requestLogger)
let persons = [
  
]

const unknownEndpoint = (request, response)=>{
  response.status(404).send({error:'unknown endpoint'})

}
app.get('/', (request, response)=>{
  response.send('<h1>Hello World</h1>')

})
app.get('/api/persons',(request, response) =>{
  const body = request.body
  if (body === undefined){
    return response.status(400).json({error: 'content missing'})
  }

  Person.find.then(showData =>{
    response.json(showData)
  })
 
})

app.get('/api/persons/:id', (request, response) => { 
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.post('/api/persons', (request, response) =>{
  const body = request.body;
  if (body === undefined){
    return response.status(400).json({error: 'content missing'})
  }
  const person = new Person({
    name: body.name,
    number: body.number
  })
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.delete('/api/persons/:id', (request,response) =>{
  const id = Number (request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.use(unknownEndpoint)




const PORT = process.env.PORT
app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`)
})
