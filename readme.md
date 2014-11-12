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
- `selfDestroy` (boolean) remove all extra styling on the SVG, and leave it as original

The Vivus object got 3 controls methods:

- `play(speed)` Play the animation with the speed given in parameter. This value can be negative to go backward, between 0 and 1 to go slowly, or superior to 1 to go fast. By default the value is 1.
- `stop()` Stop the animation.
- `reset()` Reinitialise the SVG to the original state: undraw.

## Scenarize

This feature allow you to script the animation of your SVG. For this, the custom values will be set directly in the DOM of the SVG.

### `scenario`

This type is easier to understand, but longer to implement. You just have to define the start and duration of each element with `data-start` and `data-duration` attributes. If missing, it will use the default value given to the constructor.
The good point about this type is the flexibility. You don't have to respect the order/stack of the SVG. You can start with the last element, then continue with the first, to finish with all the rest at the same time.

Then define custom rules for each element in your SVG via extra attributes in your SVG DOM :

- `data-start` (integer)
time when the animation must start, in frames
- `data-duration` (integer)
animation duration of this path, in frames


```html
<svg>
  <path data-start="0" data-duration="10" .../>
  <path data-start="20" data-duration="10" .../>
  <path data-start="20" data-duration="20" .../>
  <path data-start="0" data-duration="30" .../>
</svg>
```

### `scenario-sync`

It's not the sexiest code ever, but quite flexible. The behaviour is quite different, let's see.
By using this animation type, the default behaviour is the same as `oneByOne`. But here, you can define some properties on a specific path item. Like the duration, the delay to start (from the end of the previous path) and if it should be played asynchronously.

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

## Development

To make it easy, a gulp file is set up to automise minifying, JShint and tests.
If you have never used Gulp before, this is a good opportunity. To use it, you need to install NodeJS first then run `sudo npm install -g gulp`.

To start, you need to install the repo dependencies:

```bash
$ npm install
```

Then you can run Gulp with one of the following tasks:

- `distrib` make the build (generate `dist/vivus.js` and `dist/vivus.min.js`)
- `lint` run JShint on the source files
- `test` run Karma
- `develop` keep watching your files, if any change is applied, Gulp will run the task(s) related to it.

## Troubleshoot

For Firefox users, you might encounter some glitches, depending on your SVG and browser version. On versions before 36, there is a problem to retrieve path length via `getTotalLength` method. Returning 174321516544 instead of 209 (I'm not exaggerating, it come from a real case), messing up the entire animation treatment. Unfortunately, there's nothing that this library can do, this is due to Firefox. I hope to find a workaround. At the moment, I can only recommend you to test your animation on previous versions of Firefox.

## Debug

For an easier debug, have a look to the attribute `map` of your Vivus object. This one contain the mapping of your animation. If you're using Google Chrome, I recommend you to use `console.table` to get a nice output of the array, which will make your debug easier.

```javascript
var logo = new Vivus('myLogo', {type: 'scenario-sync'});

// The property 'map' contain all the SVG mapping
console.table(logo.map);
```
