# Question 2: The Casino Dealer Switching Game

> You enter a casino and walk up to a new game table. A suspicious looking dealer flips coins and participants predict whether the coin will land heads or tails. Observing many other players lose their money to the dealer, you notice a strange pattern in the coin flips. You suspect the dealer might be switching between two types of coins. You decide to use your probabilistic modeling skills to predict the next flip and beat the house for the first time.

To model the stochastic process according to which the dealer operates, you initially assume that there’s a fixed probability pswitch that on any given trial, the dealer will switch coins. You make the ‘Markov assumption’ that the dealer’s choice of coin at state k depends only on the coin used at the previous state, k−1, and the fixed probability pswitch. The probabilistic model where the current state of the world depends only on some previous latent state is called a Hidden Markov Model (HMM), since the outcome at the current state only depends on the previous state (Markov) which happens to be latent (or “hidden”). HMMs are widely used in computational biology (e.g. for gene recognition and alignment) and computational linguistics (e.g. for speech recognition and segmentation).

![HMM](../assets/img/pset2/hmm_dealer_switch.png)

*Figure 1: Graphical model representation of the casino dealer switching game.*

| Switching Probabilities                         | Coin Weights                                                     |
| :---------------------------------------------: | :--------------------------------------------------------------: |
| Coin 1 → Coin 2: $$p_{1 \rightarrow 2} = 0.15$$  | $$\theta_1 = \mathbb{P}(\text{Heads} \mid \text{Coin 1}) = 0.3$$ |
| Coin 2 → Coin 1: $$p_{2 \rightarrow 1} = 0.15$$  | $$\theta_2 = \mathbb{P}(\text{Heads} \mid \text{Coin 2}) = 0.7$$ |

*Table 1: Switching probabilities and dealer’s coin weights.*

**(a)**
Write this in WebPPL

~~~~
var model = function(observations) {
  var initial_coin_dist = Discrete({ps:[0.5, 0.5]})
  var coins = [
    {next_dist: Discrete({ps:[0.85, 0.15]}), face_dist: Discrete({ps:[0.7, 0.3]})},
    {next_dist: Discrete({ps:[0.15, 0.85]}), face_dist: Discrete({ps:[0.3, 0.7]})}
  ]

  var initial_coin = sample(initial_coin_dist)
  var continue_chain = function(chain) {
    if(chain.length == observations.length) {
      return chain
    } else {
      var last_coin = last(chain)
      var next_coin = sample(coins[last_coin].next_dist)
      return continue_chain(chain.concat(next_coin))
    }
  }
  
  
  var chain = continue_chain([initial_coin])
  map2(function(coin, obs) {
     factor(coins[coin].face_dist.score(obs))
  }, chain, observations)
  return chain
}
var obs = [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0]
var dist = Infer({method:"MCMC", samples:100, burn:100, lag:100, justSample:true}, function() {return model(obs)})
var getMarginal = function(i) {return listMean(map(function(sample) {sample.value[i]}, dist.samples))}
viz.foo(_.range(obs.length), map(getMarginal, _.range(obs.length)), obs)
~~~~