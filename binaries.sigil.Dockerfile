FROM golang:alpine as builder

RUN apk add --no-cache git
RUN go get github.com/gliderlabs/sigil/cmd
RUN go install github.com/gliderlabs/sigil/cmd

FROM scratch
COPY --from=builder /go/bin/cmd /sigil
