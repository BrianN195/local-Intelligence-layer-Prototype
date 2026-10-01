# Repositories

Repositories kapseln den Zugriff auf die aktuelle In-Memory-Datenhaltung.

- `experimentRunRepository.js`: globale ExperimentRuns aus `store.js`
- `agentRepository.js`: Agents innerhalb eines ExperimentRuns
- `neighborhoodRepository.js`: Neighborhoods innerhalb eines ExperimentRuns
- `rulesetRepository.js`: RuleSets innerhalb eines ExperimentRuns
- `ruleRepository.js`: Rules innerhalb eines RuleSets
- `signalRepository.js`: Signals innerhalb eines ExperimentRuns

Die Repositories enthalten keine Regel-, Simulations- oder HTTP-Logik. Später kann die Implementierung schrittweise durch Mongoose ersetzt werden.
