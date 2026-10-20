# Configuration documentation: readiness after the ten-minute pass

20 October 2026. Timed window: 10:33:12–10:43:12 IST (05:03:12–05:13:12 UTC).

**Reviewable build; the full original documentation goal is not complete.** This report records the bounded finalization pass, not certification of every configuration consumer.

## What is available

- All **289 canonical keys /301 declarations /1,064 placements** are inventoried in the explorer and static reference.
- **236 keys have scoped, source-backed behavior notes; 53 remain open.** The pass started at 199 reviewed keys and added 37. The earlier structural-container review is also retained.
- Existing task landing, explorer, starter builder, browser-local inspector, protocol guides and executable recipes remain available.
- New guidance distinguishes discriminator requiredness, selected contracts versus option overrides, mock origins, logging fields with no confirmed core accessor effect, general boolean precedence and example-directory naming templates.
- Complete-guide links are separate from labels claiming a runtime-tested example. Source-backed notes do not become execution evidence merely by linking a guide.

## Verification in this pass

| Check | Result | Scope |
|---|---|---|
| npm run check:config | 64 passed; zero failed/skipped | Catalog freshness, validator and focused catalog/explorer/builder/inspector checks |
| npm run build:verified | Passed | Production build and internal links/hashes: 1,983 links /332 HTML files |
| git diff --check | Passed | Tracked changes; no claim of exhaustive code review |
| Alias and omitted-key journey | Passed in final browser preview | logPrefix selects canonical logFilePrefix; omission behavior and scope are visible |
| No-results recovery | Passed | Zero results → Show all keys restores 289 keys without losing the selected detail |
| Shared-component keyboard journey | Passed | localContracts → booksGateway shows the test use site; browser Back returns to localContracts with heading focus |
| Starter copying | Passed | Actual clipboard YAML equals the default generated mock file byte-for-byte (341 characters) |
| Invalid-file recovery | Passed | Missing definitions produces a path-specific correction; pasting the copied starter clears available-check issues without claiming runtime validity |
| Mobile/themes | Passed for the inspected detail | prettyPrint omission guidance renders at 390 px in light and dark themes; document and scroll widths both 390; viewport/theme restored |
| Browser console | No warnings/errors observed | Final review tab; this is not proof of every interaction/platform |

The first local preview connection failed before the server was ready; a fresh supported browser tab using 127.0.0.1 recovered. A comparison against concatenated syntax-highlight DOM text initially omitted line breaks; direct comparison with the generated YAML confirms the clipboard bytes. Neither observation is presented as a product defect.

## Open release and source review

Published execution evidence remains scoped to **OSS 2.55.3 / Enterprise 1.28.3**, as recorded in source-manifest.json. The cached Enterprise artifact is now **1.28.4 / core 2.55.4**; no historical run was relabeled and no expanded runtime suite was claimed for that cache.

Six tracked core consumers differ from the recorded research baseline: OpenApiSpecification, Feature, HttpHeadersPattern, TabularPattern, HttpStub and ThreadSafeListOfStubs. The baseline was not silently refreshed. Review these changes before attaching new source/release evidence. The reviewed V3 models/accessors used for this pass were unchanged against the recorded fingerprints.

## Exact key-level work remaining

These keys remain in the catalog with schema guidance and an explicit pending runtime review. They are not marked unsupported or completed merely because they are unverified.

| Key | Required follow-up |
|---|---|
| `AdapterConfiguration/post_specmatic_response_processor` | Trace the actual hook/processor consumer, accepted spelling, execution order, process I/O and path base. |
| `AdapterConfiguration/postSpecmaticResponseProcessor` | Trace the actual hook/processor consumer, accepted spelling, execution order, process I/O and path base. |
| `AdapterConfiguration/pre_specmatic_request_processor` | Trace the actual hook/processor consumer, accepted spelling, execution order, process I/O and path base. |
| `AdapterConfiguration/pre_specmatic_response_processor` | Trace the actual hook/processor consumer, accepted spelling, execution order, process I/O and path base. |
| `AdapterConfiguration/preSpecmaticRequestProcessor` | Trace the actual hook/processor consumer, accepted spelling, execution order, process I/O and path base. |
| `AdapterConfiguration/preSpecmaticResponseProcessor` | Trace the actual hook/processor consumer, accepted spelling, execution order, process I/O and path base. |
| `AdapterConfiguration/stub_load_contract` | Trace the actual hook/processor consumer, accepted spelling, execution order, process I/O and path base. |
| `AdapterConfiguration/stubLoadContract` | Trace the actual hook/processor consumer, accepted spelling, execution order, process I/O and path base. |
| `AdapterConfiguration/test_load_contract` | Trace the actual hook/processor consumer, accepted spelling, execution order, process I/O and path base. |
| `AdapterConfiguration/testLoadContract` | Trace the actual hook/processor consumer, accepted spelling, execution order, process I/O and path base. |
| `AsyncApiCommonRunOptions/schemaRegistry` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `AsyncApiRunOptionSpecificationCommon/inMemoryBroker` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `AsyncApiRunOptionSpecificationCommon/overlayFilePath` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `AsyncApiRunOptionSpecificationCommon/schemaRegistry` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `AsyncClientProperties/consumer` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `AsyncClientProperties/producer` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `AsyncClientServerConfig/adminCredentials` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `AsyncClientServerConfig/client` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `AsyncServerReferenceConfig/adminCredentials` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `AsyncServerReferenceConfig/client` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `AsyncServerWrapper/server` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `DataDefinition/adapters` | Trace the actual hook/processor consumer, accepted spelling, execution order, process I/O and path base. |
| `Governance/report` | Trace report creation and coverage enforcement, omission/threshold semantics, output path and command-specific behavior. |
| `Governance/successCriteria` | Trace report creation and coverage enforcement, omission/threshold semantics, output path and command-specific behavior. |
| `InMemoryBrokerConfiguration/host` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `InMemoryBrokerConfiguration/logDir` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `InMemoryBrokerConfiguration/port` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `LicenseDefinition/path` | Trace the consuming license/governance entry point and its file/environment/CLI precedence. |
| `OpenApiRunOptionSpecification/actuatorUrl` | Trace the selected OpenAPI consumer, omission and per-spec/service/CLI interaction; verify the affected behavior. |
| `OpenApiRunOptionSpecification/overlayFilePath` | Trace the selected OpenAPI consumer, omission and per-spec/service/CLI interaction; verify the affected behavior. |
| `OpenApiRunOptionSpecification/swaggerUiBaseUrl` | Trace the selected OpenAPI consumer, omission and per-spec/service/CLI interaction; verify the affected behavior. |
| `OpenApiRunOptionSpecification/swaggerUrl` | Trace the selected OpenAPI consumer, omission and per-spec/service/CLI interaction; verify the affected behavior. |
| `OpenApiTestRunOptions/actuatorUrl` | Trace the selected OpenAPI consumer, omission and per-spec/service/CLI interaction; verify the affected behavior. |
| `OpenApiTestRunOptions/swaggerUiBaseUrl` | Trace the selected OpenAPI consumer, omission and per-spec/service/CLI interaction; verify the affected behavior. |
| `OpenApiTestRunOptions/swaggerUrl` | Trace the selected OpenAPI consumer, omission and per-spec/service/CLI interaction; verify the affected behavior. |
| `OpenApiTestRunOptions/workflow` | Trace the selected OpenAPI consumer, omission and per-spec/service/CLI interaction; verify the affected behavior. |
| `ProxyDefinition/adapters` | Verify the proxy consumer for adapters, TLS or interception; preserve the documented recording/redaction boundaries. |
| `ProxyDefinition/cert` | Verify the proxy consumer for adapters, TLS or interception; preserve the documented recording/redaction boundaries. |
| `ProxyDefinition/mock` | Verify the proxy consumer for adapters, TLS or interception; preserve the documented recording/redaction boundaries. |
| `ReportsDefinition/formats` | Trace report creation and coverage enforcement, omission/threshold semantics, output path and command-specific behavior. |
| `ReportsDefinition/outputDirectory` | Trace report creation and coverage enforcement, omission/threshold semantics, output path and command-specific behavior. |
| `SchemaRegistryProperties/kind` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `SchemaRegistryProperties/password` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `SchemaRegistryProperties/url` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `SchemaRegistryProperties/username` | Review the selected binding/runner, broker or registry requirements, credentials, inheritance and effective defaults; verify affected runtime claims. |
| `SpecmaticDefinition/governance` | Trace the consuming license/governance entry point and its file/environment/CLI precedence. |
| `SpecmaticDefinition/license` | Trace the consuming license/governance entry point and its file/environment/CLI precedence. |
| `SuccessCriteriaDefinition/enforce` | Trace report creation and coverage enforcement, omission/threshold semantics, output path and command-specific behavior. |
| `SuccessCriteriaDefinition/maxMissedOperationsInSpec` | Trace report creation and coverage enforcement, omission/threshold semantics, output path and command-specific behavior. |
| `SuccessCriteriaDefinition/minCoveragePercentage` | Trace report creation and coverage enforcement, omission/threshold semantics, output path and command-specific behavior. |
| `WorkflowConfiguration/ids` | Trace workflow operation selection, extraction/substitution and missing-value failure behavior. |
| `WorkflowIDOperation/extract` | Trace workflow operation selection, extraction/substitution and missing-value failure behavior. |
| `WorkflowIDOperation/use` | Trace workflow operation selection, extraction/substitution and missing-value failure behavior. |

## Other acceptance work still open

- Remaining operation/protocol/edition and broker/provider rows in [the acceptance matrix](configuration-acceptance-matrix.md), including applicability filters.
- Full reader/design checkpoint, spoken screen-reader walkthrough, contrast/touch/reduced-motion audit and recorded performance budgets. The scoped implementation checks above do not close those requirements.
- Final old-content/navigation/legacy audit, advanced reference/path/template/override interactions and the release-update workflow audit.
- Final comprehensive CI-equivalent runtime verification against the chosen release baseline. No runtime examples, dependencies, product runtime or deployment were changed in this pass.

## Review and reproduce

Local preview: http://127.0.0.1:3017/references/configuration

From this docs checkout, use the existing npm scripts:

```sh
npm run check:config
npm run build:verified
npm run serve -- --host 127.0.0.1 --port 3017
```

Edit reviewed explanations in src/data/configuration/field-behavior.json, regenerate with scripts/build-config-catalog.js, and keep source/release evidence scoped. Do not run the source recorder to hide the drift described above. Local detailed receipts are supplementary: ../enterprise/temp/config-audit/docs-ten-minute-focused.log, docs-ten-minute-build.log, docs-ten-minute-source-drift.json and docs-ten-minute-mobile.jpg.
