//(without express)the application imports Node's built-in Web server module (in our browser
//side code we write it like this "import http from 'http")
//const http = require("http")
const express = require('express');
const morgan = require('morgan'); //importing express, which this time is a function that is used to create an Express application stored in the app variable:
const cors = require('cors')

const app = express();
// Middleware to parse JSON bodies
app.use(express.json())
app.use(cors())
const generateId = () => {
  return Math.floor(Math.random() * 1000000)
}


//To define a token, simply invoke morgan.token() with the name 
//and a callback function. This callback function is expected to 
//return a string value. The value returned is then available as ":post-body" 
//in this case:
morgan.token('post-body',(request, response) => {
  if (request.method === 'POST'){
    return JSON.stringify(request.body)
  }
  return '';
})

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :post-body')
)
let persons = 
    [
              { 
                "id": 1,
                "name": "Arto Hellas", 
                "number": "040-123456"
              },
              { 
                "id": 2,
                "name": "Ada Lovelace", 
                "number": "39-44-5323523"
              },
              { 
                "id": 3,
                "name": "Dan Abramov", 
                "number": "12-43-234345"
              },
              { 
                "id": 4,
                "name": "Mary Poppendieck", 
                "number": "39-23-6423122"
              }
            ]

//(without express)The code uses the createServer method of the http module to create a new
// web server. An event handler is registered to the server that is called every time an HTTP request is made to the server's address http://localhost:3001.
//The request is responded to with the status code 200, with the Content-Type 
//header set to application/json, and the content of the site to be returned set to persons.
//The last rows bind the http server assigned to the app variable, 
//to listen to HTTP requests sent to port 3001
//const app = http.createServer((request, response) => {
    //response.writeHead(200, { 'Content-Type': 'application/json' })

    //response.end() method expects a string or a buffer to send as the 
    //response body.
    //response.end(JSON.stringify(persons))
  //})



app.get('/api/persons',(request, response) =>{
  console.log("/api/persons get")
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => { //app.get
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
})

app.get('/info',(request, response)=> {
  const currentTime = new Date().toLocaleString();
  const numberOfEntries = persons.length;
  response.send(`
        <p>The request was received at: ${currentTime}</p>
        <p>Phonebook has info for ${numberOfEntries} people</p>
    ` 
  )
}) 

app.delete('/api/persons/:id', (request,response) =>{
  const id = Number(request.params.id)
  const person = persons.find(persons => persons.id === id)
  if (person){
    const personIndex = persons.findIndex(persons => persons.id === id)
    persons.splice(personIndex, 1)
    response.json(person)
  } 
  else
    response.status(404).end()

})


app.post('/api/persons', (request, response) =>{
  const {name, number} = request.body;
  console.log("/api/persons post", name)
  if (!name || !number) {
    return response.status(400).send({message:'Name and number are required.' })
  }
  const existingName = persons.find(newNameEntry => newNameEntry.name === name);
  if(existingName){
    return response.status(404).send({error: 'Name must be unique.'})
  }
  const newEntry = {
    id: generateId(),
    name,
    number
  }
  persons.push(newEntry);
  response.status(201).send(newEntry);
});

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`)
})
