---
layout: chapter
title: Recitation, Oct 18/19
description: (optional)
custom_js: assets/js/save.js
---

<script type="text/javascript">autosaveTo = "recitation_oct18"</script>

<div id="autosaveTxt" style="font-style:italic"></div>

# Question 1: Fair coins and biased coins
**(a)**
> I flip a fair coin. What is the probability that it lands heads?

~~~~
var model = function() {
	// Your code here
}
var log_prob = Infer({method:'enumerate'}, model).score('H')
Math.exp(log_prob)
~~~~

**(b)**
> I also have a biased coin, with $$\mathbb{P}(\text{Heads}) = 0.2$$. I hand you one of the coins (either biased or fair) without telling you which. You flip it three times.

Given that first two coin flips landed on heads, what is the posterior distribution for the next flip?
~~~~
var model = function() {
	// Your code here
}
viz(Infer({method:'enumerate'}, model))
~~~~

**(c)**
Given that all three flips landed on heads, what is the probability that the coin was biased?
~~~~
~~~~

**(d)**
Given that the first two flips were different, what is the probability that the third flip will be heads?
~~~~
~~~~

# Question 2: Sprinklers, Rain and `mem`
**(a)**
> I have a particularly bad model of sprinkler in my garden. It is supposed to water my grass every morning, but is turns on only half the time (at random). Fortunately, I live in a city where it also rains 30% of days.

One day I check my lawn and see that it is wet, meaning that either it rained that morning or my sprinkler turned on (or both). What is the probability that it rained?
~~~~
~~~~

**(b)**
What is the probability that my sprinkler turned on?
~~~~
~~~~

**(c)**
My neighbour Kelsey, whose has the same kind of sprinkler, tells me that her lawn was also wet that same morning. What is the new posterior probability that it rained?
~~~~
~~~~

**(d)**
To investigate further we poll a selection of our friends who live nearby, and ask if their grass was wet this morning. Kevin and Manu and Josh all agree that their lawns were wet too. Using `mem`, write a model to reason about arbitrary numbers of people, and then use it to find the new probability that it rained. `mem` is described in more detail in the [probmods textbook](https://probmods.org/v2/chapters/02-generative-models.html#persistent-randomness-mem).
~~~~
~~~~

# Question 3: Arm wrestles and reusable models
Rather than rewrite the model every time we want to make a new query, we can define a reusable function to build each new model query for us (given a set of conditions or outputs). For example, the code below defines a generic model for reasoning about people's strength in arm wrestling tournaments. For simplicity, each person is assumed to be either strong or weak.

~~~~
var makeModelQuery = function(querier) {return function() {
    var strong = mem(function(person) { //Is this person strong?
    	return flip()
    })
    var beats = function(personA, personB) { //Given a contest between personA and personB, does personA win?
    	if(strong(personA) && !strong(personB)) {
    		return flip(0.8)
    	} else if(strong(personB) && !strong(personB)) {
    		return flip(0.2)
    	} else {
    		return flip(0.5)
    	}
	}
    return querier(strong, beats)
}}
editor.put("makeModelQuery", makeModelQuery)
~~~~ 

If we wanted to find the probability that Hillary is strong, given that she beats Josh, we could write 
~~~~
var makeModelQuery = editor.get("makeModelQuery")
var dist = Infer({method:'enumerate'}, makeModelQuery(function(strong, beats) {
	condition(beats("Hillary", "Josh")
	return(strong("Hillary"))
}))
return Math.exp(dist.score(true))
~~~~

**(a)**
Find the probability that Hillary is strong, given that she and Donald both beat Josh. This is an example of *explaining away*, as discussed in class
~~~~
~~~~

**(b)**
Find the probability that Kevin is strong, given that he beat Luke in two out of three arm wrestles.
~~~~
~~~~

**(c)**
Find the probability that Kelsey will beat Kevin, given that Kevin beat Luke in two out of three arm wrestles.
~~~~
~~~~


<table>
<tr><td><a id="exportBtn"><button style="color:black">Export</button></a></td>
<td>Import: <input type="file" id="files" name="files[]" /></td></tr></table>