<purpose>
Route freeform requests to the most relevant operations workflow command.
</purpose>

<routing_hints>
| Request shape | Route |
|---|---|
| initialize or restart planning | `/gsd:new-project` |
| understand an existing service | `/gsd:map-codebase` |
| clarify a phase | `/gsd:discuss-phase` |
| create a plan | `/gsd:plan-phase` |
| execute a phase | `/gsd:execute-phase` |
| validate operational outcomes | `/gsd:verify-work` |
| create runbooks | `/gsd:ops-runbook` |
| audit runbooks | `/gsd:ops-audit` |
| check status | `/gsd:progress` |
</routing_hints>
