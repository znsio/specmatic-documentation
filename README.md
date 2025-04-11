# Specmatic Documentation

Documentation for [Specmatic](https://specmatic.io)

## Workflow

* Download the zip file from wordpress
* Copy the zip file to `tmp/website.zip`
* Execute the following code:
  ```shell
  git pull --rebase
  rake all # to clean up the entire contents, unpack the new website, and setup redirects
  git add .
  git commit -m 'Your commit message'
  git push
  ```
