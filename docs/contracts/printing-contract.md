# Printing Contract

Status: STABLE (Phase 00)
Owner: Person 1

## Principle

Business logic never talks to a printer driver/library directly. It calls a
`PrintService` interface; the concrete implementation (ESC/POS thermal driver,
browser print dialog for A4, OS print spooler, etc.) is swapped behind that
interface. Phase 00 defines the interface only — no implementation.

## Interface (implementation-neutral pseudocode)

```text
interface PrintService {
  print(job: PrintJob): PrintResult
}

PrintJob {
  document_type: PrintDocumentType   // CUSTOMER_RECEIPT | KITCHEN_TICKET |
                                      // DELIVERY_RECEIPT | END_OF_DAY_REPORT |
                                      // CASHIER_CLOSING
  target_format: PrintTargetFormat   // THERMAL_58MM | THERMAL_80MM | A4
  branch_id: UUID
  payload: JSON                      // document-type-specific rendering data,
                                      // built by the caller (e.g. Order for a
                                      // receipt), never the raw DB row
}

PrintResult {
  success: bool
  error_message: string | null
}
```

## Rules

- `PrintJob` is **not persisted** as a domain entity in Phase 00 (see
  `domain-entities.md` note). It's a transient request/response pair. If print-job
  history/retry-queue is needed later (e.g. for offline printing), that's an
  additive `PrintJobLog` entity, not a change to this interface.
- Each `document_type` has its own payload shape and its own template, documented
  in `docs/contracts/examples/` once templates exist (Phase 01+). Phase 00 only
  fixes the contract boundary (`PrintService.print()`), not the templates.
- `target_format` is chosen by the caller based on branch printer configuration
  (out of scope for Phase 00 — assume a branch has one configured default format
  per document type; a `BranchPrinterConfig` entity is a reasonable Phase 01
  addition, not built now since the brief only asks for the abstraction, not
  branch-level printer configuration).
- Localization: receipt text respects `Locale` (see localization-contract.md) —
  the payload builder, not `PrintService`, is responsible for localized strings.
