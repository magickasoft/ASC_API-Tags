# ASC Tags microservice

This is the repo for the Tags microservice

## Files & Folders

### Soruce code

The server setup and configuration logic are in the `server` and `config` folders. The `routes` folder contains micro-service business logic, while `models` contains the setup and low-level business code for data (such as validation, data mangling and so on...). The `containers` folder contains the Docker scripts.

### API definitions

The `swagger` folder contains the documentation for API and models . Inside, API definitions are in the `api` folder. The `models` folder contains the collections' models, used to define the MongoDB collections or API response.  The `forms` folder contains the models used for data input.

## Setup & Run notes

- Get dependencies:
        $ npm install
- Start the microservice:
        $ npm start
- Build the container (you should have Docker running):
        $ ./container/setup.sh
- Use `curl`, `resty`, [Postman](http://www.getpostman.com/) or such to play with those
microservices through the API gateway


## Unit testing

- To run available unit tests for microservice business logic (no integration/API):
        $ npm run test
- To test only the Swagger documentation:
        $ npm run api:test

## API preview
The [online swagger editor](http://editor.swagger.io) could be used to get a preview of the API. The editor expects a bundle (a file with any $ref resolved) copy of the API.
The following command could be used to bundle an API:
        $ npm run api:bundle -- api/<apiname>.yaml <bundlename>.json
When ready, open the bundle file and copy its content. Then, on the online swagger editor, select `File -> Paste JSON...` and paste the content into the modal window. Press `Import` to load the definitions. If the API server is available, the right pane could be used also to preview the server response.

## Some SWAGGER tools

- `swagger-cli`
        $ npm install -g swagger-cli
- Validate a definition, e.g.:
        $ swagger validate swagger/api/<apiname>.yaml
- Resolve any `$ref` in a single file
        $ swagger bundle swagger/api/<apiname>.yaml -o <bundlename>.json
- Online editor
        http://editor.swagger.io
