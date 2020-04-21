const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id))
    return response.status(400).send();

  return next();
}

function notUpdateLikeMannualy(request, response, next){
  const { likes } = request.params;

  if (likes)
    return response.status(400).json({ "likes" : 0 });

  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  }

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", validateId, notUpdateLikeMannualy, (request, response) => {
  const { id } = request.params; 
  const { title, url, techs } = request.body;
  
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);  

  if (!repositoryIndex)
    return response.status(400).send();

  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositories[repositoryIndex].likes,
  }

  repositories[repositoryIndex] = repository;  

  return response.status(200).json(repository);
});

app.delete("/repositories/:id", validateId, (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (!repositoryIndex)
    return response.status(400).send();

  repositories.splice(repositoryIndex, 1);

  return response.status(204).json(repositories);

});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repository = repositories.find(repository => repository.id === id);

  if (!repository)
    return response.status(400).send();

  repository.likes += 1;

  return response.json({ "likes" : repository.likes });
});

module.exports = app;
