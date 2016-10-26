---
layout: chapter
title: Answers for recitation, Oct 18/19
description:
custom_js: assets/js/save.js
---

<div id="autosaveTxt" style="font-style:italic">(This page will not save any changes)</div>

# Question 1: Fair coins and biased coins
**(a)**
> I flip a fair coin. What is the probability that it lands heads?

~~~~
var model = function() {
    flip() ? 'H' : 'T'
}
var log_prob = Infer({method:'enumerate'}, model).score('H')
print(Math.exp(log_prob))
~~~~

**(b)**
> I also have a biased coin, with $$\mathbb{P}(\text{Heads}) = 0.2$$. I hand you one of the coins (either biased or fair) without telling you which. You flip it three times.

Given that first two coin flips landed on heads, what is the posterior distribution for the next flip?
~~~~
var model = function() {
    var isBiased = flip()
    var pHeads = isBiased ? 0.2 : 0.5
    var flip1 = flip(pHeads) ? 'H' : 'T' 
    var flip2 = flip(pHeads) ? 'H' : 'T' 
    var flip3 = flip(pHeads) ? 'H' : 'T' 
    
    condition(flip1 == 'H')
    condition(flip2 == 'H')
    flip3
}
viz(Infer({method:'enumerate'}, model))
~~~~

**(c)**
Given that all three flips landed on heads, what is the probability that the coin was biased?
~~~~
var model = function() {
    var isBiased = flip()
    var pHeads = isBiased ? 0.2 : 0.5
    var flip1 = flip(pHeads) ? 'H' : 'T' 
    var flip2 = flip(pHeads) ? 'H' : 'T' 
    var flip3 = flip(pHeads) ? 'H' : 'T' 
    
    condition(flip1 == 'H')
    condition(flip2 == 'H')
    condition(flip3 == 'H')
    isBiased
}
var dist = Infer({method:'enumerate'}, model)
Math.exp(dist.score(true))
~~~~

**(d)**
Given that the first two flips were different, what is the probability that the third flip will be heads?
~~~~
var model = function() {
    var isBiased = flip()
    var pHeads = isBiased ? 0.2 : 0.5
    var flip1 = flip(pHeads) ? 'H' : 'T' 
    var flip2 = flip(pHeads) ? 'H' : 'T' 
    var flip3 = flip(pHeads) ? 'H' : 'T' 
    
    condition(flip1 != flip2)
    flip3
}
var dist = Infer({method:'enumerate'}, model)
Math.exp(dist.score('H'))
~~~~

# Question 2: Sprinklers, Rain and `mem`
**(a)**
> I have a particularly bad model of sprinkler in my garden. It is supposed to water my grass every morning, but is turns on only half the time (at random). Fortunately, I live in a city where it also rains 30% of days.

One day I check my lawn and see that it is wet, meaning that either it rained that morning or my sprinkler turned on (or both). What is the probability that it rained?
~~~~
var model = function() {
  var rain = flip(0.3)
  var sprinkler = flip()
  var wet = rain || sprinkler
  condition(wet)
  rain
}
var dist = Infer({method:'enumerate'}, model)
Math.exp(dist.score(true))
~~~~

**(b)**
What is the probability that my sprinkler turned on?
~~~~
var model = function() {
  var rain = flip(0.3)
  var sprinkler = flip()
  var wet = rain || sprinkler
  condition(wet)
  sprinkler
}
var dist = Infer({method:'enumerate'}, model)
Math.exp(dist.score(true))
~~~~

**(c)**
My neighbour Kelsey, whose has the same kind of sprinkler, tells me that her lawn was also wet that same morning. What is the new posterior probability that it rained?
~~~~
var model = function() {
  var rain = flip(0.3)
  var sprinkler = flip()
  var wet = rain || sprinkler
  var sprinklerKelsey = flip()
  var wetKelsey = rain || sprinklerKelsey
  
  condition(wet)
  condition(wetKelsey)
  rain
}
var dist = Infer({method:'enumerate'}, model)
Math.exp(dist.score(true))
~~~~

**(d)**
To investigate further we poll a selection of our friends who live nearby, and ask if their grass was wet this morning. Kevin and Manu and Josh, each with the same sprinkler, all agree that their lawns were wet too. Using `mem`, write a model to reason about arbitrary numbers of people, and then use it to find the new probability that it rained. `mem` is described in more detail in the [probmods textbook](https://probmods.org/v2/chapters/02-generative-models.html#persistent-randomness-mem).
~~~~
var model = function() {
  var rain = flip(0.3)
  var sprinkler = mem(function(person) {
    flip()
  })
  var wet = function(person) {
    rain || sprinkler(person)
  }

  condition(wet("me"))
  condition(wet("kelsey"))
  condition(wet("kevin"))
  condition(wet("manu"))
  condition(wet("josh"))
  rain
}
var dist = Infer({method:'enumerate'}, model)
Math.exp(dist.score(true))
~~~~

# Question 3: Arm wrestles and reusable models
Rather than rewrite the model every time we want to make a new query, we can define a reusable function to build each new model query for us (given a set of conditions or outputs). For example, the code below defines a generic model for reasoning about people's strength in arm wrestling tournaments. For simplicity, each person is assumed to be either strong or weak.

~~~~
var makeModelQuery = function(querier) {function() {
    var strong = mem(function(person) { //Is this person strong?
        flip()
    })
    var beats = function(personA, personB) { //Given a contest between personA and personB, does personA win?
        if(strong(personA) && !strong(personB)) {
            flip(0.8)
        } else if(strong(personB) && !strong(personA)) {
            flip(0.2)
        } else {
            flip(0.5)
        }
    }
    querier(strong, beats)
}}
editor.put("makeModelQuery", makeModelQuery)
~~~~ 

If we wanted to find the probability that Hillary is strong, given that she beats Josh, we could write 
~~~~
var makeModelQuery = editor.get("makeModelQuery")
var dist = Infer({method:'enumerate'}, makeModelQuery(function(strong, beats) {
    condition(beats("Hillary", "Josh"))
    strong("Hillary")
}))
Math.exp(dist.score(true))
~~~~

**(a)**
Find the probability that Hillary is strong, given that she and Donald both beat Josh. This is an example of *explaining away*, as discussed in class
~~~~
var makeModelQuery = editor.get("makeModelQuery")
var dist = Infer({method:'enumerate'}, makeModelQuery(function(strong, beats) {
    condition(beats("Hillary", "Josh"))
    condition(beats("Donald", "Josh"))
    strong("Hillary")
}))
Math.exp(dist.score(true))
~~~~

**(b)**
Find the probability that Kevin is strong, given that he beat Luke in two out of three arm wrestles.
~~~~
var makeModelQuery = editor.get("makeModelQuery")
var dist = Infer({method:'enumerate'}, makeModelQuery(function(strong, beats) {
    condition(beats("Kevin", "Luke"))
    condition(beats("Kevin", "Luke"))
    condition(beats("Luke", "Kevin"))
    strong("Kevin")
}))
Math.exp(dist.score(true))
~~~~

**(c)**
Find the probability that Kelsey will beat Kevin, given that Kevin beat Luke in two out of three arm wrestles.
~~~~
var makeModelQuery = editor.get("makeModelQuery")
var dist = Infer({method:'enumerate'}, makeModelQuery(function(strong, beats) {
    condition(beats("Kevin", "Luke"))
    condition(beats("Kevin", "Luke"))
    condition(beats("Luke", "Kevin"))
    beats("Kelsey", "Kevin")
}))
Math.exp(dist.score(true))
~~~~


<table>
<tr><td><a id="exportBtn"><button style="color:black">Export</button></a></td>
<td>Import: <input type="file" id="files" name="files[]" /></td></tr></table>