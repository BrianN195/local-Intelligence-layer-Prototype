# Example: Crows and Holy — interactive show activation

> **Status:** Application concept. This example describes a possible experience using the Local Intelligence Layer. It does not establish that smartphone motion detection, signal orchestration, or show visualization is already implemented.

## Goal

Crows could use the Local Intelligence Layer for a live show and commercial brand activations. The example is Holy, a maker of drink powder that is mixed with water and shaken to make a drink.

The product-related action—shaking a drink shaker—becomes a shared audience choreography. The audience initiates the action, while the software coordinates how it advances and makes that progress visible as part of the show.

## Setup: 3 × 3 Neighborhoods, each with 3 × 3 Agents

The stage or audience display shows a grid of nine Neighborhoods. Each Neighborhood contains nine Agents. The three flavor groups—**cherry**, **woodruff**, and **watermelon**—each occupy one column. The three Neighborhoods in a column form the bottle's three levels, from bottom to top.

```text
                         SHOW DISPLAY
                 Cherry    Woodruff    Watermelon
Top                [NH]       [NH]          [NH]
Middle             [NH]       [NH]          [NH]
Bottom             [NH]       [NH]          [NH]
                    ↑          ↑              ↑
             Fill level rises from bottom to top
```

Each `[NH]` contains a 3 × 3 Agent grid. How Agents map to people, devices, or virtual participants depends on the specific show implementation.

## Activation flow

1. **Start signal:** The bottom Neighborhoods are activated. Their Agents prompt the corresponding participants to shake their smartphones like shakers.
2. **Detect movement:** An app or connected detection service checks an agreed criterion, such as a minimum number of shakes or detected movement intensity within a time window.
3. **Threshold reached:** Once the threshold is met, the participant raises their smartphone overhead. This gesture confirms completion and causes the Agent to emit a Signal.
4. **Pass the Signal on:** The Signal activates the appropriately connected Agent in the Neighborhood above. That Agent begins the next part of the choreography and prompts the participants there to shake.
5. **Show the fill level:** Activation climbs upward level by level. Agents or Neighborhoods light up on the show display; from above, it looks as if a Holy bottle is filling.
6. **Finish:** When the top level is reached, the experience can trigger a shared animation, jingle, or call to action.

The three flavor columns can run independently or in sync. For example, the show could reveal which group fills its column first, or synchronize all groups for a shared finale.

## What the Local Intelligence Layer contributes

- **Local reactions:** Each Agent responds to a local event, rather than requiring a central sequence to control every participant directly.
- **Signal propagation:** Confirmed progress can be passed selectively to the next level.
- **Configurable rules:** Shake thresholds, time windows, repetitions, and transition conditions can be configured as experiment rules.
- **Live visualization:** Aggregated Agent and Neighborhood states can drive the fill-level display and show group progress.
- **Reusability:** The same pattern can be adapted for other products, brands, stage visuals, and audience interactions.

## Commercial use and measuring success

As a brand activation, the experience can turn a product message into a shared action. Possible aggregated metrics include:

- share of activated participants who complete the task
- time to reach each level and fill the entire bottle
- completion rate by flavor group
- number of Signals emitted and repeat participation
- response to different thresholds or show sequences

These metrics can help Crows and the brand partner compare choreography or activation variants. They should only be collected when measurement is transparently explained and necessary for the purpose.

## Privacy, safety, and accessibility

- Participation should be voluntary, with a clear explanation before activation.
- If smartphone motion detection is used, the app should process only the movement data needed to evaluate the threshold. Storing raw data or linking it to an identifiable person is not necessary for an aggregated show visualization.
- Thresholds and time windows should be safe and adaptable to different abilities. An alternative gesture or manual confirmation can allow participation without shaking.
- The smartphone gesture should be performed with adequate space and without throwing or swinging the device dangerously.
- The show should continue even if some devices are offline or some participants choose not to take part.

## Implementation boundary

The Local Intelligence Layer could orchestrate Agent and Neighborhood states, rules, and Signal propagation. Detecting smartphone motion, connecting to a show display, and rendering updates in real time require suitable app, hardware, or integration components. These interfaces and actual performance would need to be validated separately before a live deployment.
