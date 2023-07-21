Download the standalone Jar.

<https://github.com/znsio/specmatic/releases/download/{{ site.latest_release }}/specmatic.jar>

#### Mac / Linux

```
alias specmatic='java -jar <basedir>/specmatic.jar'
```

#### Windows

Create a batch file with below content.

```
java -jar <basedir>/specmatic.jar %*
```

The %* portion tells the batch script to pass all of the parameters it receives to the new command.

#### Docker

If you don't want to install Java on your machine, you can also use Docker by creating a file named `Dockerfile` with the following contents:

```Dockerfile
FROM openjdk:8-jdk-alpine

WORKDIR /specmatic

ADD https://github.com/znsio/specmatic/releases/download/0.72.0/specmatic.jar /specmatic/specmatic.jar
RUN chmod +x /specmatic/specmatic.jar

WORKDIR /app

ENTRYPOINT ["java", "-jar", "/specmatic/specmatic.jar"]
```

Before you can run Specmatic in a Docker container, you have to build the image:

```bash
# Run inside the directory of the above Dockerfile.
docker build -t specmatic .
```

Now you can add an alias to conveniently run the `specmatic` command inside a Docker container.

```bash
alias specmatic='docker run --rm -it -v ${PWD}/:/app -p 9000:9000 specmatic'
```
