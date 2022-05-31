## Description
App to get discount of a product
If the product has a discount this discount has a priority and will be returned.
Otherwise, we move to its parent category (if it exists) and check if it has a discount and so on until the product-category chain is done.
If no discount was found the API will return -1.
<p align="center">

![sequence diagram for getting discount](./doc/get-discount.seq.png)
</p>

<p align="center">

![component diagram ](./doc/components.modules.png)
</p>


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
- Added winston logger to store the logs, and we can add winston-elasticsearch-apm as a transport to store the errors in APM and have errors in a dashboard
- APM or Datadog for monitoring
- filebeat for debugging logs and kiabana
- hash passwords using crypto module and compare hashes on login
- since categories are not changed frequently it's a good idea to cache them
- test auth module
- revoke JWT on logout: by storing tokens in redis
- separate auth module from user module and add admin module to create users 
- add transformer and response interceptor to format response data and remove unwanted fields like __v
- in get discount route the code and amount are enough so i omitted name from this route
- added E2E test to test the whole process of singup, login, creating product and categories and getting discount


