## Description
App to get discount of a product
If the product has a discount this discount has a priority and will be returned.
Otherwise, we move to its parent category (if it exists) and check if it has a discount and so on until the product-category chain is done.
If no discount was found the API will return -1.

##### Sequence Diagram For Get Discount Flow

![sequence diagram for getting discount](./doc/get-discount.seq.png)

##### Top Level Component Diagram

![component diagram ](./doc/components.modules.png)


## Installation
```bash
$ npm install
```

## Database
to start a dockerized mongo instance
```bash
$ docker-compose up -d
```
you can use the default config in the env.example

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Documentation
[API Documentation](http://localhost:3033/api/)

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Enhancement
- Added `Winston logger` to store the logs, and we can `add winston-elasticsearch-apm` as a transport to store the errors in `APM` and have errors in a dashboard
- `APM` or `Datadog` for monitoring
- `Filebeat` for debugging logs query on them on `Kibana`
- We MUST hash passwords using `crypto` module and compare hashes on login
- since categories are not changed frequently it's a good idea to cache them
- Write test for auth module
- The doc folder contains the sequence and component diagram docs created by `Plantuml` and the source to update the docs
- Revoke `JWT` on logout: by storing tokens in `Redis`
- We should separate auth module from user module and add admin module to create users 
- Add a layer of transform for response using interceptor to remove unwanted fields like __v or add new fields
- In get discount route the code and amount were enough as code is unique so i omitted name from this route
- I added E2E test to test the whole process of singup, login, creating product and categories and getting discount so no need to check every route manually

