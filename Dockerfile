# golang image where workspace (GOPATH) configured at /go.
FROM golang

# Copy the local package files to the container’s workspace.
ADD . /go/src/github.com/SivaShhankar/peerchatgooglecloud

# Setting up working directory
WORKDIR /go/src/github.com/SivaShhankar/peerchatgooglecloud

# Get godeps for managing and restoring dependencies
RUN go get github.com/tools/godep

# Restore godep dependencies
RUN godep restore 

# Build the source command inside the container.
RUN go install github.com/SivaShhankar/peerchatgooglecloud

# Run the source command when the container starts.
ENTRYPOINT /go/bin/peerchatgooglecloud

# Service listens on port 8080.
EXPOSE 8080