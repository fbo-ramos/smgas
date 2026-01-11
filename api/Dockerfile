# multi-stage build
FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/smgas-api ./cmd/api

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=build /app/smgas-api /app/smgas-api
COPY migrations /app/migrations
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["/app/smgas-api"]
