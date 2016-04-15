# Socala Backend

This is the backend for Socala. It is an Express.js app.

As deployed on my server, Nginx listens on port 80 and then forwards to Node (which is listening on port 8080) any requests on /socala/*.

I am using mongoose.js to talk to MongoDB.


### Setup

Create config.json

``` json
    {
        "secret": "put some random string here",
        "redirectUrl": "", // It's fine to leave this empty
        "clientSecret": "Secret generated from google dev console",
        "clientId": "Client id generated from google dev console"
    }
```

Create user.json to test the api without going through the authentication flow
``` json
{
    "accessToken": "",
    "refreshToken": "",
    "email": ""
```