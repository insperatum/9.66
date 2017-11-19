---
layout: chapter
title: Webppl Basics to help you figure out bugs!
description: Webppl review with Python/Javascript comparisons
custom_js: assets/js/save.js
---

<script type="text/javascript">autosaveTo = "webpplBasics"</script>
<div id="autosaveTxt" style="font-style:italic"></div>


The syntax and implementation of webppl is explained [here](http://dippl.org/chapters/02-webppl.html). Using javascript in webppl is also discussed on [probmods](https://probmods.org/chapters/13-appendix-js-basics.html). Here we'll discuss the necessary material to start you off on your psets and projects, but if you want to know more about how webppl works under the hood, that website is the place to start. 

At the bottom of this document is a list of common webppl errors.

Much of this document is a review of material covered [Tobi and Kevin's tutorial](https://github.com/tobiasgerstenberg/webppl_tutorial), with some additional comparison snippets in Python and Javascript. 

# Basic webppl syntax 
**(a)**
> Defining variables and functions

Declare variables with 'var'. Arrays are zero-indexed. 

~~~
//Arrays
var a = [4,3,0,1]
print(a[1])

//Javascript objects
var b = {x: 0, y: 'webppl', 'z':a} //Python equivalent: {'x':0, 'y':'webppl', 'z':[4,3,0,1]}
print(b.z)
print(b['z']) //can also use Python-like syntax

//Arrays can hold multiple datatypes
var c = ['abc',0,b,[false,true,true]]
print(c)
~~~

To define functions:

~~~ norun
// Python
def f(a,b):
    y = a*b + 2
    return y
//Javascript (or use Webppl syntax, below)
function f(a, b) {
    y = a*b + 2
    return y;
}
~~~

~~~
//In webppl:
var a = [5, 1]
var f = function(a,b){
    var y = a * b + 2
    return y
}
var y = f(a[0],a[1])
print(y)
~~~

**(b)** 
> Array functions

Webppl is built on top of a functional subset of Javascript. This means that variables are immutable - their value cannot be changed once they've been assigned. This means we cannot use for loops or while loops. 

~~~ norun
//Cannot use the following syntax:
//Javascript
for (i = 0; i < 10; i++) {
    foo = i**2
} 
//Python equivalent
for i in range(10):
    foo = i**2
~~~ 

Instead, you'll mainly use map to loop over a list and return a value for each element in the list.

~~~ norun
//Python equivalent is map(function_to_apply, list_of_inputs)
i = range(10)
square = lambda x: x**2;
squared = list(map(square, i))
print(squared)
~~~ 

~~~
//Webppl example
var i = _.range(10) // _ is a Javascript library. We're calling the function "range" from this library. 
                    // _.range(10) = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                    // More on using functions from javascript libraries later.
var square = function(j){ return j*j }
var squared = map(square, i)
print('Squares: ' + squared)
//Can also write with an anonymous function
var squared = map(function(i){return i*i}, _.range(10))
print('Squares again: ' + squared)
~~~

Webppl has [several functions that operate on arrays](http://webppl.readthedocs.io/en/master/functions/arrays.html).

~~~
var x = _.range(20)
// Using one of the webppl array functions, write a fucntion that returns only the even numbers less than 15. 
~~~

**(c)** 
> If/else statements

Another consequence of immutability is that variables cannot be assigned inside if statements. 

~~~ norun
//Cannot use the following syntax:
//Javascript
foo = 7
if (foo == 3) { 
    a = 3 
} else if (foo == 1) { 
    a = 1
} else {
    a = 2
}
print(a)
//Python equivalent
foo = 7
if foo == 7:
    a = 1
elif foo == 10:
    a = 2
else: 
    a = 3
print(a)
~~~

Instead, use the conditional expression '?' (aka, the ternary operator).

~~~
// var variable = boolean ? value of variable if true : value of variable if false
var foo = 7
var a = foo == 3 ? 3 : foo == 1 ? 1 : 2
print(a)
~~~

However, we can use if statements to execute code that is not required outside the if/else block. In some of these cases, it is more efficient to use the ternary operator. 

~~~
var f = function(a,b){
   if (a < b) {
    return a
   }
   else {
    return b * 3
   }

   //comment out the above lines with cmd+/ and try this return statement instead:
   //return a < b ? a : b * 3

}

var x = true
if (x) {print(f(1,2))} else {print(f(3,2))}
~~~ 

**(d)**
> Recursive functions 

You can also use recursive functions as an alternative to for and while loops. 

~~~ norun
//Python
def factorial(n):
    if (n == 1) or (n == 0):
        return 1
    else:
        return n * factorial(n-1)
~~~

Write the factorial function in webppl, using a ternary operator in the return statement.

~~~
~~~

**(e)**
> Javascript libraries 

One of the reasons we've included both Javascript and Python code examples here is because you can call some Javascript functions from webppl. If you decide to do your final project in webppl, then you may want to [write](http://docs.webppl.org/en/master/packages.html#) or add Javascript libraries to complement webppl functionality (feel free to come ask the TAs for help!). There are also standard Javascript functions that are available in the webppl browser - we'll mainly use [Underscore](http://underscorejs.org/) and [Math](https://www.w3schools.com/js/js_math.asp). 

~~~
//Use library.function(args) to call a Javascript function 
//E.g., to call the 'exp' function from the 'Math' library 

var y = Math.exp(1)
print(y)

// use an underscore.js function to sort the TAs by year
var TAs = [{name:'Maddie',lab:'McDermott',year:3}, {name:'Matthias',lab:'Levy',year:2}, 
    {name:'Luke',lab:'Tenenbaum',year:3}, {name:'Kelsey',lab:'Tenenbaum',year:4}]

~~~

There are a few restrictions for Javascript functions you can use in webppl. One restriction is that external functions can't be called with a WebPPL function as an argument.
~~~
//This underscore function will not run: 
var underscoreEvens = _.filter([1, 2, 3, 4, 5, 6], function(num){ return num % 2 == 0; });
print(underscoreEvens)
//Instead, use the webppl version:
var webpplEvens = filter(function(num) {return num % 2 == 0}, _.range(1,7))
print(webpplEvens)
~~~

# Defining probabilistic models and inference
**(a)**
You'll see many more examples of this in later psets and recitation, so we'll just give one example and note some syntax.
Here are available webppl [distributions](http://docs.webppl.org/en/master/distributions.html) and [inference methods](http://docs.webppl.org/en/master/inference/methods.html).

~~~

//distributions take a single object as input 
viz(Gaussian({ mu: 0, sigma: 1 }))
//the 'score' method returns the log probability of the input value
print(Gaussian({ mu: 0, sigma: 1 }).score(1))

//sampling syntax is simple! 
var binomial = function() {
  var a = sample(Bernoulli({ p: 0.5 }))
  var b = sample(Bernoulli({ p: 0.5 }))
  var c = sample(Bernoulli({ p: 0.5 }))
  return a + b + c
}

// Infer takes an object which contains method, and your probabilistic model, 
// which must be a thunk (i.e. a function with no input arguments )
var binomialDist = Infer({ method: 'enumerate' }, binomial )
viz(binomialDist)

~~~

How could you edit the above code to define a [binomial distribution](https://en.wikipedia.org/wiki/Binomial_distribution) for arbitrary n and p?

~~~
var binomial = function(n,p) {
    // write this function using a series of samples from a Bernoulli distribution
}

var n = 3
var p = 0.5
//note the use of the thunk in Infer!!!!!
var binomialDist = Infer({ method: 'enumerate' }, function(){return binomial(n,p)} )
viz(binomialDist)

~~~

In later psets, we'll talk about [using](http://docs.webppl.org/en/master/inference/conditioning.html) 'factor' and 'observe' statements -- which can be used for conditioning with continuous random variables. 

# Common errors in webppl 

~~~
factor allowed only inside inference.
~~~
You cannot use condition, observe, or factor inside 

~~~

~~~

~~~
if (true){
  var x = 1;
} else {
  var x = 2;
}
x
~~~
leads to
~~~
x is not defined
~~~

<table>
<tr><td><a id="exportBtn"><button style="color:black">Export</button></a></td>
<td>Import: <input type="file" id="files" name="files[]" /></td></tr></table>