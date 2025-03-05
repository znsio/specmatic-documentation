---
layout: default
title: Dictionary
parent: Documentation
nav_order: 8
---
Dictionary
==============

- [Dictionary](#dictionary)
  - [Structure](#structure)
    - [Basic Field Mapping](#basic-field-mapping)
    - [Nested Properties](#nested-properties)
    - [Handling Arrays](#handling-arrays)
    - [Referencing Other Schemas](#referencing-other-schemas)
  - [Dictionary with Contract Testing](#dictionary-with-contract-testing)
    - [Create the Specification](#create-the-specification)
    - [Create the Dictionary](#create-the-dictionary)
      - [Run the tests](#run-the-tests)
      - [Generative Tests](#generative-tests)
  - [Dictionary with Service Virtualization](#dictionary-with-service-virtualization)
    - [Create the Specification](#create-the-specification-1)
    - [Create the Dictionary](#create-the-dictionary-1)
    - [Run Service Virtualization](#run-service-virtualization)
    - [Making Requests](#making-requests)
  - [Dictionary with Examples Command](#dictionary-with-examples-command)

When Specmatic needs to generate requests for tests or responses for stubs and cannot find any examples, it will create them using the structure and keys defined by the schema in the OpenAPI specifications. It will populate the structure with random values based on the same schema. While the generated value will be schema-valid, it will lack meaningful values derived from the context of your business domain.

The dictionary offers a method to retrieve domain-specific values in the absence of examples. You can provide a dictionary of values to Specmatic, which will reference this dictionary when generating a request or response.

**Note:** The naming convention for the dictionary file should be `<spec-name>_dictionary.json` where `<spec-name>` is the name of the specification file. 

## Structure

The dictionary is a JSON file that defines a mapping where keys represent schema fields using a syntax similar to JSONPath. This structured approach enables precise field references within complex objects.

### Basic Field Mapping

For instance, consider the `Employee` schema defined as follows:

```yaml
components:
  schemas:
    Employee:
      type: object
      properties:
        name:
          type: string
```

A corresponding dictionary entry referencing the `name` property would be structured as:

```json
{
  "Employee.name": "Jackie"
}
```

### Nested Properties

When dealing with nested structures, the key extends using the `.` character as a separator to reflect property hierarchy.

For example, given the following schema:

```yaml
components:
  schemas:
    Employee:
      type: object
      required:
        - name
      properties:
        name:
          type: object
          required:
            - first_name
          properties:
            first_name:
              type: string
```

The corresponding dictionary entry would be:

```json
{
  "Employee.name.first_name": "Jackie"
}
```

### Handling Arrays

For properties that are arrays, values can be referenced using the `[*]` notation to indicate elements within the array.

Consider this schema:

```yaml
components:
  schemas:
    Employee:
      type: object
      required:
        - addresses
      properties:
        addresses:
          type: array
          items:
            type: object
            required:
              - street
            properties:
              street:
                type: string
```

To reference the `street` property within the `addresses` array, the dictionary entry would be:

```json
{
  "Employee.addresses[*].street": "Baker Street"
}
```

**Note:** This hierarchical notation functions correctly as long as the referenced property (e.g., `street`) does not exist as a top-level key within an entity.

### Referencing Other Schemas

In cases where a schema references another schema using `$ref`, the referenced properties are accessed directly via their schema name.

For example:

```yaml
components:
  schemas:
    Employee:
      type: object
      required:
        - addresses
      properties:
        addresses:
          type: array
          items:
            $ref: '#/components/schemas/Address'
    Address:
      type: object
      required:
        - street
      properties:
        street:
          type: string
```

The dictionary entry for the `street` property within the `Address` schema is:

```json
{
  "Address.street": "Baker Street"
}
```

## Dictionary with Contract Testing

Dictionary can be used with contract testing, in which case specmatic will use the values provided in the dictionary when generating requests for tests, To understand how this works, lets take a look at the following example:

### Create the Specification 

Create an OpenApi Specification file named `employees.yaml` as follows:
```yaml
openapi: 3.0.0
info:
  title: Employees
  version: '1.0'
servers: []
paths:
  /employees:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EmployeeDetails'
      responses:
        200:
          description: Employee Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Employee'

        400:
          description: Bad Request
components:
  schemas:
    Employee:
      type: object
      required:
        - id
        - name
        - department
      properties:
        id:
          type: integer
        employeeCode:
          type: string
        name:
          type: string
        department:
          type: string

    EmployeeDetails:
      type: object
      required:
        - name
        - department
      properties:
        name:
          type: string
        department:
          type: string
        employeeCode:
          type: string
```

###  Create the Dictionary 

Now create a dictionary file named `employees_dictionary.json` in the same directory:

```json
{
  "EmployeeDetails.name": "John Doe",
  "EmployeeDetails.department": "IT",
  "EmployeeDetails.employeeCode": "12345"
}
```

#### Run the tests
Now to execute contract tests on the specification using the dictionary a service is required, we will utilize [service-virtualization](/documentation/service_virtualization_tutorial.html) for this purpose.

{% tabs test %}
{% tab test java %}
```shell
java -jar specmatic.jar stub employees.yaml
```
{% endtab %}
{% tab test npm %}
```shell
npx specmatic stub employees.yaml
```
{% endtab %}
{% tab test docker %}
```shell
docker run -v "$(pwd)/employees.yaml:/employees.yaml" -v "$(pwd)/employees_dictionary.yaml:/employees_dictionary.yaml" znsio/specmatic stub "employees.yaml"
```
{% endtab %}
{% endtabs %}

Next, execute the contract tests by running the following command:

{% tabs test %}
{% tab test java %}
```shell
java -jar specmatic.jar test employees.yaml
```
{% endtab %}
{% tab test npm %}
```shell
npx specmatic test employees.yaml
```
{% endtab %}
{% tab test docker %}
```shell
docker run -v "$(pwd)/employees.yaml:/employees.yaml" -v "$(pwd)/employees_dictionary.yaml:/employees_dictionary.yaml" znsio/specmatic test "employees.yaml"
```
{% endtab %}
{% endtabs %}

We can now examine the request sent to the service by reviewing the logs.
```shell
POST /employees
Accept-Charset: UTF-8
Accept: */*
Content-Type: application/json
{
  "name": "John Doe",
  "department": "IT",
  "employeeCode": "12345"
}
```
Notice that the values from the dictionary are utilized in the requests.

#### Generative Tests

As it's evident that only valid values can be included in the dictionary. hence, generative tests will ignore the values in the dictionary for the key being mutated.
The other keys will still retrieve values from the dictionary if available; otherwise, random values will be generated.

For instance, if you execute the specification with generative tests enabled, one of the request will appear as follows:
```shell
POST /employees
Accept-Charset: UTF-8
Accept: */*
Content-Type: application/json
{
  "name": null,
  "department": "IT",
  "employeeCode": "12345"
}
```

In this case, the key `name` is being mutated, which results in the value from the dictionary being disregarded.
While the values for `department` and `employeeCode` are still being retrieved from the dictionary.


## Dictionary with Service Virtualization

Dictionary can be used with service virtualization, in which case specmatic will use the values provided in the dictionary when generating responses for the incoming requests, To understand how this works, lets take a look at the following example:

### Create the Specification
Create an OpenApi Specification file named `employees.yaml` as follows:
```yaml
openapi: 3.0.0
info:
title: Employees
version: '1.0'
servers: []
paths:
/employees:
    patch:
    summary: ''
    requestBody:
        content:
        application/json:
            schema:
            $ref: '#/components/schemas/EmployeeDetails'
    responses:
        200:
        description: Employee Created Response
        content:
            application/json:
            schema:
                $ref: '#/components/schemas/Employee'
components:
schemas:
    Employee:
    type: object
    required:
        - id
        - name
        - department
        - designation
    properties:
        id:
        type: integer
        employeeCode:
        type: string
        name:
        type: string
        department:
        type: string
        designation:
        type: string

    EmployeeDetails:
    type: object
    required:
        - name
        - department
        - designation
    properties:
        name:
        type: string
        employeeCode:
        type: string

```

### Create the Dictionary
Now create a dictionary file named `employees_dictionary.json` in the same directory:

```json
{
  "Employee.id": 10,
  "Employee.name": "Jamie",
  "Employee.employeeCode" : "pqrxyz",
  "Employee.department": "Sales",
  "Employee.designation" : "Associate"
}
```

### Run Service Virtualization

To start service virtualization, use the following command:

{% tabs test %}
{% tab test java %}
```shell
java -jar specmatic.jar stub employees.yaml
```
{% endtab %}
{% tab test npm %}
```shell
npx specmatic stub employees.yaml
```
{% endtab %}
{% tab test docker %}
```shell
docker run -v "$(pwd)/employees.yaml:/employees.yaml" -v "$(pwd)/employees_dictionary.yaml:/employees_dictionary.yaml" znsio/specmatic stub "employees.yaml"
```
{% endtab %}
{% endtabs %}

### Making Requests

Execute the following curl command:
```shell
curl -X PATCH -H 'Content-Type: application/json' -d '{"name": "Jamie", "employeeCode": "pqrxyz"}' http://localhost:9000/employees
```

You'll get the following response:
```json
{
  "id": 10,
  "name": "Jamie",
  "employeeCode": "pqrxyz",
  "department": "Sales",
  "designation": "Associate"
  }
```

**Note:** None of the values mentioned above were included in any example file. They were generated by Specmatic from the dictionary while creating a response to return.

## Dictionary with Examples Command

You can also utilize dictionary with the examples command and the examples interactive server, allowing values to be retrieved from the dictionary for both request and response generation of examples, look at [generating examples](/documentation/contract_tests.html#generating-examples) for more details.
