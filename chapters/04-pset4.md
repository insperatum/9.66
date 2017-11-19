---
layout: chapter
hidden: false
title: Problem Set 4
description: Due Friday, Dec 1 at 6pm
custom_js: assets/js/save_v2.js
---
<script type="text/javascript">autosaveTo = "pset4"</script>
<div id="autosaveTxt" style="font-style:italic"></div>


In this problem set, we will build a [hierarchical Bayesian model](https://probmods.org/chapters/09-hierarchical-models.html) in order to learn about object categories in the world by observing how different objects move. First, we need to get familiar with webppl's built-in physics engine. We are going to use it to simulate data from the world (**not** as an intuitive physics engine in the mind). 

# Question 1: Preliminaries on the webppl physics engine
Box2D is a two dimensional physics simulator for simulating moving shapes. Here, we go through how to use webppl to create shapes, simulate physics, and make physical measurements (e.g., measure a shape's velocity). We will not go over how to do inference in a probabilistic physics engine, because it is not required for this problem set, but you can read more [here]().  

> Creating and simulating worlds

In Box2D, the state of the world at time t is described by a list of shapes. Shapes are Javascript objects with the following properties:
* shape: "circle" or "rect" or "triangle"
* dims: [width, height] for rect; [radius] for circle; ... for triangle
* x: distance from left,  sets the initial position
* y: distance from top, sets the initial position
* static: true or false (is the object fixed in place?)
* velocity: [x_velocity, y_velocity], sets the inital velocity
* colour: pixel value... 
The variables worldWidth and worldHeight are constants representing the visible size of the simulation window. 

First, run the simulation below. Note that we simulate physics with "physics.animate(time steps, list of objects)" which displays an animation that shows the shapes moving. Then, uncomment the slidingBox code and add a blue circle to the world so that it moves along the ground and knocks over the tower. 
~~~
//Shape definitions:
var ground = {shape: 'rect',
  static: true,
  dims: [worldWidth, 10],
  x: worldWidth/2,
  y: worldHeight,
  colour: /**/ 
}

var tower = {shape: 'rect',
  static: false,
  dims: [10, 100],
  x: worldWidth/2,
  y: 390,
  colour: /**/
}

//var slidingBox = {
//  
//}



//Defining the world. 
//Note that the state of the world is completely defined by a list of shapes:
var initialWorld = [ground, tower] 
//Simulating and animating the world
physics.animate(1000, initial); 
~~~

Alter the above code so that the width of the tower is chosen uniformly at random in between ... and ....
~~~
~~~ 

> Measuring motion

In order to infer shape properties, we need some way of gathering data from the world. In this problem set, we will primarily focus on motion data - position and velocity. In this section, we will plot how a shape's position and velocity changes over time.

To do this, we need to simulate the world state at multiple time points so that we can read off the position and velocity at each time point. For this, we will use the function physics.simulate(t,world) which returns the world state at time t (but does not animate the scene). Remember that just as initialWorld is a list of shapes, the output of physics.simulate is a list of shapes that defines the world state at time = t.

First, define a sliding box with initial position () and initial velocity (). Then, complete the simulation code by 1) defining a list of times = [] by using [_.range](http://underscorejs.org/#range); 2) fill in the [map](http://docs.webppl.org/en/master/functions/arrays.html) to return a list of world states at the time points defined in the previous line.
~~~
//Shape definitions:
var ground = {shape: 'rect',
  static: true,
  dims: [worldWidth, 10],
  x: worldWidth/2,
  y: worldHeight,
  colour: /**/ 
}

var slidingBox = {
  /* your code here */ 
}



//Defining the world:
var initialWorld = [ground]

//Simulate the world state at several different time points
var times = /* your code here */
var finalWorlds = map(function(t){
  var world_t = /* your code here */
  return world_t
},times)

~~~

Copy the code above into the next box. Here, we have extracted the list of (x,y) positions of the sliding box over time. Complete the line for velocities. 
~~~

/* copy your code here */

//returns a list of [x_position, y_position] over time for the sliding box
var positions = map(function(t){
  var slidingBoxState = finalWorlds[t][1]
  var position_t = [slidingBoxState.x, slidingBoxState.y]
  return position_t 
},times)
console.log(positions)

var velocities = /* your code here */ 

/* viz */

~~~
Write one sentence explaining why there is a second index in the definintion of the slidingBoxState. 
<textarea class="textAnswer" rows="8" cols="80"></textarea><br/>


# Question 2: What object properties affect their motion?

WORLD SET UP . ... this may seem trivial to you, but how might an infant observing the world learn this? this is what we'll model in this question ... 

....


<b>Before exporting for submission please run your code (button below).</b><br/>
Your figures will then be automatically saved in the export file.
<table>
<tr>
<td>
<a id="runBtn"><button style="color:black">Run All</button></a>
<a id="exportBtn"><button style="color:black">Export</button></a>
</td>
<td>Import: <input type="file" id="files" name="files[]" /></td></tr></table>

<br/><br/><br/>
<hr/>

