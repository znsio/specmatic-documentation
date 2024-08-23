# Specmatic API Coverage Report Documentation

## Configuring HTML Report in specmatic.yaml

To configure the HTML report in your `specmatic.yaml` file, add the following section:

```yaml
report:
  formatters:
    - type: text
      layout: table
  types:
    APICoverage:
      OpenAPI:
        successCriteria:
          minThresholdPercentage: 70
          maxMissedEndpointsInSpec: 0
        enforce: true
        excludedEndpoints:
          - /health
```

This configuration sets up the report format as a text table and defines the success criteria for API coverage.

## Locating the Report

After running the Specmatic tests, you can find the generated report in the project's ________ directory. it's typically in a directory named `build`______

## Understanding the Results Column

The "Result" column in the report provides information about the coverage status of each endpoint. Here's what each status means:

| Status | Meaning | Color Code |
|--------|---------|------------|
| Covered | The endpoint is fully covered by tests | Green |
| WIP | Work in Progress - partial coverage | Yellow |
| Not Covered | The endpoint is not covered by tests | Yellow |
| Missing In Spec | The endpoint is in the implementation but not in the API specification | Red |

### Color Coding

- Green: a passed test ????
- Yellow: indicates ??? 
- Red: Indicates a failure or missing specification ???

## Test Results Summary

The report includes a summary of test results:

- Success: Number of successful tests
- Failed: Number of failed tests
- Errors: Number of tests that resulted in errors
- Skipped: Number of skipped tests
- Total: Total number of tests run

