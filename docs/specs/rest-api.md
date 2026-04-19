GET /items search + list (q, type, tags)

POST /recipes create (also creates item)
GET /recipes/:slug
PUT /recipes/:slug
DELETE /recipes/:slug (also deletes item)

GET /recipes/:slug/components
POST /recipes/:slug/components
PUT /recipes/:slug/components/:component_slug
DELETE /recipes/:slug/components/:component_slug

GET /recipes/:slug/steps
POST /recipes/:slug/steps
PUT /recipes/:slug/steps/:step_slug
DELETE /recipes/:slug/steps/:step_slug
