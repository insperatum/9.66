---
layout: chapter
title: Problem Set 4
description: Due <...>
custom_js: assets/js/save.js
type: pset
hidden: true
---
<script type="text/javascript">autosaveTo = "pset4"</script>
**Due <....>**

<div id="autosaveTxt" style="font-style:italic"></div>



In this problem set, we will build a [hierarchical Bayesian model](https://probmods.org/chapters/09-hierarchical-models.html) in order to learn about object categories in the world by observing how different objects move. First, we need to get familiar with webppl's built-in physics engine. We are going to use it to simulate data from the world. 

# Question 1: Preliminaries on the webppl physics engine
Box2D is a two dimensional physics simulator for simulating moving shapes. Here, we go through how to use webppl to create shapes, simulate physics, and make physical measurements (e.g., measure a shape's velocity). We will not go over how to do inference in a probabilistic physics engine because it is not required for this problem set, but it is covered in the last examples in [the second chapter](https://probmods.org/chapters/02-generative-models.html) of probmods.  

> **a) Creating and simulating worlds**

In Box2D, the state of the world at time $$t$$ is defined by a list of shapes. Shapes are Javascript objects with the following properties:
* `shape`: 'circle' or 'square' or 'triangle' or 'rect'
* `dims`: [radius] for circle; [side_length] for 'square'; [side_length] for triangle; [width, height] for 'rect';
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

var ball = {
  shape: 'circle',
  static: false,
  dims: [40],
  x: worldWidth/2-100,
  y:worldHeight-50,
  color: 'blue',
  velocity: [600,0]
}

//Defining the world. 
//Note that the state of the world is completely defined by a list of shapes:
var initialWorld = [ground, tower] 
//Simulating and animating the world
physics.animate(1000, initialWorld.concat(ball)); 
~~~

> **b) Measuring motion**

In order to learn about objects, we need some way of gathering data from the world. In this problem set, we focus on motion data so here we will plot how a shape's position and velocity change over time.

To do this, we need to simulate the world state at multiple time points, then read off the motion data at each time point. For this, we will use `physics.run(t, initialWorld)`, which returns the world state at time $$t$$. Just as `initialWorld` is a list of shapes, the output of `physics.run` is a list of shapes. 

**i)** First, define a green sliding box with initial $$x$$ position `worldWidth/2-100` and initial velocity `[500,0]`. Then, complete the simulation code by a) defining a list of times from 0 to 500 in steps of 20, by using [_.range](http://underscorejs.org/#range); b) fill in the [map](http://docs.webppl.org/en/master/functions/arrays.html) to return a list of world states at the specified time points.
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
  shape: 'square',
  static: false,
  dims: [20],
  x: worldWidth/2-100,
  y: worldHeight-30,
  velocity: [500,0],
  color:'green'
}

//Defining the world:
var initialWorld = [ground, slidingBox]

//Simulate the world state at several different time points
var times = _.range(0,500,20)
var worlds_t = map(function(t){
  var world_t = physics.run(t,initialWorld)
  return world_t
},times)

//Storing our data so we can use it in subsequent code boxes
editor.put("times", times)
editor.put("worlds_t", worlds_t)

~~~

**ii)** Using the simulated worlds from the previous part, we extracted the list of ($$x$$,$$y$$) positions of the sliding box over time. Imitate our position example to extract a list of ($$x$$,$$y$$) velocities of the sliding box. Also add code to visualize the velocity over time.
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

var velocities = map(function(i){
  var slidingBoxState = worlds_t[i][0] //last shape in initialWorld is first shape in world_t! 
  var velocity_t = {x:slidingBoxState.velocity[0], y:slidingBoxState.velocity[1]}
  return velocity_t
},_.range(worlds_t.length))
console.log(JSON.stringify(velocities))

console.log('X position over time for slidingBox:')
viz.line(times, map(function(position){return position.x}, positions))
console.log('Y position over time for slidingBox:')
viz.line(times, map(function(position){return position.y}, positions))

console.log('X velocity over time for slidingBox:')
viz.line(times, map(function(velocity){return velocity.x}, velocities))
console.log('Y velocity over time for slidingBox:')
viz.line(times, map(function(velocity){return velocity.y}, velocities))
~~~

**iii)** The webppl function `find`. The first argument of `find` is a "test" function with one argument that returns a boolean. The second argument of `find` is a list. `find` will return the first element of the list for which the test function returns `true`. For example,
~~~
var x = _.range(11)
var y = find(function(_x){return _x > 8 && _x % 2 == 0}, x)
print(y)
~~~ 

We give an example of using `find` to find the position of your sliding box when $$v_x$$ just passes $$v_{x,init}/2$$. Imitate our example to find $$v_x$$ of the box when it passes the center point of the physics engine, `worldWidth/2`. 
~~~
var worlds_t = editor.get("worlds_t")

//find the world where the boolean is true
var halfSpeed = find(function(w_t){return w_t[0].velocity[0] < (worlds_t[0][0].velocity[0]/2)}, worlds_t)
//extract the property of interest
var halfSpeed_pos = halfSpeed[0].x

//find the world where the boolean is true
var halfPos = find(function(w_t){return w_t[0].x > worldWidth/2}, worlds_t)
//extract the property of interest
var halfPos_vel = halfPos[0].velocity[0]

print(halfPos_vel)

~~~ 

# Question 2: Learning about object types

In class, we discussed the _shape bias_ -- when learning the names of objects, North American children generalize a new label for an object to other objects of the same shape, rather than objects with the same color or texture. This is an example of an _overhypothesis_: in addition to learning what names correspond to which objects, children learn about what object names tend to mean in general. [Kemp et al.](http://web.mit.edu/cocosci/Papers/devsci07_kempetal.pdf) (2007) show that hierarchical Bayesian models enable the acquisition of such abstract knowledge, as well as one-shot learning of specific instances. 

Here, we will explore similar 'learning-to-learn' phenomena in a hierarchical Bayesian model of object motion. The animation in the following code box illustrates our problem domain. In our world, there are objects of various shapes and materials (indicated by their colour). We will observe the motion of these objects when we drop them onto a ramp and build a hierarchical model of how object properties lead to object motion. Unfold the code below to play with the object definitions to explore how different objects move. What are your hypotheses about how object properties affect motion?
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

In the code block below, the variable `objects` contains a list of 10 shapes found in our world. For each shape, we set `x` and `y` so that they will be dropped from the same point onto the ramp.

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
var objects = [{"shape":"triangle","dims":[9.93648315819359],"color":"blue",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"triangle","dims":[10.173837425678482],"color":"red",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"circle","dims":[9.063710049759866],"color":"red",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"circle","dims":[8.271140185190617],"color":"red",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"circle","dims":[11.053246754203297],"color":"blue",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"square","dims":[12.21817101531895],"color":"green",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"square","dims":[12.538953668854033],"color":"red",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"triangle","dims":[9.808843648635628],"color":"green",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"circle","dims":[8.463624408220944],"color":"green",x:worldWidth/2 - 290,y:worldHeight - 200,static:false},{"shape":"circle","dims":[12.55990318953378],"color":"green",x:worldWidth/2 - 290,y:worldHeight - 200,static:false}]
///

var initialWorld = [ground, ramp]

//Collecting our motion data
var getMotion = function(initialWorld,objects){

  return map(function(obj){

    ////follow the same steps as in the preliminaries to:
    //define the world with the object in it 
    //define the time steps from t=50 to t=1000, with delta_t = 5
    //use physics.run to get world states for each t

    var objWorld = initialWorld.concat(obj)  
    var times = _.range(50,1000,5)
    var world_t = map(function(t){return physics.run(t,objWorld)}, times)  

    //your code here to measure s (you only need two lines!)
    var atRest = find(function(t){return t[0].velocity[0] < 0.5}, world_t)
    var sx = atRest[0].x
    
    //your code here to measure v (you only need two lines!)
    var endOfRamp = find(function(t){return t[0].x > worldWidth/2 - 125}, world_t)
    var v = Math.sqrt(Math.pow(endOfRamp[0].velocity[0],2) + Math.pow(endOfRamp[0].velocity[1],2))

    return {motion:{sx:sx, v:v},object:{shape:obj.shape, color:obj.color}}

  }, objects)

}

var motionData = getMotion(initialWorld, objects)

//Storing our data so we can use it in subsequent code boxes
editor.put("getMotion", getMotion)
editor.put("motionData", motionData)

~~~

**ii)** The next code box will scale and visualize your data. You do not need to complete any code. 
~~~
var motionData = editor.get("motionData")
var posDist = {mu:listMean(map(function(d) {return d.motion.sx}, motionData)),
               std:listStdev(map(function(d) {return d.motion.sx}, motionData))}
var velDist = {mu:listMean(map(function(d) {return d.motion.v}, motionData)),
               std:listStdev(map(function(d) {return d.motion.v}, motionData))}
var data = map(function(d) {
  return {
    sx:(d.motion.sx-posDist.mu) / posDist.std,
    v:(d.motion.v-velDist.mu) / velDist.std,
    shape: d.object.shape,
    color: d.object.color  
  }
}, motionData)
viz.scatterShapes(data, {xBounds:[-3,3], yBounds:[-3,3]})
editor.put("data", data)
~~~

In two sentences, comment on the patterns that you see.

<textarea class="textAnswer" rows="4" cols="80"></textarea><br/>

> **b) Setting up our model**

<img src="/images/slide.png" alt="Graphical model" align="right" style="width: 250px;"/>

~~~
var makeModelQuery = function(data, shapes, colors, maxClasses){
  return function(){

    //parameters on distributions over what motion classes are like
    var distParams = {
      classProbs: Array.prototype.slice.call(sample(Dirichlet({alpha:Vector(_.range(maxClasses).fill(0.2))})).data),
      colorAlpha: sample(Exponential({a:1})), //color concentration parameter
      shapeAlpha: sample(Exponential({a:1})) //shape concentration parameter
    }

    //parameters for objects within a motion class 
    var classParams = map(function(i) {
      return {
        p_color: sample(Dirichlet({alpha: Vector(_.range(colors.length).fill(distParams.colorAlpha))})),
        p_shape: sample(Dirichlet({alpha: Vector(_.range(shapes.length).fill(distParams.shapeAlpha))})),
        mu_sx: sample(Gaussian({mu:0, sigma:2})),
        sigma_sx: 0.2,
        mu_v: sample(Gaussian({mu:0, sigma:2})),
        sigma_v: 0.2
      } 
    }, _.range(maxClasses))

    //which objects belong to which motion class? 
    var classIdxs = map(function(d) {
      var i = sample(Discrete({ps:distParams.classProbs}))
      observe(Gaussian({mu:classParams[i].mu_sx, sigma:classParams[i].sigma_sx}), d.sx)
      observe(Gaussian({mu:classParams[i].mu_v, sigma:classParams[i].sigma_v}), d.v)
      observe(Categorical({ps:classParams[i].p_color, vs:colors}), d.color)
      observe(Categorical({ps:classParams[i].p_shape, vs:shapes}), d.shape)
      return i
    }, data)

    return {distParams:distParams, classParams:classParams, classIdxs:classIdxs}
  }
}
editor.put('makeModelQuery',makeModelQuery)
~~~

> **c) Inferring motion classes** 

~~~
///fold:
var plotter = function(dist, data, maxClasses){  
  console.log('Entire dataset:')
  viz.scatterShapes(data, {xBounds:[-3,3], yBounds:[-3,3]})

  console.log('Classes:')
  var classIdxs = _.last(dist.samples).value.classIdxs
  map(function(classIdx) {
    var idxs = filter(function(i) {classIdxs[i]==classIdx}, _.range(data.length))
    if(idxs.length>0) {
      viz.scatterShapes(map(function(i) {data[i]}, idxs), {xBounds:[-3,3], yBounds:[-3,3]})  
    }
  }, _.range(maxClasses))

  console.log("Shape concentration parameter:")
  viz.density(marginalize(dist, function(x){return x.distParams.shapeAlpha}),{bounds:[0,5]})
  console.log("Color concentration parameter:")
  viz.density(marginalize(dist, function(x){return x.distParams.colorAlpha}),{bounds:[0,5]})
}
///
var makeModelQuery = editor.get('makeModelQuery')
var data = editor.get("data")
var shapes = ["circle", "triangle", "square"]
var colors = ["red", "green", "blue"]
var maxClasses = 4

var model = makeModelQuery(data,shapes,colors,maxClasses)

var dist = Infer({method:"MCMC", burn:10000, lag:100, callbacks: [editor.MCMCProgress()]}, model)
plotter(dist, data, maxClasses)
~~~


~~~
///fold:
var plotter = function(dist, data, maxClasses){  
  console.log('Entire dataset:')
  viz.scatterShapes(data, {xBounds:[-3,3], yBounds:[-3,3]})

  console.log('Classes:')
  var classIdxs = _.last(dist.samples).value.classIdxs
  map(function(classIdx) {
    var idxs = filter(function(i) {classIdxs[i]==classIdx}, _.range(data.length))
    if(idxs.length>0) {
      viz.scatterShapes(map(function(i) {data[i]}, idxs), {xBounds:[-3,3], yBounds:[-3,3]})  
    }
  }, _.range(maxClasses))


  console.log("Shape concentration parameter:")
  viz.density(marginalize(dist, function(x){return x.distParams.shapeAlpha}),{bounds:[0,5]})
  console.log("Color concentration parameter:")
  viz.density(marginalize(dist, function(x){return x.distParams.colorAlpha}),{bounds:[0,5]})
}
///
var makeModelQuery = editor.get('makeModelQuery')
var data = editor.get("data")
var newData = data.concat([{sx:0.5, v:-1.3, shape:"cross", color:"orange"}])
var shapes = ["circle", "triangle", "square", "cross"]
var colors = ["red", "green", "blue", "orange"]
var maxClasses = 4

var model = makeModelQuery(newData,shapes,colors,maxClasses)
var dist =  Infer({method:"MCMC", burn:50000, lag:500, callbacks: [editor.MCMCProgress()]}, model)
editor.put("crossDist", dist)
plotter(dist, newData, maxClasses)
~~~

> ** d) overhypotheses **

~~~
var imagineColor = function(color, dist, colors, shapes) {
  var p = sample(dist)
  var distParams = p.distParams
  var classParams = p.classParams
  var j = sample(Discrete({ps:distParams.classProbs}))
  observe(Categorical({ps:classParams[j].p_color, vs:colors}), color)
  var shape = sample(Categorical({ps:classParams[j].p_shape, vs:shapes}))
  var x = sample(Gaussian({mu:classParams[j].mu_sx, sigma:classParams[j].sigma_sx}))
  var y = sample(Gaussian({mu:classParams[j].mu_v, sigma:classParams[j].sigma_v}))
  return {x:x, y:y, color:color, shape:shape}
}

editor.put("imagineColor",imagineColor)
~~~

~~~
var imagineColor = editor.get("imagineColor")
var dist = editor.get("crossDist")
var colors = ["red", "green", "blue", "orange"]
var shapes = ["circle", "triangle", "square", "cross"]

var distOrange = Infer({method:"rejection", samples:50}, 
  function(){return imagineColor("orange",dist,colors,shapes)})
viz.scatterShapes(map(function(x){x.value}, distOrange.samples), {xBounds:[-3,3], yBounds:[-3,3]})
~~~

~~~
var imagineShape = function(shape,dist,colors,shapes) {
  var p = sample(dist)
  var distParams = p.distParams
  var classParams = p.classParams
  var j = sample(Discrete({ps:distParams.classProbs}))
  var color = sample(Categorical({ps:classParams[j].p_color, vs:colors}))
  observe(Categorical({ps:classParams[j].p_shape, vs:shapes}), shape)
  var x = sample(Gaussian({mu:classParams[j].mu_sx, sigma:classParams[j].sigma_sx}))
  var y = sample(Gaussian({mu:classParams[j].mu_v, sigma:classParams[j].sigma_v}))
  return {x:x, y:y, color:color, shape:shape}
}
editor.put("imagineShape",imagineShape)
~~~

~~~
var imagineShape = editor.get("imagineShape")
var dist = editor.get("crossDist")
var colors = ["red", "green", "blue", "orange"]
var shapes = ["circle", "triangle", "square", "cross"]

var distCross = Infer({method:"rejection", samples:25}, 
  function(){return imagineShape("cross",dist,colors,shapes)})
viz.scatterShapes(map(function(x){x.value}, distCross.samples), {xBounds:[-3,3], yBounds:[-3,3]})
~~~

# Question 3: a whole new owlrd

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
var objects = [{shape:'square',dims:[13],static:false, color:'pink',x:worldWidth/2 - 290,y:worldHeight - 200},{shape:'triangle',dims:[8],static:false, color:'yellow',x:worldWidth/2 - 290,y:worldHeight - 200},{shape:'circle',dims:[10],static:false, color:'purple',x:worldWidth/2 - 290,y:worldHeight - 200}]
///
var index = sample(RandomInteger({n:3}))
var initialWorld = [ground, ramp, objects[index]]
physics.animate(1000,initialWorld)
~~~

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
var objects = [{static:false,x:worldWidth/2 - 290,y:worldHeight - 200,"shape":"square","dims":[9.875614033118921],"color":"pink"},{static:false,x:worldWidth/2 - 290,y:worldHeight - 200,"shape":"triangle","dims":[8.783138642387696],"color":"yellow"},{static:false,x:worldWidth/2 - 290,y:worldHeight - 200,"shape":"circle","dims":[12.637313462381323],"color":"yellow"},{static:false,x:worldWidth/2 - 290,y:worldHeight - 200,"shape":"triangle","dims":[10.425076637810273],"color":"purple"},{static:false,x:worldWidth/2 - 290,y:worldHeight - 200,"shape":"square","dims":[13.633369308430584],"color":"yellow"},{static:false,x:worldWidth/2 - 290,y:worldHeight - 200,"shape":"square","dims":[8.750548066335949],"color":"purple"},{static:false,x:worldWidth/2 - 290,y:worldHeight - 200,"shape":"square","dims":[11.48051247637476],"color":"pink"},{static:false,x:worldWidth/2 - 290,y:worldHeight - 200,"shape":"triangle","dims":[11.791093463199307],"color":"yellow"},{static:false,x:worldWidth/2 - 290,y:worldHeight - 200,"shape":"triangle","dims":[10.597412699083279],"color":"pink"},{static:false,x:worldWidth/2 - 290,y:worldHeight - 200,"shape":"square","dims":[10.40227096283195],"color":"purple"}]
///

var getMotion = editor.get("getMotion")
var motionData = getMotion([ground,ramp],objects)

///fold:
var posDist = {mu:listMean(map(function(d) {return d.motion.sx}, motionData)),
               std:listStdev(map(function(d) {return d.motion.sx}, motionData))}
var velDist = {mu:listMean(map(function(d) {return d.motion.v}, motionData)),
               std:listStdev(map(function(d) {return d.motion.v}, motionData))}
var materialData = map(function(d) {
  return {
    sx:(d.motion.sx-posDist.mu) / posDist.std,
    v:(d.motion.v-velDist.mu) / velDist.std,
    shape: d.object.shape,
    color: d.object.color,  
  }
}, motionData)
///

viz.scatterShapes(materialData, {xBounds:[-3,3], yBounds:[-3,3]})
editor.put("materialData", materialData)
~~~

~~~
///fold:
var plotter = function(dist, data, maxClasses){  
  console.log('Entire dataset:')
  viz.scatterShapes(data, {xBounds:[-3,3], yBounds:[-3,3]})

  console.log('Classes:')
  var classIdxs = _.last(dist.samples).value.classIdxs
  map(function(classIdx) {
    var idxs = filter(function(i) {classIdxs[i]==classIdx}, _.range(data.length))
    if(idxs.length>0) {
      viz.scatterShapes(map(function(i) {data[i]}, idxs), {xBounds:[-3,3], yBounds:[-3,3]})  
    }
  }, _.range(maxClasses))


  console.log("Shape concentration parameter:")
  viz.density(marginalize(dist, function(x){return x.distParams.shapeAlpha}),{bounds:[0,5]})
  console.log("Color concentration parameter:")
  viz.density(marginalize(dist, function(x){return x.distParams.colorAlpha}),{bounds:[0,5]})
}
///
var makeModelQuery = editor.get('makeModelQuery')
var data = editor.get("materialData")
var shapes = ["circle", "triangle", "square"]
var colors = ["yellow","purple","pink"]
var maxClasses = 4

var model = makeModelQuery(data,shapes,colors,maxClasses)

var dist = Infer({method:"MCMC", burn:10000, lag:100, callbacks: [editor.MCMCProgress()]}, model)
plotter(dist, data, maxClasses)
~~~

~~~
///fold:
var plotter = function(dist, data, maxClasses){  
  console.log('Entire dataset:')
  viz.scatterShapes(data, {xBounds:[-3,3], yBounds:[-3,3]})

  console.log('Classes:')
  var classIdxs = _.last(dist.samples).value.classIdxs
  map(function(classIdx) {
    var idxs = filter(function(i) {classIdxs[i]==classIdx}, _.range(data.length))
    if(idxs.length>0) {
      viz.scatterShapes(map(function(i) {data[i]}, idxs), {xBounds:[-3,3], yBounds:[-3,3]})  
    }
  }, _.range(maxClasses))


  console.log("Shape concentration parameter:")
  viz.density(marginalize(dist, function(x){return x.distParams.shapeAlpha}),{bounds:[0,5]})
  console.log("Color concentration parameter:")
  viz.density(marginalize(dist, function(x){return x.distParams.colorAlpha}),{bounds:[0,5]})
}
///
var makeModelQuery = editor.get('makeModelQuery')
var data = editor.get("materialData")
var newData = data.concat([{sx:0.5, v:-1.3, shape:"cross", color:"orange"}])
var shapes = ["circle", "triangle", "square", "cross"]
var colors = ["yellow","purple","pink", "orange"]
var maxClasses = 4

var model = makeModelQuery(newData,shapes,colors,maxClasses)
var dist =  Infer({method:"MCMC", burn:50000, lag:500, callbacks: [editor.MCMCProgress()]}, model)
editor.put("materialCrossDist", dist)
plotter(dist, newData, maxClasses)
~~~

~~~
var imagineColor = editor.get("imagineColor")
var dist = editor.get("materialCrossDist")
var colors = ["yellow","purple","pink", "orange"]
var shapes = ["circle", "triangle", "square", "cross"]

var distOrange = Infer({method:"rejection", samples:30}, 
  function(){return imagineColor("orange",dist,colors,shapes)})
viz.scatterShapes(map(function(x){x.value}, distOrange.samples), {xBounds:[-3,3], yBounds:[-3,3]})
~~~

~~~
var imagineShape = editor.get("imagineShape")
var dist = editor.get("materialCrossDist")
var colors = ["yellow","purple","pink", "orange"]
var shapes = ["circle", "triangle", "square", "cross"]


var distCross = Infer({method:"rejection", samples:50}, 
  function(){return imagineShape("cross",dist,colors,shapes)})
viz.scatterShapes(map(function(x){x.value}, distCross.samples), {xBounds:[-3,3], yBounds:[-3,3]})
~~~

<b>Before submission please make sure all of the figures you want to include are visible above.</b><br/>
If not, you can use the 'Run All' button below to re-run all of your code.<br/>

To submit your work, click the export button and then upload the result to stellar.
<table>
<tr>
<td>
<a id="runBtn"><button style="color:black">Run All</button></a>
<a id="exportBtn"><button style="color:black">Export</button></a>
</td>
<td>Import: <input type="file" id="files" name="files[]" /></td></tr></table>

<br/><br/><br/><br/><br/><br/>

