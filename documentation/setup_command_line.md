---
layout: default
title: Command Line Setup
nav_exclude: true
---
Command Line Setup
------------------

Download the standalone Jar.

[qontract-0.0.1-all.jar](https://github.com/qontract/qontract/releases/download/v0.0.1/qontract-0.0.1-all.jar)

Note: Please refer to latest [releases](/releases)

### Mac / Linux

```
alias qontract='java -jar <basedir>/qontract-0.0.1-all.jar'
```

### Windows

Create a batch file with below content.

```
java -jar <basedir>/qontract-0.0.1-all.jar %*
```

The %* portion tells the batch script to pass all of the parameters it receives to the new command.
