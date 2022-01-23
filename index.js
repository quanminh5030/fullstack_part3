require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Person = require('./src/models/person');

const app = express();

app.use(express.static('build'));
app.use(express.json());
app.use(cors());

// app.use(morgan('type'));
morgan.token('req-body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'));

app.get('/info', (req, res) => {
  const info = `Phonebook has info for ${persons.length} people`;
  res.send(info + '<br /><br/>' + Date())
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => res.json(persons))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => res.status(204).end())
    .catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body;

  const personObj = new Person({
    name: name,
    number: number
  });

  Person.find({ name: name })
    .then(person => {
      if (person.length > 0) {
        res.status(400).json({ error: `Person ${name} is already added in the phonebook. You might want update?` })
      } else {
        personObj.save()
          .then(savedPerson => savedPerson.toJSON())
          .then(savedAndFormattedPerson => res.json(savedAndFormattedPerson))
          .catch(err => next(err))
      }
    })
    .catch(err => next(err));
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true })
    .then(updatedPerson => res.json(updatedPerson))
    .catch(err => next(err))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

// handler of requests with result to errors
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})