---
layout: default
title: Filters
parent: Documentation
nav_order: 18
---

# Specmatic Filters

Specmatic's powerful filtering system provides fine-grained control over both test execution and example generation. The filter syntax is expressive and flexible, allowing you to precisely control which specific scenarios to run based on various criteria. 

## Use Cases

### Running Tests
Execute specific test scenarios during development or CI/CD:
```
specmatic test --filter="PATH=/products && METHOD=GET"
```

### Generating Examples
Generate targeted examples in two ways:

1. Command Line Generation:
```
specmatic examples --filter="PATH=/users && METHOD=POST"
```

2. Interactive Mode:
```
specmatic examples interactive --filter="STATUS=200 && PATH=/orders"
```

## Available Filter Fields

Specmatic supports filtering on six distinct fields:
- `PATH` - Request paths (e.g., /users, /products)
- `METHOD` - HTTP methods (GET, POST, PUT, etc.)
- `STATUS` - Response status codes (supports individual codes and patterns like 5xx)
- `HEADERS` - Request headers
- `QUERY-PARAMS` - Query parameters
- `EXAMPLE-NAME` - Example names in your contract

## Basic Filter Syntax

Filters in Specmatic use a logical expression syntax that supports the following operators:
- `&&` (AND) - Combine multiple conditions that must all be true
- `||` (OR) - Specify alternative conditions where any can be true
- `!` (NOT) - Negate a condition
- `!=` - Not equal to

## Getting Started with Basic Filters

Let's start with simple examples that demonstrate the basic concepts:

### Filtering by Path
To run tests for a specific endpoint:
```
--filter="PATH=/products"
```

### Filtering by HTTP Method
To run only GET requests:
```
--filter="METHOD=GET"
```

### Filtering by Status Code
To exclude specific status codes:
```
--filter="STATUS!=400"
```

Note: For status codes, you can combine specific status codes with commas, but pattern matching (like 4xx) can only be used one at a time. For example:

Valid status code combinations:
- `--filter="STATUS=200,202,500"` (Multiple specific status codes)
- `--filter="STATUS!=200,202,500"` (Excluding specific status codes)
- `--filter="STATUS=4xx"` (Single pattern)
- `--filter="STATUS!=4xx"` (Excluding a pattern)

Invalid status code combinations:
- `--filter="STATUS=4xx,5xx"` (Multiple patterns not allowed)
- `--filter="STATUS!=4xx,5xx"` (Multiple patterns not allowed)

## Intermediate Filter Combinations

As you become comfortable with basic filters, you can combine them for more precise control:

### Combining Conditions with AND
Run only GET requests to the products endpoint:
```
--filter="PATH=/products && METHOD=GET"
```

### Using OR for Alternatives
Run tests that either use the products endpoint OR are POST requests:
```
--filter="PATH=/products || METHOD=POST"
```

### Filtering with Headers
Test requests with specific headers:
```
--filter="HEADERS=Authorization"
```

### Filtering by Query Parameters
Test endpoints with specific query parameters:
```
--filter="QUERY-PARAMS=sortBy"
```

### Filtering by Example Names
Run tests for specific examples:
```
--filter="EXAMPLE-NAME=successful_login"
```

## Advanced Filtering Techniques

### Excluding Specific Cases
Exclude a specific status code:
```
--filter="STATUS!=202"
```

### Complex Exclusions with Parentheses
Exclude specific endpoint-method combinations:
```
--filter="STATUS!=202 && !(PATH=/users && METHOD=POST)"
```

### Pattern Matching for Status Codes
Exclude 5xx status codes:
```
--filter="STATUS!=5xx"
```

## Real-World Examples

### E-commerce API Testing
1. Test all product operations except creation:
```
--filter="PATH=/products && METHOD!=POST"
```

2. Run only successful order operations:
```
--filter="PATH=/orders && STATUS!=5xx"
```

### User Management System
1. Test user authentication flows:
```
--filter="PATH=/auth/* && !(STATUS=500) && METHOD=POST"
```

2. Skip sensitive operations:
```
--filter="!(PATH=/admin/*) && STATUS!=401"
```

### Content Management System
1. Test content publishing workflow:
```
--filter="PATH=/articles && METHOD=PUT && STATUS!=5xx"
```

2. Validate read-only operations:
```
--filter="METHOD=GET && PATH=/content/*"
```

## Best Practices

1. **Start Simple**: Begin with basic filters and gradually add complexity as needed.

2. **Group Related Conditions**: Use parentheses to clearly group related conditions:
```
--filter="(PATH=/users || PATH=/accounts) && METHOD=POST"
```

3. **Status Code Patterns**: Remember the rules for status codes:
- You can combine specific status codes: `--filter="STATUS=200,202,404"`
- You can use one pattern at a time: `--filter="STATUS=4xx"` or `--filter="STATUS!=4xx"`
- You cannot combine patterns: `--filter="STATUS=4xx,5xx"` won't work

4. **Document Your Filters**: Add comments in your CI configuration explaining complex filters:
```yaml
jobs:
  test:
    # Run all API operations except user creation
    filter: "!(PATH=/users && METHOD=POST)"
```

## Using Filters in CI/CD

### GitHub Actions Example
```yaml
name: API Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Specmatic Tests
        run: |
          specmatic test --filter="STATUS!=5xx && PATH=/api/*"
```

### Jenkins Pipeline Example
```groovy
pipeline {
    agent any
    stages {
        stage('API Tests') {
            steps {
                sh 'specmatic test --filter="METHOD=GET && STATUS!=500"'
            }
        }
    }
}
```

## Troubleshooting Common Issues

1. **Status Code Rules**: Remember the difference between specific codes and patterns
   - Correct: `--filter="STATUS=200,202,404"` (specific codes)
   - Correct: `--filter="STATUS=4xx"` (single pattern)
   - Incorrect: `--filter="STATUS=4xx,5xx"` (multiple patterns)

2. **Syntax Errors**: Ensure all parentheses are properly matched and operators are correctly placed
   - Correct: `--filter="(PATH=/users || PATH=/products) && METHOD=GET"`
   - Incorrect: `--filter="(PATH=/users || PATH=/products && METHOD=GET"`

3. **Path Matching**: Be careful with trailing slashes and wildcards
   - Consider: `--filter="PATH=/api/*"`

4. **Headers and Query Parameters**: Ensure exact matches for header and query parameter names
   - Correct: `--filter="HEADERS=Authorization"`
   - Correct: `--filter="QUERY-PARAMS=sortBy"`