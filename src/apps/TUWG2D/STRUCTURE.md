# Structure
Model: the game logic and state.
View: a (visual) representation of the game model.

# Views
## Vue3
Objects:
- model
- parsed model
- view
The parsed model is the original model plus all computed properties needed by the view.
The view uses data pre-calculated to optimize rendering performance.