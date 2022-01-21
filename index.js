const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('build'));

// app.use(morgan('type'));
morgan.token('req-body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'));

let persons = [
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

app.get('/info', (req, res) => {
  const info = `Phonebook has info for ${persons.length} people`;
  res.send(info + '<br /><br/>' + Date())
})

app.get('/api/persons', (req, res) => {
  res.json(persons);
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(person => person.id === id);

  if (!person) {
    res.status(404).end();
  } else {
    res.json(person);
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);

  res.status(204).end();
})

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body;
  const nameExisted = persons.filter(p => p.name.toLowerCase() === name.toLowerCase());

  if (!name || !number) {
    res.status(400).json({ error: 'Name or number is missing' })
  } else if (nameExisted.length > 0) {
    res.status(400).json({ error: 'name must be unique' })
  } else {
    const personObj = {
      id: Math.floor(Math.random() * 1000),
      name: name,
      number: number
    };
    persons = persons.concat(personObj);
    res.json(personObj);
  }
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})