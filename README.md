# Specmatic Documentation

Documentation for [Specmatic](//specmatic.in)

Dev Setup
* Install Ruby > 2.7 - Preferrably with rbenv
* Run ```bundle``` to install dependencies
* Run ```bundle exec jekyll serve``` to start server on localhost:4000

Dev Containers
* Pre-requisites - Docker
* Open Project in VSCode
* VSCode will ask you install necessary plugins and open in dev container
* The Terminal inside VSCode is mapped to Docker Container. Run below commands in that terminal.
  * ```bundle``` to install dependencies
  * ```bundle exec jekyll serve``` to start server
    * Click on the "localhost:4000" link in terminal to launch it in browser at the ephemeral port
    * On my machine it is forwarded to localhost:4001
    * However, when you click on navigation in left pane, the port goes back to 4000. This is an inconvenience. TODO: need to fix this
  * You can even push to GitHub inside this terminal because Dockerfile maps your keys
