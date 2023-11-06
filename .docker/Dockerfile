## build runner
FROM node:16.20.2-buster-slim as build-runner

# Set temp directory
WORKDIR /tmp/app

# Install dependencies for packages
RUN apt-get update
RUN apt-get install -y python3 python3-pip
RUN apt-get update
# RUN add-apt-repository ppa:xtradeb/apps
## Make sure this is ubuntu
## https://askubuntu.com/questions/828443/how-to-install-latest-package-version-of-a-ppa
# RUN apt-get install -y software-properties-common
# RUN add-apt-repository ppa:canonical-chromium-builds/stage
# RUN apt-get update
# RUN apt-get install -y chromium-browser
# RUN apt-get install -y libappindicator1 fonts-liberation wget dpkg
# RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
# RUN dpkg -i google-chrome*.deb && rm google-chrome*.deb

# Move package.json and package-lock.json
COPY package.json .
COPY package-lock.json .
COPY babel.config.json .
COPY src ./src

# Install dependencies from package-lock.json
# and install dependencies for plugins (because postinstall script doesn't work in docker)
RUN npm ci

# Build project
RUN npm run do:build

## producation runner
FROM node:16.20.2-buster-slim as prod-runner

# set production mode
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Set work directory
WORKDIR /app 

# Copy files from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json
COPY --from=build-runner /tmp/app/package-lock.json /app/package-lock.json
COPY --from=build-runner /tmp/app/package.json /app/babel.config.json
COPY --from=build-runner /tmp/app/dist /app/dist

# Install dependencies from package-lock.json
# and install dependencies for plugins (because plugins:install script doesn't work in docker)
RUN npm ci --omit=dev && npm cache clean --force 

# Inject cert
# RUN echo $DATABASE_CA_CERT
# RUN echo $DATABASE_CA_CERT > /app/.postgres/root.crt
# RUN chmod 644 /app/.postgres/root.crt

# Finaly start the bot
CMD ["node", "build/main.js"]