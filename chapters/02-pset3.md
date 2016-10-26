---
layout: chapter
title: Problem Set 3
description: Due Thursday, Nov 10
custom_js: assets/js/save.js
hidden: true
---
<script type="text/javascript">autosaveTo = "pset3"</script>

# Question 1: Preliminaries - Function recursing
> You and your friend are playing a game. You roll a dice repeatedly, and count up the sum of the rolls until it reaches *at least* 10. This sum then becomes your score (between 10 and 15).

How can we write out a generative model for this process, to perform inference? Probabilistic programming allows us to build models of structures, such as sequences or trees, by building them up with a recursive function:
~~~~
var fairDice = Categorical({vs: [1, 2, 3, 4, 5, 6], ps: [1/6, 1/6, 1/6, 1/6, 1/6, 1/6]})
var generateFrom = function(sequenceSoFar) {
  var roll = sample(fairDice)
  var sequence = sequenceSoFar.concat(roll)
  if(sum(sequence) >= 10) {
    sequence
  } else {
    generateFrom(sequence)
  }
}
editor.put("generateFrom", generateFrom)

var sequence = generateFrom([]) // [] is an empty list
print("Sequence: " + sequence)

var score = sum(sequence)
print("Score: " + score)
~~~~

**(a)**

What is the distribution for your final score in this game?
~~~~
var generateFrom = editor.get("generateFrom")
var model = function() {
  // Your code here
}
viz(Infer({method:'enumerate'}, model))
~~~~

**(b)**

What is the distribution on the total number of times you roll the dice.

*Hint: you can make use of the javascript property `length`*
~~~~
~~~~

**(c)**

What is the distribution of the value of your final roll, given that your score is at least 10?
~~~~
~~~~

# Question 2: The Casino Dealer Switching Game

> You enter a casino and walk up to a new game table. A suspicious looking dealer flips coins and participants predict whether the coin will land heads or tails. Observing many other players lose their money to the dealer, you notice a strange pattern in the coin flips. You suspect the dealer might be switching between two types of coins. You decide to use your probabilistic modeling skills to predict the next flip and beat the house for the first time.

To model the stochastic process according to which the dealer operates, you initially assume that there’s a fixed probability pswitch that on any given trial, the dealer will switch coins. You make the ‘Markov assumption’ that the dealer’s choice of coin at state t depends only on the coin used at the previous state, t−1, and the fixed probability pswitch. The probabilistic model where the current state of the world depends only on some previous latent state is called a Hidden Markov Model (HMM), since the outcome at the current state only depends on the previous state (Markov) which happens to be latent (or “hidden”). HMMs are widely used in computational biology (e.g. for gene recognition and alignment) and computational linguistics (e.g. for speech recognition and segmentation).

![HMM](../assets/img/pset2/hmm_dealer_switch.png)

*Figure 1: Graphical model representation of the casino dealer switching game.*

| Switching Probabilities                         | Coin Weights                                                     |
| :---------------------------------------------: | :--------------------------------------------------------------: |
| Coin 1 → Coin 2: $$p_{1 \rightarrow 2} = 0.15$$  | $$\theta_1 = \mathbb{P}(\text{Heads} \mid \text{Coin 1}) = 0.3$$ |
| Coin 2 → Coin 1: $$p_{2 \rightarrow 1} = 0.15$$  | $$\theta_2 = \mathbb{P}(\text{Heads} \mid \text{Coin 2}) = 0.7$$ |

*Table 1: Switching probabilities and dealer’s coin weights.*

**(a)**

Write WebPPL code to sample from this generative process, given some number `n` of coin faces. Your code should sample both the dealer's choice of coin and the face each flip lands on.
~~~~
var n = 10
// Your code here

print("Coins: " + coins) // Print the dealer's coin choices, as a list of length n
print("Faces: " + faces) // Print the list of coin faces, as a list of length n
~~~~

**(b)**

Suppose we observe the following sequence of coin faces:

`H H H H T H H T T T T`

We are interested in inferring which coin was used for each flip. Using the code you wrote above, use WebPPL to infer the dealer's chosen sequence of coins, conditioned on this sequence of observations. You can use the function `viz.casino` to visualise the marginals of this distribution.

~~~~
var observations = ['H', 'H', 'H', 'H', 'T', 'H', 'H', 'T', 'T', 'T', 'T', 'H', 'H']
var model = function() {
  // Your code here
  return coins
}
editor.put("model", model)
var dist = Infer({method:"enumerate"}, model)
viz.casino(observations, dist)
~~~~

**(c)**

Now try copying your code into the box below, to run inference on a longer sequence of observations. 

~~~~
var observations = ['H', 'H', 'H', 'H', 'H', 'T', 'T', 'T', 'T', 'T', 'T', 'H', 'H', 'H', 'H', 'T', 'T', 'T']
// Your code here
~~~~

You will find that, on this longer sequence, the inference algorithm takes an unreasonably long time to output the posterior distribution. So far, all our calls to `Infer` have used `{method:"enumerate"}`, which calculates exact posterior probabilities by summing over all sequences of random choices that could have been made. For sequences like the one above, this means summing over all $$2^{36}$$ possibilities.

In such situations, WebPPL has a variety of [inbuilt approximate inference algorithms](http://webppl.readthedocs.io/en/master/inference/index.html), which involve sampling latent variables rather than enumerating over all possibilities. One such algorithm is Metropolis-Hastings, which Josh has covered in class.

Modify the code above so that `Infer` uses Metropolis Hastings for inference, using 10000 samples. This should be able to generate an approximate posterior within in a few seconds.

**(d)**

When running the code above, you probably see a warning:

`Initialization warning [1/4]: Trace not initialized after 1000 attempts.`

This is because in order to initialise the search, Metropolis-Hastings has to find at least a setting for the random choices which has non-zero posterior probability. It attempts this by sampling from the prior until it lands on a state which satisfies all of the conditions (i.e. until it happens to sample the correct sequence of coin faces). For sequences much longer than the one above, Metropolis-Hastings will fail to initialise.

We can rewrite the model above to fix this problem. Rather than sampling latent variables for faces solely to condition on their particular values, we can use the `observe` keyword to directly add each $$\mathbb{P}(\text{observation} \mid \text{coin})$$ as a likelihood factor. `observe` is descibed in the [probmods textbook](https://probmods.org/v2/chapters/03-conditioning.html#conditions-observations-and-factors).

In the codebox below, rewrite your model using `observe`, so that inference behaves well with much longer sequences.
~~~~
var observations = ['T', 'T', 'H', 'T', 'T', 'T', 'T', 'H', 'T', 'H', 'H', 'H', 'T', 'T',
                    'T', 'T', 'H', 'T', 'H', 'T', 'T', 'H', 'H', 'H', 'H', 'T', 'T', 'T']
// Your code here
~~~~