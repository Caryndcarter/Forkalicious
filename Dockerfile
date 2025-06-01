# this base image is needed to run the Cypress tests.
FROM cypress/browsers
WORKDIR /Forkalicious
COPY . .
RUN npm install
RUN npm run build
CMD ["sh"]