FROM node:22-alpine

LABEL org.opencontainers.image.title="FollowersYA CLI" \
      org.opencontainers.image.description="Official FollowersYA commerce API CLI for agents and developers" \
      org.opencontainers.image.source="https://github.com/followersya/followersya-cli" \
      org.opencontainers.image.url="https://followersya.com/developers" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app
COPY followersya.js followersya.mjs package.json README.md ./

ENTRYPOINT ["node", "/app/followersya.js"]
CMD ["help"]
