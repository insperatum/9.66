---
layout: chapter
hidden: false
title: Problem Set 4
description: Due Friday, Dec 1 at 6pm
custom_js: assets/js/save_v2.js
---
<script type="text/javascript">autosaveTo = "pset4"</script>
<div id="autosaveTxt" style="font-style:italic"></div>


In this problem set, we will build a [hierarchical Bayesian model](https://probmods.org/chapters/09-hierarchical-models.html) in order to learn about object categories in the world by observing how different objects move. First, we need to get familiar with webppl's built-in physics engine. We are going to use it to simulate data from the world (*not* as an intuitive physics engine in the mind). 

# Question 1: Preliminaries on the webppl physics engine
Box2D is a two dimensional physics simulator for simulating moving shapes. Here, we go through how to use webppl to create shapes, simulate physics, and make physical measurements (e.g., measure a shape's velocity). We will not go over how to do inference in a probabilistic physics engine because it is not required for this problem set, but it is covered in the last examples in [the second chapter](https://probmods.org/chapters/02-generative-models.html) of probmods.  

> **a) Creating and simulating worlds**

In Box2D, the state of the world at time $$t$$ is defined by a list of shapes. Shapes are Javascript objects with the following properties:
* `shape`: 'circle' or 'square' or 'triangle' or 'rect'
* `dims`: [radius] for circle; [side length] for 'square'; [side length] for triangle; [width, height] for rect;
* `x`: distance from left
* `y`: distance from top
* `static`: true or false (i.e., is the object fixed in place?)
* `velocity`: [x_velocity, y_velocity]
* `color`: 'red' or 'blue' or 'green'

`worldWidth` and `worldHeight` are constants representing the visible size of the simulation window. 

**i)** First, run the simulation below. `physics.animate(total_time_steps, list_of_objects)` displays an animation that shows the shapes moving. Then, add a blue circle to the world so that it moves along the ground and knocks over the tower. In addition to defining the blue circle, you'll also need to add it to `initialWorld` (using `_.concat`) when you run `physics.animate`.
~~~
//Shape definitions:
var ground = {shape: 'rect',
  static: true,
  dims: [worldWidth, 10],
  x: worldWidth/2,
  y: worldHeight
}

var tower = {shape: 'rect',
  static: false,
  dims: [10, 100],
  x: worldWidth/2,
  y: 390,
  color: 'red'
}

//Defining the world. 
//Note that the state of the world is completely defined by a list of shapes:
var initialWorld = [ground, tower] 
//Simulating and animating the world
physics.animate(1000, initialWorld); 
~~~

> **b) Measuring motion**

In order to infer shape properties, we need some way of gathering data from the world. We will primarily focus on motion data. In this part, we will plot how a shape's position and velocity change over time.

To do this, we need to simulate the world state at multiple time points, then read off the motion data at each time point. For this, we will use `physics.run(t, initialWorld)`, which returns the world state at time $$t$$. Just as `initialWorld` is a list of shapes, the output of `physics.run` is a list of shapes. 

**i)** First, define a yellow sliding box with initial position `worldWidth/2-100` and initial velocity `[500,0]`. Then, complete the simulation code by a) defining a list of times from 0 to 500 in steps of 20, by using [_.range](http://underscorejs.org/#range); b) fill in the [map](http://docs.webppl.org/en/master/functions/arrays.html) to return a list of world states at the specified time points.
~~~
//Shape definitions:
var ground = {shape: 'rect',
  static: true,
  dims: [worldWidth, 10],
  x: worldWidth/2,
  y: worldHeight,
  color: 'gray'
}

var slidingBox = { 
  /*your code here*/
}

//Defining the world:
var initialWorld = [ground, slidingBox]

//Simulate the world state at several different time points
var times = /* your code here */
var worlds_t = map(function(t){
  var world_t = /* your code here */
  return world_t
},times)

//Storing our data so we can use it in subsequent code boxes
editor.put("times", times)
editor.put("worlds_t", worlds_t)

~~~

**ii)** Using the simulated worlds from the previous part, we extracted the list of ($$x$$,$$y$$) positions of the sliding box over time. Imitate our position example to extract a list of ($$x$$,$$y$$) velocities of the sliding box. **Beware**: the order of indexing shapes in `finalWorld` is opposite that in `initialWorld`. Also add code to visualize the velocity over time.
~~~
var worlds_t = editor.get("worlds_t")
var times = editor.get("times")

//returns a list of [x_position, y_position] over time for the sliding box
var positions = map(function(i){
  var slidingBoxState = worlds_t[i][0] //last shape in initialWorld is first shape in world_t! 
  var position_t = {x:slidingBoxState.x, y:slidingBoxState.y}
  return position_t 
},_.range(worlds_t.length))
console.log(JSON.stringify(positions))

var velocities = /* your code here */ 

console.log('X position over time for slidingBox:')
viz.line(times, map(function(position){return position.x}, positions))
console.log('Y position over time for slidingBox:')
viz.line(times, map(function(position){return position.y}, positions))

/*your visualization code for velocity here*/

~~~

**iii)** The webppl function `find`. The first argument of `find` is a "test" function with one argument that returns a boolean. The second argument of `find` is a list. `find` will return the first element of the list for which the test function returns `true`. For example,
~~~
var x = _.range(11)
var y = find(function(_x){return _x > 8 && _x % 2 == 0}, x)
print(y)
~~~ 

We give an example of using `find` to find the position of your sliding box when $$vel_x$$ just passes $$vel_{x,init}/2$$. Imitate our example to find the velocity of the box when it passes the centre point of the physics engine, `worldWidth/2`. 
~~~
var worlds_t = editor.get("worlds_t")

//find the world where the boolean is true
var halfSpeed = find(function(w_t){return w_t[0].vx < (worlds_t[0][0].vx/2)}, worlds_t)
//extract the property of interest
var halfSpeed_pos = halfSpeed[0].x

/*your code here*/
//print your answer 

~~~ 

# Question 2: Learning about how objects move

In class, we discussed the _shape bias_ -- when learning the names of objects, North American children generalize a new label for an object to other objects of the same shape, rather than objects with the same color or texture. This is an example of an _overhypothesis_: in addition to learning what names correspond to which objects, children learn about what object names tend to mean in general. [Kemp et al.](http://web.mit.edu/cocosci/Papers/devsci07_kempetal.pdf) (2007) show that hierarchical Bayesian models enable the acquisition of such abstract knowledge, as well as one-shot learning of specific instances. 

Here, we will explore similar 'learning-to-learn' phenomena in a hierarchical Bayesian model of object motion. The animation in the following code box illustrates our problem domain. In our world, there are objects of various shapes, materials (indicated by their colour), and sizes. We will observe the motion of these objects when we drop them onto a ramp and build a hierarchical model of how object properties lead to object motion. If you unfold the code below, you can play with the object definitions to explore how different objects move. 
~~~
///fold:
var ground = {shape: 'rect',
  static: true,
  dims: [worldWidth, 10],
  x: worldWidth/2,
  y: worldHeight
}
var ramp = {shape: 'triangle',
  static: true,
  dims: [600],
  x: worldWidth/2 - 700,
  y: worldHeight + 10
}
var objects = [{shape:'square',dims:[13],static:false, color:'blue',x:worldWidth/2 - 290,y:worldHeight - 200},{shape:'triangle',dims:[8],static:false, color:'red',x:worldWidth/2 - 290,y:worldHeight - 200},{shape:'circle',dims:[10],static:false, color:'green',x:worldWidth/2 - 290,y:worldHeight - 200}]
///
var index = sample(RandomInteger({n:3}))
var initialWorld = [ground, ramp, objects[index]]
physics.animate(1000,initialWorld)
~~~

In this problem, we'll explore the following types of questions: can we learn how objects of a particular material tend to move? Can we learn what kind of object properties are important for their motion? If we find an object we've never encountered before, what will we be able to predict about its motion? 

> **a) Measuring motion**

In the code block below, the variable `objects` contains a list of 30 shapes found in our world. For each shape, we set `x` and `y` so that they will be dropped from the same point onto the ramp.

**i)** Use `find` to collect the following motion data for each object: 
* `sx`, the final $$x$$ position of the object (the first $$s_x$$ such that $$v_x$$ < 0.5)
* `v`, the magnitude of  the velocity vector of the shape when it exits the ramp ($$\sqrt{v_x^2 + v_y^2}$$ when the shape has just passed the rightmost edge of the ramp, at `worldWidth/2 - 125`)

~~~
///fold:
var ground = {shape: 'rect',
  static: true,
  dims: [worldWidth, 10],
  x: worldWidth/2,
  y: worldHeight
}
var ramp = {shape: 'triangle',
  static: true,
  dims: [600],
  x: worldWidth/2 - 700,
  y: worldHeight + 10
}
var objects = [{"shape":"triangle","dims":[9.93648315819359],"color":"green",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"triangle","dims":[10.173837425678482],"color":"red",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"circle","dims":[9.063710049759866],"color":"red",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"circle","dims":[8.271140185190617],"color":"red",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"circle","dims":[11.053246754203297],"color":"blue",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"square","dims":[12.21817101531895],"color":"green",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"square","dims":[12.538953668854033],"color":"red",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"triangle","dims":[9.808843648635628],"color":"green",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"circle","dims":[8.463624408220944],"color":"green",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"circle","dims":[12.55990318953378],"color":"green",x:worldWidth/2 - 290,y:worldHeight - 200,static:false}]
///

var initialWorld = [ground, ramp]

//Collecting our motion data
var motionData = map(function(obj){

  ////follow the same steps as in the preliminaries to:
  //define the world with the object in it 
  //define the time steps from t=50 to t=1000, with delta_t = 5
  //use physics.run to get world states for each t

  var objWorld = initialWorld.concat(obj)  
  var times = _.range(50,1000,5)
  var world_t = map(function(t){return physics.run(t,objWorld)}, times)  

  //your code here to measure s (you only need two lines!)
  var atRest = find(function(t){return t[0].vx < 0.5}, world_t)
  var sx = atRest[0].x
  
  //your code here to measure v (you only need two lines!)
  var endOfRamp = find(function(t){return t[0].x > worldWidth/2 - 125}, world_t)
  var v = Math.sqrt(Math.pow(endOfRamp[0].vx,2) + Math.pow(endOfRamp[0].vy,2))

  return {motion:{pos:sx, vel:v},object:{shape:obj.shape, dim:obj.dims[0], color:obj.color}}
}, objects) 

//Storing our data so we can use it in subsequent code boxes
editor.put("motionData", motionData)

~~~

**ii)** The next code box will scale and visualize your data. You do not need to complete any code. In the text box below, comment on the patterns you see.
~~~
var motionData = editor.get("motionData")
var posDist = {mu:listMean(map(function(d) {return d.motion.pos}, motionData)),
               std:listStdev(map(function(d) {return d.motion.pos}, motionData))}
var velDist = {mu:listMean(map(function(d) {return d.motion.vel}, motionData)),
               std:listStdev(map(function(d) {return d.motion.vel}, motionData))}
var data = map(function(d) {
  return {
    x:(d.motion.pos-posDist.mu) / posDist.std,
    y:(d.motion.vel-velDist.mu) / velDist.std,
    shape: d.object.shape,
    color: d.object.color,  
  }
}, motionData)
viz.scatterShapes(data, {xBounds:[-3,3], yBounds:[-3,3]})
editor.put("data", data)
~~~

<textarea class="textAnswer" rows="8" cols="80"></textarea><br/>

> b) Setting up our model

How can we set up  

labeling the graphical model question

> Learning overhypotheses 

if we observe an object with velocity .. and .. , hat do we expect about its other properties. .. 

etc. 


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

