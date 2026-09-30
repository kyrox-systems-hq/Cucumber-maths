# Cucumber: Next-Generation Computational Interface and Architecture



**Iteration:** CME-ARCH-20261001-001

## Executive thesis

Cucumber should not be designed as an AI spreadsheet, an AI notebook, a BI tool with chat, or a collection of mini versions of existing software. The product should start from a more fundamental question: if spreadsheets, notebooks, dashboards, DAX-style modelling and traditional automation builders had never existed, what would a computational workspace designed today around AI agents look like?

The emerging answer is a fluid, document-like surface where prose, tables, equations, models, simulations, charts, automations, claims and other computational objects can coexist. Each object receives the smallest and most natural interface for manipulating that type of thing. Underneath the surface, these objects are connected through a typed analytical state graph, an execution layer and an immutable computation ledger.

The document is not the primitive. The table is not the primitive. The notebook cell is not the primitive. **The computational object is the primitive.** The visible interface is a projection of those objects and their relationships.

## 1. The problem Cucumber is trying to solve

Existing analytical software inherits decades of interface assumptions. Spreadsheets make the cell and its coordinate the core object. BI systems make dashboards, semantic models and specialised query languages central. Notebooks make cells and sequential execution central. Automation platforms make workflow nodes and connectors central. These interfaces are powerful, but they force users to represent their problems inside the software's historical abstraction.

Cucumber should reverse that relationship. Users should bring the thing they are working with and the system should provide the interface that thing needs. A customer table should behave like structured data. An equation should behave like mathematics. A simulation should expose parameters and distributions. An automation should become a flow. A claim should expose evidence, assumptions and verification. These objects should still live together inside one coherent workspace.

## 2. A fluid semantic document as the primary surface

The main user experience should feel as frictionless as writing in Markdown. A user opens a blank Cucumber project and can simply type. Ordinary prose remains ordinary prose. Specialised computational objects can be inserted inline without switching applications or entering a separate design mode.

For example, a commercial review could contain a heading, a paragraph explaining the business question, an interactive revenue chart, an editable customer table, a mathematical definition of retention, a forecast model, a small automation that monitors the conclusion, and an evidence-backed claim. All of those objects remain part of one readable document.

This should be document-like rather than literally Markdown underneath. The implementation should preserve typed structure, semantic identity, dependencies, provenance and executable behaviour. Markdown is the interaction inspiration: a calm, continuous surface in which writing is also navigation.

## 3. Polymorphic computational objects

Every embedded object should know what kind of thing it is and expose an interface appropriate to that type. The same workspace can therefore contain radically different interaction models without forcing the user into separate products.

### Tables

A table should support the work people currently use spreadsheets for without inheriting spreadsheet coordinates as the underlying model. Users can add rows or columns, reorder fields, set data types, filter, group, sort, create calculated fields, inspect quality, edit values and ask natural-language questions about selections.

A calculated field should be expressed in meaningful names rather than coordinates. Instead of formulas such as `C17*$B$4`, users work with concepts such as `gross_margin = revenue - cogs`. The table is structured data, not a two-dimensional grid pretending to be a database.

### Equations

An equation should open a mathematical interaction environment. Variables become named parameters. Users can solve, differentiate, integrate, plot, simulate, run sensitivity analysis or ask for explanations. Sliders or direct controls can modify parameters while downstream results update automatically.

Formal mathematical notation should remain first-class. Natural language should remove the requirement to use technical syntax when it adds no value, but it should not remove precision for users who want technical control.

### Automations

An automation should render as a flow rather than a table or a block of code. Triggers, conditions, actions and branches should be visually manipulable. An analytical conclusion can itself become a trigger, allowing workflows such as: when forecast revenue falls below a threshold, refresh the model, investigate the likely cause, notify the responsible team and create a follow-up task.

### Models and simulations

A statistical model should expose inputs, assumptions, coefficients, diagnostics and alternative specifications. A simulation should expose distributions, controllable parameters, scenarios and outcome ranges. The interface should be built around understanding and manipulating the model rather than merely presenting code that produced it.

### Charts and visual objects

Charts should be bidirectional. They are not merely outputs. Dragging a threshold, adjusting a confidence interval, changing a grouping or selecting a subset should mutate the underlying analytical object and trigger any required recomputation. The visual representation and the computational model are two views of the same state.

### Claims, metrics and conclusions

A claim should be a first-class object with provenance. It can show the statement, supporting evidence, assumptions, dependencies, contradictory evidence, verification status and the computations from which it was derived. A metric should similarly know its definition, owner, source, dependencies and alternative definitions.

## 4. Live semantic references

References such as `@Revenue`, `@Retention`, `@CustomerTable` or `@Forecast` should not behave like ordinary hyperlinks. They should be live semantic references to objects in the analytical graph.

Clicking a reference should reveal a compact inspector appropriate to the object. For a metric, that may include the definition, current value, previous value, source, owner and every computation or claim that depends on it. A user can open, change or trace the object without leaving the surrounding document.

This turns the document into a human-readable interface over a network of live computational objects rather than a static collection of text and embedded widgets.

## 5. Cucumber Language as a spectrum, not a new burden

The original Cucumber Language idea should survive, but it should not become another programming language users are forced to learn. It should exist as progressively more structured ways of expressing the same underlying analytical intent.

At the simplest level, a user writes natural language such as `show revenue by region`. A power user may use a concise semi-structured command such as `/group @Revenue by @Region`. A technical analyst may use a more formal Cucumber representation. An engineer can inspect the generated SQL, Python, R or other execution code.

All four interaction levels should mutate the same underlying object. Cucumber Language therefore becomes a human-readable view of the internal analytical representation rather than a compulsory syntax layer.

## 6. The analytical state graph

The core internal object should be a typed graph rather than a workbook, notebook or dashboard. Nodes can represent data sources, entities, definitions, assumptions, computations, models, evidence, claims, uncertainties, validations and automations. Edges can express relationships such as `depends_on`, `derived_from`, `uses_definition`, `assumes`, `supports`, `contradicts`, `validates` and `invalidates`.

A question such as why revenue declined can therefore produce a graph connecting source datasets, definitions of revenue and retention, joins, cleaning operations, a decomposition model, statistical evidence, assumptions, the resulting claim and any automation that monitors whether the claim remains true.

The document surface is only one projection of this graph. Other projections could include a dependency view, evidence view, audit view, scenario comparison or model diagnostics view.

## 7. First-class assumptions and definitions

Assumptions must never remain hidden inside generated code. Each important assumption should exist as an explicit object with a definition, source, reason, sensitivity and list of affected downstream computations and claims.

If Cucumber assumes that a customer is retained when another purchase occurs within 90 days, the user should be able to see that assumption, accept it, edit it or ask an appropriate owner to define it. Changing the value to 120 days should automatically identify every dependent result that has become stale and recompute only what is necessary.

Definitions should receive the same treatment. Recognised revenue and booked revenue, for example, should be separate semantic objects. When a user's question is ambiguous, Cucumber should surface the distinction rather than silently choosing a definition.

## 8. An epistemic layer

Cucumber should distinguish between kinds of knowledge. A source observation, deterministic calculation, statistical inference, assumption, hypothesis and conclusion are not equivalent and should not be flattened into the same confident paragraph.

The system should therefore type analytical statements. It should know whether something is directly observed, calculated from known inputs, inferred statistically, assumed by the agent, proposed as a hypothesis or supported strongly enough to be treated as a current claim.

This is not a fake confidence score. It is a structural account of why a statement exists and what evidence supports it.

## 9. Branching analytical reality

The graph architecture should allow users to branch an analysis at any important assumption, definition, model, dataset or scenario. One branch might use a 90-day retention definition while another uses 120 days. Another might use a different attribution model or exclude a promotion period.

Cucumber can then compare branches and answer higher-value questions such as: which conclusions remain true under all reasonable assumptions, which results are fragile, and which decisions depend on a particular modelling choice?

This turns sensitivity analysis and alternative specifications into normal interaction rather than specialised statistical work.

## 10. Verification as computation

The original computation ledger should evolve into an active verification system. Cucumber should not merely expose what the agent did. It should automatically test whether the analytical work is internally coherent.

Verification can include join cardinality checks, reconciliation to source totals, unexpected row-loss detection, missing-data warnings, statistical diagnostics, alternative model specifications, date coverage checks, unit consistency, definition consistency and causal-claim warnings.

For an important conclusion, Cucumber should also attempt adversarial analysis. It can vary reasonable assumptions, exclude influential periods, control for plausible confounders, try alternative models and determine whether the conclusion survives. The result should explain not just what the model found, but how robust the conclusion is.

## 11. Visible multi-agent disagreement

Multiple specialist agents can analyse the same question, but their disagreement should not disappear inside orchestration. A data agent might identify the dominant segment, a statistical agent might confirm significance, a causal agent might reject a causal interpretation, a domain agent might identify a relevant business event and an auditor agent might surface a confounder.

Cucumber should preserve these perspectives and synthesise them while making meaningful disagreement inspectable. Uncertainty becomes part of the product rather than something hidden behind a polished answer.

## 12. Living claims and monitored knowledge

Outputs should remain alive. A conclusion such as `customer retention has recovered above 85%` can become a persistent claim tied to live evidence and dependencies.

When new data arrives or a definition changes, Cucumber can re-evaluate the claim. If it is no longer supported, the system reports that the conclusion changed, shows the evidence responsible for the change and identifies downstream analyses or automations that may need attention.

This is different from refreshing a dashboard. The system is monitoring knowledge, not merely metrics.

## 13. One computational reality, multiple views

The same analytical state should be renderable differently for different roles without creating separate reports. An executive may see the headline result and business impact. Finance may see reconciliations and recognition assumptions. A data scientist may see model diagnostics. An auditor may see provenance, version hashes, approvals and exceptions.

These are not duplicated artefacts. They are different lenses over the same underlying computational reality.

## 14. Extensible object types and interaction grammars

The original open engine idea becomes more powerful if extensions are allowed to introduce new computational object types and their interaction grammar, not just new execution functions.

A genomics extension could define a sequence-alignment object with alignment, mutation and annotation interactions plus genome-browser and mutation-map views. A financial risk extension could define risk models, probability distributions, stress scenarios and sensitivity controls. An orbital mechanics extension could define trajectory objects, coordinate frames and parameter controls.

The extension therefore tells Cucumber what an object means, what operations it supports and which interfaces are appropriate. This allows the product to grow into new domains without the core team recreating an entire specialist application for each one.

## 15. The architecture

The proposed architecture has several distinct layers.

### Surface layer

A fluid semantic document where users write, insert, select and manipulate computational objects. It should remain readable when the specialised controls are collapsed.

### Semantic object layer

Typed objects such as `Table`, `Equation`, `Metric`, `Model`, `Simulation`, `Chart`, `Automation`, `Claim`, `Dataset` and extension-defined types. Each type defines its semantic properties and preferred interaction modes.

### Analytical state graph

The graph connecting objects, dependencies, definitions, assumptions, evidence, claims, validations and automation relationships.

### Cucumber intermediate representation

A canonical representation of analytical intent. Natural language, direct manipulation, Cucumber Language, imported code and external agents all compile to this representation. It can then compile out to DuckDB, SQL, Python, R, SymPy, GPU runtimes, APIs, external engines or future execution systems.

### Execution layer

Specialised engines perform deterministic or probabilistic computation. Agents decide what should happen, but execution should remain inspectable, versioned and reproducible wherever possible.

### Computation and provenance ledger

Every meaningful state mutation records inputs, outputs, code or operation, engine version, environment, assumptions, validations, provenance and dependencies. The ledger provides replay, audit, branching and historical comparison.

## 16. The central interface principle

Cucumber should never recreate a miniature Excel, miniature Zapier, miniature MATLAB or miniature Power BI inside the product. Doing that would simply transplant old software assumptions into a new shell.

For every object, the design question should be: **what is the smallest and most natural interface required to understand and manipulate this thing?** A table gets just enough table behaviour. An automation gets just enough flow behaviour. An equation gets mathematical manipulation. A chart gets visual editing. When the user clicks away, the object returns to a calm, readable representation inside the document.

## 17. Product philosophy

Traditional productivity software asks the user to learn the application's interface and then represent the problem inside it. Cucumber should do the opposite: **describe or insert the thing you are working with, and Cucumber gives that thing the interface it needs.**

This is the strongest continuation of the original Cucumber vision. It preserves the ambition to build a new computational architecture rather than placing AI on top of inherited spreadsheet or notebook abstractions, while extending that idea into a much more radical user-interface model.

## 18. What to prototype first

The first prototype should deliberately prove the architecture rather than attempt broad feature coverage.

Prototype one continuous document containing four native computational object types: an editable structured table, an equation with manipulable parameters, a simple analytical chart linked bidirectionally to the table, and a small automation whose trigger depends on a calculated or inferred result.

The same prototype should support live `@` references, natural-language actions, a minimal Cucumber command syntax, traceability from any visible result back to its source and computation, first-class assumptions, and one branch-and-compare interaction.

The critical demonstration is not that Cucumber can reproduce spreadsheet functions. It is that the user can move fluidly between prose, structured data, formal mathematics, visual analysis and automation without ever entering a spreadsheet, notebook or dashboard paradigm.

## 19. Success criteria for the next design cycle

The design is succeeding if a new user can perform meaningful analytical work without learning cell coordinates, notebook execution order, DAX, workflow-specific syntax or a separate dashboard-building mode.

It is also succeeding if advanced users can still reach the formal representations underneath, inspect generated code, use precise technical language, modify assumptions directly and reproduce the analytical state.

Most importantly, the interface should feel as though it was designed around the problem being worked on rather than around the history of the software category.

## 20. Open design questions

1. How much of the interface should be generated dynamically versus defined by stable object schemas?
2. What is the minimal universal object contract required for third-party object types?
3. How should Cucumber represent state when the same object is visible in several places at once?
4. Which mutations should be immediate and which require plan-review-execute behaviour?
5. How should uncertainty and conflicting analytical interpretations be visualised without overwhelming ordinary users?
6. How much formal Cucumber syntax is useful before it becomes another language users must learn?
7. How should a generated interface remain predictable enough that users can build muscle memory while still adapting to the computational object?
8. What are the first two or three domains where polymorphic computational objects create an advantage large enough to justify leaving established tools?
