# vivus.js

Demo available on http://maxwellito.github.io/vivus

Vivus is a little JavaScript class (little because it's lightweight and have no dependency) to make drawing animation with SVGs in a webpage. Different animations are available, even scripting the entire SVG to do whatever you want.

## Animations

On the following images, the pink color represent the `duration` value, and the blue is for the `delay` value.

### Delayed

![Timeline for delayed animation](https://raw.github.com/maxwellito/vivus/master/assets/delayed.png)

Every path element is drawn at the same time with a little delay at the start. This is the animation by default.

### Async

![Timeline for async animation](https://raw.github.com/maxwellito/vivus/master/assets/async.png)

Each line is drawn asynchronously. They all starts and finishes at the same time, this is why `async`.

### OneByOne

![Timeline for oneByOne animation](https://raw.github.com/maxwellito/vivus/master/assets/oneByOne.png)

Each path element is drawn one after each other. This animation give a proper impression of live drawing. The duration for each line depends on their length, to make a constant drawing speed.

## Principles

To make this effect, the script use the CSS property `strokeDashoffset`. This property manage the stroke offset on every line of the SVG. Add some JavaScript to update progressively this value, and the magic begins.

Unfortunately, there's a problem, this property is only available on path elements. Or, in a SVG there a lot of `circle`, `rect`, `line`, `polyline`... and they are breaking the animation. So an other class is available in the repo, called pathformer. It's made to transform all objects of your SVG into `path` elements, to can use the property and animate your SVG.

*The animation always draw elements in the same order as they are defined in the SVG tag.*

There is few conditions about your SVG:

- Every element mustn't be filled, but have a stroke (of your choice, go crazy). Because the animation is based on it
- Do not have any hidden path elements in your SVG, Vivus consider them all eligible to be animated. So think to remove them before playing with it, or the animation might look tricky with blank and gaps.

The code is quite inspired from other repo. The drawer is inspired from the excellent [Codrops](http://tympanus.net/codrops/) about the post [SVG Drawing Animation](http://tympanus.net/codrops/2013/12/30/svg-drawing-animation/) (if you don't know this website, get ready for mind-blowing). Then for the pathformer, there's a lot of works from [SVGPathConverter](https://github.com/Waest/SVGPathConverter) by [Waest](https://github.com/Waest).

## Usage

As I said, no dependencies here. Just need to include the scripts.

```js
new Vivus('my-svg-id', {type: 'delayed', duration: 200}, myCallback);
```

The Vivus constructor asks 3 parameters :

- ID of the SVG to animate (or the DOM element)
- Option object (described in the following)
- Callback to call at the end of the animation (optional)


The option object must respect this structure :

- `type` (string) define what kind of animation will be used: `delayed`, `async`, `oneByOne` or `script`
- `duration` (integer) animation duration, in frames
- `start` (string)
define how to trigger the animation
  - `inViewport` once the SVG is in the viewport
  - `manual` give you the freedom to call draw method to start
  - `autostart` make it start right now
- `delay` (integer)
time between the drawing of first and last path, in frames (only for delayed animations)

## Scripting

This feature is still in beta and a bit fragile, it allow you to script the animation of your SVG. It's not the sexiest code ever, but quite flexible, and easy to use, I would say. The behaviour is quite different, let's see.

First, the animation must be set with the type script. The behaviour is the same as `oneByOne` : synchronous.
At this point, the attributes duration and delay are the default value for each path element (so not global for the entire animation, as before). It means, if the options define 20 for duration and 2 for delay : each path element will take 20 frames to be draw, and 2 frames before to start.

Second, define a custom rules for each element in your SVG via extra attributes in your SVG DOM :

- `data-delay` (integer)
time between the end of the animation of the previous path and the start of the current path, in frames
- `data-duration` (integer)
duration of this path animation, in frames
- `data-async` (no value required)
make the drawing of this path asynchronous. It means the next path will start at the same time.
If a path does not have an attribute for duration or delay: the default one, set in options, will be used.

Example: here is a simple SVG, containing 5 elements. With the following options `{duration: 20, delay: 0}`, we should get this timeline

![Timeline for script animation by default](https://raw.github.com/maxwellito/vivus/master/assets/script_default.png)

This looks like 'oneByOne' animation, synchronous mode. But to make it a bit custom, here is what I can do:

```html
<svg>
	<path data-duration="10" .../>
	<path data-delay="10" data-async .../>
	<path data-delay="15" .../>
	<path data-duration="10" data-delay="45" data-async .../>
	<path data-duration="50" data-delay="5" .../>
</svg>
```

This scenario should give us

![Timeline for this custom script animation](https://raw.github.com/maxwellito/vivus/master/assets/script_custom.png)


I'm sorry if it does not look very sexy, and it's not really easy to use. I'm happy to make any change, as long as the idea sounds interesting. Post an issue, I'll be very happy to talk about it!

The road is still long, add features, add tests, add Grunt tasks, make the code better... fix the terrible english in the documentation.

## TO DO

[ ] Explain recommandations for SVG structure (no fill, just strokes) and any hidden item
[ ] Detail new type 'scenario'
[x] Set up new animation type : 'scenario'
[x] New play system (play, pause)
[ ] Tests bitch!
[x] Review comments for JSdoc (and better comments)
[x] Add SVG source for doc pictures
