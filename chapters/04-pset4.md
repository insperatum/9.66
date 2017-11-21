---
layout: chapter
hidden: false
title: Problem Set 4
description: Due Friday, Dec 1 at 6pm
custom_js: assets/js/save_v2.js
---
<script type="text/javascript">autosaveTo = "pset4"</script>
<div id="autosaveTxt" style="font-style:italic"></div>


In this problem set, we will build a [hierarchical Bayesian model](https://probmods.org/chapters/09-hierarchical-models.html) to learn about object categories in the world, by observing how different objects move. First, we need to get familiar with webppl's built-in physics engine. We are going to use it to simulate data from the world. 

# Question 1: Preliminaries on the webppl physics engine
Box2D is a two dimensional physics simulator for simulating moving shapes. Here, we go through how to use webppl to create shapes, simulate physics, and make physical measurements (e.g., measure a shape's velocity). We will not go over how to do inference in a probabilistic physics engine because it is not required for this problem set, but it is covered in the last examples in [the second chapter](https://probmods.org/chapters/02-generative-models.html) of probmods.  

> **a) Creating and simulating worlds**

In Box2D, the state of the world at time $$t$$ is defined by a list of objects with the following properties:
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

//Defining the world. 
//Note that the state of the world is completely defined by a list of objects:
var initialWorld = [ground, tower] 
//Simulating and animating the world
physics.animate(1000, initialWorld); 
~~~

> **b) Measuring motion**

In order to learn about objects, we need some way of gathering data from the world. In this problem set, we focus on motion data so here we will plot how a shape's position and velocity change over time.

To do this, we need to simulate the world state at multiple time points, then read off the motion data at each time point. We will use `physics.run(t, initialWorld)`, which returns the world state at time $$t$$. Just as `initialWorld` is a list of objects, the output of `physics.run` is a list of objects. 

**i)** First, define a green sliding box with initial position `worldWidth/2-100` and initial velocity `[500,0]`. Then, complete the simulation code by a) defining a list of times from 0 to 500 in steps of 20, by using [_.range](http://underscorejs.org/#range); b) filling in the [map](http://docs.webppl.org/en/master/functions/arrays.html) to return a list of world states at the specified time points.
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

We give an example of using `find` to find the position of your sliding box at the time when its $$x$$ velocity has halved. Imitate our example to find the velocity of the box when it passes the center point of the physics engine, `worldWidth/2`. 
~~~
var worlds_t = editor.get("worlds_t")

//find the world where the boolean is true
var halfSpeed = find(function(w_t){return w_t[0].velocity[0] < (worlds_t[0][0].velocity[0]/2)}, worlds_t)
//extract the property of interest
var halfSpeed_pos = halfSpeed[0].x

/*your code here*/
//print your answer 

~~~ 

# Question 2: Learning about object categories

How might a child start to build an intuitive theory of how an object's physical properties relate to its motion? One possibility is to group objects into categories, with each category defining a distribution over both motion properties (speed and displacement) and physical makeup (shape and material). In addition, rather than learning about each category in isolation, they might also develop higher-order beliefs about categories in general - for example, they might learn a ‘shape bias’. In this problem set, we will frame this learning process as inference in a hierarchical Bayesian model, similar to the ones discussed in class. 

 The animation in the following code box illustrates our problem domain. In our world, there are objects of various shapes and materials (indicated by their colour). We will observe the motion of these objects when we drop them onto a ramp. Unfold the code below to play with the object definitions and explore how different objects move. What are your hypotheses about how objects' physical properties relate to their motion?
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
var index = sample(RandomInteger({n:3})) //running the code again randomly chooses between three objects predefined in the fold
var initialWorld = [ground, ramp, objects[index]]
physics.animate(1000,initialWorld)
~~~

> **a) Measuring motion**

In the code block below, the variable `objects` contains a list of 10 shapes found in our world. For each shape, we set `x` and `y` so that they will be dropped from the same point onto the ramp.

**i)** Use `find` to collect the following motion data for each object: 
* `d`, the final $$x$$ position of the object (the first $$pos_x$$ such that $$vel_x$$ < 0.5)
* `v`, the magnitude of  the velocity vector of the shape when it exits the ramp ($$\sqrt{vel_x^2 + vel_y^2}$$ when the shape has just passed the rightmost edge of the ramp, at `worldWidth/2 - 125`)

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
var posDist = {mu:listMean(map(function(o) {return o.motion.sx}, motionData)),
               std:listStdev(map(function(o) {return o.motion.sx}, motionData))}
var velDist = {mu:listMean(map(function(o) {return o.motion.v}, motionData)),
               std:listStdev(map(function(o) {return o.motion.v}, motionData))}
var data = map(function(o) {
  return {
    sx:(o.motion.sx-posDist.mu) / posDist.std,
    v:(o.motion.v-velDist.mu) / velDist.std,
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

Unlike [Kemp et al. (2007)](http://web.mit.edu/cocosci/Papers/devsci07_kempetal.pdf) our hierarchical Bayesian model won't assume that the category each object belongs to is known in advance; rather, we will learn the assignment of objects to categories alongside the parameters for each category.

<img src="/assets/img/slide.png" alt="Graphical model" align="right" style="width: 250px;"/>

Specifically, we're going to model our data using a [mixture model](https://en.wikipedia.org/wiki/Mixture_model#General_mixture_model). We'll assume that each of our $$N=10$$ observations was drawn one of $$K=4$$ categories, with prior category probabilities given by $$\pi_{cat}$$. $$z_i$$ indicates which category object $$i$$ belongs to. Within each category, we'll assume that the motion properties (distance and velocity) vary Normally around some mean values $$\mu_{d}$$ and $$\mu_v$$, while the colour and shapes are drawn from Categorical distributions with parameters $$\pi_{color}$$ and $$\pi_{shape}$$.

How much should objects drawn from a typical category vary in color, or shape? This variation will be expressed by the concentration parameter $$\alpha$$ for a Dirichlet distribution: a value of $$\alpha_{color}$$ close to 0 would mean that categories are usually dominated by only a single color, while a very large value of $$\alpha_{color}$$ would mean that every category has a close to uniform distribution of colors. Rather than assume we know $$\alpha_{color}$$ and $$\alpha_{shape}$$ in advance, we'll put priors on them and try to infer them from the data.

In making a comparison to [Kemp et al. (2007)](http://web.mit.edu/cocosci/Papers/devsci07_kempetal.pdf), note that we are inferring the parameter of a symmetric Dirichlet distribution, i.e., $$\alpha_{color}$$ = [$$\alpha$$, $$\alpha$$, $$\alpha$$]. The equivalent parameter settings in Kemp et al. (2007) is inferring a univariate $$\alpha$$ and fixing $$\beta$$ = [1/3, 1/3 1/3]. This expresses that we believe that there is no net bias towards any particular shape or colour, and we will learn whether the proportions differ between categories.

**i)** Complete the model query below.
~~~
var makeModelQuery = function(data, shapes, colors){
  return function(){
    var maxClasses = 4

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
    var classIdxs = map(function(o) {
      var i = sample(Discrete({ps:distParams.classProbs}))
      observe(Gaussian({mu:classParams[i].mu_sx, sigma:classParams[i].sigma_sx}), d.sx)
      observe(Gaussian({mu:classParams[i].mu_v, sigma:classParams[i].sigma_v}), d.v)
      observe(Categorical({ps:classParams[i].p_color, vs:colors}), o.color)
      observe(Categorical({ps:classParams[i].p_shape, vs:shapes}), o.shape)
      return i
    }, data)

    return {distParams:distParams, classParams:classParams, classIdxs:classIdxs}
  }
}
editor.put('makeModelQuery',makeModelQuery)
~~~

**ii)** In 3 sentences, evaluate the assumptions that go into the model. 

<textarea class="textAnswer" rows="4" cols="80"></textarea><br/>

> **c) One-shot learning** 

Given our hierarchical set of priors (embodied in the two sets of `sample` statements) and our likelihood (embodied in `observe` statements), we can infer what objects are in which clusters, the parameters of the distributions that define each cluster, and the distributions over those class parameters. In this question, we'll see how learning at several levels enables generalization from a single example. 

**i)** First, let's examine what our model learns from the data we've collected so far. There is no code to complete here, you can just run the code. `plotter` is defined in the fold, in case you'd like to look at it. 
~~~
///fold:
var plotter = function(dist, data){  
  console.log('Entire dataset:')
  viz.scatterShapes(data, {xBounds:[-3,3], yBounds:[-3,3]})

  console.log('Classes:')
  var classIdxs = _.last(dist.samples).value.classIdxs
  map(function(classIdx) {
    var idxs = filter(function(i) {classIdxs[i]==classIdx}, _.range(data.length))
    if(idxs.length>0) {
      viz.scatterShapes(map(function(i) {data[i]}, idxs), {xBounds:[-3,3], yBounds:[-3,3]})  
    }
  }, _.union(classIdxs))

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

var model = makeModelQuery(data,shapes,colors)

var dist = Infer({method:"MCMC", burn:10000, lag:100, callbacks: [editor.MCMCProgress()]}, model)
plotter(dist, data)
~~~

Do the inferred clusters match your intuition? Relate the inferred clusters to the posterior over the concentration parameters - how do differences in the concentration parameters relate to the make up of the inferred clusters? 

<textarea class="textAnswer" rows="4" cols="80"></textarea><br/>

**ii)** We find an orange cross - an object with a shape and material that we've never encountered before. We drop it on the ramp, and observe that `sx = 0.5` and `v = -1.3`. Add this observation to your dataset using `.concat`, and update the other inputs to makeModelQuery. Run the code in order to infer new object classes. 
~~~
///fold:
var plotter = function(dist, data){  
  console.log('Entire dataset:')
  viz.scatterShapes(data, {xBounds:[-3,3], yBounds:[-3,3]})

  console.log('Classes:')
  var classIdxs = _.last(dist.samples).value.classIdxs
  map(function(classIdx) {
    var idxs = filter(function(i) {classIdxs[i]==classIdx}, _.range(data.length))
    if(idxs.length>0) {
      viz.scatterShapes(map(function(i) {data[i]}, idxs), {xBounds:[-3,3], yBounds:[-3,3]})  
    }
  }, _.union(classIdxs))


  console.log("Shape concentration parameter:")
  viz.density(marginalize(dist, function(x){return x.distParams.shapeAlpha}),{bounds:[0,5]})
  console.log("Color concentration parameter:")
  viz.density(marginalize(dist, function(x){return x.distParams.colorAlpha}),{bounds:[0,5]})
}
///
var makeModelQuery = editor.get('makeModelQuery')
var data = editor.get("data")
var newObservation = [{sx:0.5, v:-1.3, shape:"cross", color:"orange"}]
var newData = /* your code here */
var shapes = /* your code here */
var colors = /* your code here */ 


var model = makeModelQuery(newData,shapes,colors)
var dist =  Infer({method:"MCMC", burn:50000, lag:500, callbacks: [editor.MCMCProgress()]}, model)
editor.put("crossDist", dist)
plotter(dist, newData)
~~~

In a sentence, compare the inferred clusters with this new observation, and the clusters in the previous question. If the inferred clusters do not match your intuition, explain what you had expected and why.

<textarea class="textAnswer" rows="2" cols="80"></textarea><br/>

> **d) Overhypotheses in imagination**

In class, we discussed the _shape bias_ -- when learning the names of objects, North American children generalize a new label for an object to other objects of the same shape, rather than objects with the same color or texture. This is an example of an _overhypothesis_: in addition to learning what names correspond to which objects, children learn about what object names tend to mean in general. [Kemp et al. (2007)](http://web.mit.edu/cocosci/Papers/devsci07_kempetal.pdf) show that hierarchical Bayesian models enable the acquisition of such abstract knowledge, as well as one-shot learning of specific instances. 

In this question, we will examine how abstract knowledge embodied by our model allows us to reason about objects we have never seen before. 

**i)** What kind of motion properties do we imagine a orange circle would have? How about a orange triangle? We have never seen these objects, but you probably have intuitions about how they would move. The code in this textbox and the next uses the distribution inferred in the last question to imagine oranges shapes and their motion. Run these code boxes to view samples from the model's imagined distribution over orange shapes. There is no code to complete in either this codebox or the next. 
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

**ii)** You likely also have intuitions about how a red cross would move despite never having seen one. Let's check whether your intuitions match the model inferences. Define the function `imagineShape` to be analogous to `imagineColor`, such that it "imagines" crosses of various colors and their motion. 
~~~
var imagineShape = function(shape,dist,colors,shapes) {
  /* your code here */
  return {x:x, y:y, color:color, shape:shape}
}
editor.put("imagineShape",imagineShape)
~~~

Run the code below to view samples from the model's imagined distribution over crosses of various materials.

~~~
var imagineShape = editor.get("imagineShape")
var dist = editor.get("crossDist")
var colors = ["red", "green", "blue", "orange"]
var shapes = ["circle", "triangle", "square", "cross"]

var distCross = Infer({method:"rejection", samples:25}, 
  function(){return imagineShape("cross",dist,colors,shapes)})
viz.scatterShapes(map(function(x){x.value}, distCross.samples), {xBounds:[-3,3], yBounds:[-3,3]})
~~~

Describe the distribution of the model's imagined orange shapes, and the distribution of the model's imagined crosses of various materials. What overhypotheses has the model learned, and how does that abstract knowledge manifest in the model's imagination? What inferred model parameters reflect these overhypotheses? 

<textarea class="textAnswer" rows="8" cols="80"></textarea><br/>

# Question 3: Learning in a new world

What would the same model learn in a world with different types of objects? In this new world, we have objects made of materials that are `pink`, `purple`, and `yellow`. You can play with the simulator below to get some intuition for how these objects move (again, `objects` is defined in the fold).

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

What are your hypotheses about how the relationship between object properties and motion differs from what we inferred in the previous question? We'll see how a model in this different world can learn to make different one-shot generalizations. 

> **a) Inferring object classes** 

**i)** Fill in two lines of code below to collect motion data from the variable `objects`, which contains a list of ten objects found in this new world.
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

/* your code here to infer motion properties of the variable 'objects' 
you should be able to use editor.get */

///fold:
var posDist = {mu:listMean(map(function(o) {return o.motion.sx}, motionData)),
               std:listStdev(map(function(o) {return o.motion.sx}, motionData))}
var velDist = {mu:listMean(map(function(o) {return o.motion.v}, motionData)),
               std:listStdev(map(function(o) {return o.motion.v}, motionData))}
var materialData = map(function(o) {
  return {
    sx:(o.motion.sx-posDist.mu) / posDist.std,
    v:(o.motion.v-velDist.mu) / velDist.std,
    shape: d.object.shape,
    color: d.object.color,  
  }
}, motionData)
///

//plot your experimental results
viz.scatterShapes(materialData, {xBounds:[-3,3], yBounds:[-3,3]})
editor.put("materialData", materialData)
~~~

In two sentences, comment on the patterns you see in the data and describe how this differs from the data collected in the previous question.

<textarea class="textAnswer" rows="6" cols="80"></textarea><br/>

**ii)** Using the model from question 2, what clusters and concentration parameters are inferred from this data? Complete the following code in the style of question 2c,i) in order to run inference. 
~~~
///fold:
var plotter = function(dist, data){  
  console.log('Entire dataset:')
  viz.scatterShapes(data, {xBounds:[-3,3], yBounds:[-3,3]})

  console.log('Classes:')
  var classIdxs = _.last(dist.samples).value.classIdxs
  map(function(classIdx) {
    var idxs = filter(function(i) {classIdxs[i]==classIdx}, _.range(data.length))
    if(idxs.length>0) {
      viz.scatterShapes(map(function(i) {data[i]}, idxs), {xBounds:[-3,3], yBounds:[-3,3]})  
    }
  }, _.union(classIdxs))


  console.log("Shape concentration parameter:")
  viz.density(marginalize(dist, function(x){return x.distParams.shapeAlpha}),{bounds:[0,5]})
  console.log("Color concentration parameter:")
  viz.density(marginalize(dist, function(x){return x.distParams.colorAlpha}),{bounds:[0,5]})
}
///

/* your code here, should be similar to 2.c.i */

var dist = Infer({method:"MCMC", burn:10000, lag:100, callbacks: [editor.MCMCProgress()]}, model)
plotter(dist, data)
~~~

How does the relationship between the clusters and concentration parameters differ from question 2? What overhypotheses has this model learned? 

<textarea class="textAnswer" rows="6" cols="80"></textarea><br/>

> **b) Generalizations from a single datapoint** 

**i)** Given these overhypotheses, how will the model make inferences after observing an object it has never seen before? Specifically, let's see what the model infers about the same orange cross from question 2. There is no code to complete here. 
~~~
///fold:
var plotter = function(dist, data){  
  console.log('Entire dataset:')
  viz.scatterShapes(data, {xBounds:[-3,3], yBounds:[-3,3]})

  console.log('Classes:')
  var classIdxs = _.last(dist.samples).value.classIdxs
  map(function(classIdx) {
    var idxs = filter(function(i) {classIdxs[i]==classIdx}, _.range(data.length))
    if(idxs.length>0) {
      viz.scatterShapes(map(function(i) {data[i]}, idxs), {xBounds:[-3,3], yBounds:[-3,3]})  
    }
  }, _.union(classIdxs))


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

var model = makeModelQuery(newData,shapes,colors)
var dist =  Infer({method:"MCMC", burn:50000, lag:500, callbacks: [editor.MCMCProgress()]}, model)
editor.put("materialCrossDist", dist)
plotter(dist, newData)
~~~

How is this inference similar to and different than 2.c,ii)? Consider the clusters and the concentration parameters.

<textarea class="textAnswer" rows="6" cols="80"></textarea><br/>

**ii)** Now, let's examine these overhypotheses through the lens of imagination. Run the following codeboxes to see how this model imagines orange shapes and crosses of various colours based on the distribution inferred above in part i). There is no code to complete here. 
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

Explain why the model in question three imagines different data from the model in question two, after seeing the same new observation.

<textarea class="textAnswer" rows="4" cols="80"></textarea><br/>

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

