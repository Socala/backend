# Socala Backend

This is the backend for Socala. It is an Express.js app.

As deployed on my server, Nginx listens on port 80 and then forwards to Node (which is listening on port 8080) any requests on /socala/*.

I am using mongoose.js to talk to MongoDB.
