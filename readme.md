# vivus.js

Demo available on http://maxwellito.github.io/vivus

Play with it on [Vivus Instant](https://maxwellito.github.io/vivus-instant/)

Vivus is a lightweight JavaScript class (with no dependencies) that allows you to animate SVGs, giving them the appearance of being drawn. There are a variety of different animations available, as well as the option to create a custom script to draw your SVG in whatever way you like.

Available via:

- [NPM](https://www.npmjs.com/package/vivus): `npm install vivus`
- [Bower](http://bower.io/): `bower install vivus`
- [jsDelivr CDN](http://www.jsdelivr.com/#!vivus): `//cdn.jsdelivr.net/npm/vivus@latest/dist/vivus.min.js`
- [CDNJS CDN](https://cdnjs.com/libraries/vivus)
- [WebJars](http://www.webjars.org/)

Join the conversation on [Gitter](https://gitter.im/maxwellito/vivus)

Try Vivus with your SVG on [Vivus Instant](https://maxwellito.github.io/vivus-instant/). If you plan to use the library to animate a single SVG without callback or controls, this will allow you to download your animated SVG, powered by CSS, JavaScript free.

## Animations

On the following images, the pink color represents the `duration` value, and the blue one is for `delay` value.

### Delayed

![Timeline for delayed animation](https://raw.github.com/maxwellito/vivus/master/assets/delayed.png)

Every path element is drawn at the same time with a small delay at the start. This is currently the default animation.

### Sync

![Timeline for sync animation](https://raw.github.com/maxwellito/vivus/master/assets/sync.png)

Each line is drawn synchronously. They all start and finish at the same time, hence the name `sync`.

### OneByOne

![Timeline for oneByOne animation](https://raw.github.com/maxwellito/vivus/master/assets/oneByOne.png)

Each path element is drawn one after the other. This animation gives the best impression of live drawing. The duration for each line depends on their length to make a constant drawing speed.

## Principles

To get this effect, the script uses the CSS property `strokeDashoffset`. This property manages the stroke offset on every line of the SVG. Now, all we have to do is add some JavaScript to update this value progressively and the magic begins.

However, there's a problem with this. The `strokeDashoffset` property is only available on the path elements. This is an issue because in an SVG there are a lot of elements such as `circle`, `rect`, `line` and `polyline` which will break the animation. So to fix this, there is another class available in the repo called `pathformer`. It's made for transforming all objects of your SVG into `path` elements to be able to use `strokeDashoffset` and animate your SVGs.

_The animation always draws elements in the same order as they are defined in the SVG tag._

There are few conditions that your SVG must meet:

- All elements must have a stroke property and cannot be filled. This is because the animation only looks to progressively draw strokes and will not check for filled colours. For example: fill: "none"; stroke: "#FFF";

- You should avoid creating any hidden path elements in your SVG. Vivus considers them all eligible to be animated, so it is advised to remove them before playing with it. If they are not removed the animation might not achieve the desired effect, with blank areas and gaps appearing.

- `text` elements aren't allowed, they cannot be transformed into `path` elements. See [#22](https://github.com/maxwellito/vivus/issues/22) for more details.

The code is inspired from other repositories. The drawer is inspired from the excellent [Codrops](http://tympanus.net/codrops/) about the post [SVG Drawing Animation](http://tympanus.net/codrops/2013/12/30/svg-drawing-animation/) (if you don't know this website, get ready to have your mind blown). Then for the pathformer, there is a lot of work from [SVGPathConverter](https://github.com/Waest/SVGPathConverter) by [Waest](https://github.com/Waest).

## Usage

As I said, no dependencies here. All you need to do is include the scripts.

**Inline SVG**

```html
<svg id="my-svg">
  <path...>
  <path...>
  <path...>
</svg>

<script>
  new Vivus('my-svg', {duration: 200}, myCallback);
</script>
```

**Dynamic load**

```html
<object id="my-svg" type="image/svg+xml" data="link/to/my.svg"></object>

<script>
  new Vivus('my-svg', { duration: 200 }, myCallback);
</script>
```

or

```html
<div id="my-div"></div>

<script>
  new Vivus('my-div', { duration: 200, file: 'link/to/my.svg' }, myCallback);
</script>
```

By default the `object` created will take the size of the parent element, this one must have a height and width or your SVG might not appear.

If you need to edit this object, it is accessible in the `onReady` callback:

```js
new Vivus('my-div-id', {
  file: 'link/to/my.svg',
  onReady: function (myVivus) {
    // `el` property is the SVG element
    myVivus.el.setAttribute('height', 'auto');
  }
});
```

Check out the [hacks page](https://github.com/maxwellito/vivus/blob/master/hacks.md) for more tricks.

### Constructor

The Vivus constructor asks for 3 parameters:

- ID (or object) of DOM element to interact with.<br/>It can be an inline SVG or a wrapper element to append an object tag from the option `file`
- Option object (described in the following |
- Callback to call at the end of the animation (optional)

### Option list

| Name                 | Type     | Description                                                                                                                                                                                                     |
| -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`               | string   | Defines what kind of animation will be used: `delayed`, `sync`, `oneByOne`, `script`, `scenario` or `scenario-sync`. [Default: `delayed`]                                                                       |
| `file`               | string   | Link to the SVG to animate. If set, Vivus will create an object tag and append it to the DOM element given to the constructor. Be careful, use the `onReady` callback before playing with the Vivus instance.   |
| `start`              | string   | Defines how to trigger the animation (`inViewport` once the SVG is in the viewport, `manual` gives you the freedom to call draw method to start, `autostart` makes it start right now). [Default: `inViewport`] |
| `duration`           | integer  | Animation duration, in frames. [Default: `200`]                                                                                                                                                                 |
| `delay`              | integer  | Time between the drawing of first and last path, in frames (only for `delayed` animations).                                                                                                                     |
| `onReady`            | function | Function called when the instance is ready to play.                                                                                                                                                             |
| `pathTimingFunction` | function | Timing animation function for each path element of the SVG. Check the [timing function part](#timing-function).                                                                                                 |
| `animTimingFunction` | function | Timing animation function for the complete SVG. Check the [timing function part](#timing-function).                                                                                                             |
| `dashGap`            | integer  | Whitespace extra margin between dashes. Increase it in case of glitches at the initial state of the animation. [Default: `2`]                                                                                   |
| `forceRender`        | boolean  | Force the browser to re-render all updated path items. By default, the value is `true` on IE only. (check the 'troubleshoot' section for more details).                                                         |
| `reverseStack`       | boolean  | Reverse the order of execution. The default behaviour is to render from the first 'path' in the SVG to the last one. This option allow you to reverse the order. [Default: `false`]                             |
| `selfDestroy`        | boolean  | Removes all extra styling on the SVG, and leaves it as original.                                                                                                                                                |

### Methods

| Name                         | Description                                                                                                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `play(speed, callback)`      | Plays the animation with the speed given in parameter. This value can be negative to go backward, between 0 and 1 to go slowly, >1 to go faster, or <0 to go in reverse from current state. [Default: `1`]. Callback executed after the animation is finished (optional) |
| `stop()`                     | Stops the animation.                                                                                                                                                                                                                                                     |
| `reset()`                    | Reinitialises the SVG to the original state: undrawn.                                                                                                                                                                                                                    |
| `finish()`                   | Set the SVG to the final state: drawn.                                                                                                                                                                                                                                   |
| `setFrameProgress(progress)` | Set the progress of the animation. Progress must be a number between 0 and 1.                                                                                                                                                                                            |
| `getStatus()`                | Get the status of the animation between `start`, `progress`, `end`                                                                                                                                                                                                       |
| `destroy()`                  | Reset the SVG but make the instance out of order.                                                                                                                                                                                                                        |

These methods return the object so you can chain the actions.

```js
const myVivus = new Vivus('my-svg-id');
myVivus
  .stop()
  .reset()
  .play(2);
```

#### Play method callback

Instead of using the global constructor callback when you create the Vivus object, you can add callbacks to be
executed for specific `play` method calls.

```js
const myVivus = new Vivus('my-svg-id');
myVivus.play(1, function() {
  // called after the animation completes
});

// alternativly if you leave the speed param blank and use the default, you
// can pass the callback as the first parameter like so.
myVivus.play(function() {
  // called after the animation completes
});
```

## Timing function

To give more freedom, it's possible to override the animation of each path and/or the entire SVG. It works a bit like the CSS animation timing function. But instead of using a cubic-bezier function, it use a simple JavaScript function. It must accept a number as parameter (between 0 to 1), then return a number (also between 0 and 1). It's a hook.

If you don't want to create your own, timing methods are available via the constructor object: `EASE`, `EASE_IN`, `EASE_OUT` and `EASE_OUT_BOUNCE`. Then set it in the option object to enjoy them.

```js
// Here, the ease animation will be use for the global drawing.
new Vivus(
  'my-svg-id',
  {
    type: 'delayed',
    duration: 200,
    animTimingFunction: Vivus.EASE
  },
  myCallback
);
```

**WARNING**: `animTimingFunction` is called at every frame of the animation, and `pathTimingFunction` is also called at every frame for each path of your SVG. So be careful about them. Keep it simple, or it can affect the performance.

## Extra attributes

The attribute `data-ignore` allows you to ignore path tags from the vivus animation.

```html
<svg id="my-svg">
  <path...>
  <path data-ignore="true" ...>
  <path...>
</svg>
```

In this case, the second path won't be part of the animation.

## Scenarize

This feature allows you to script the animation of your SVG. For this, the custom values will be set directly in the DOM of the SVG.

### `scenario`

This type is easier to understand, but longer to implement. You just have to define the start and duration of each element with `data-start` and `data-duration` attributes. If it is missing, it will use the default value given to the constructor.
The best part of this type is the flexibility it provides. You don't have to respect the order/stack of the SVG and you can start with the last element, then continue with the first to finish with all the rest at the same time.

You will then have to define custom rules for each element in your SVG via extra attributes in your SVG DOM :

- `data-start` (integer)
  time when the animation must start, in frames
- `data-duration` (integer)
  animation duration of this path, in frames

```html
<svg>
  <path data-start="0" data-duration="10" ... />
  <path data-start="20" data-duration="10" ... />
  <path data-start="20" data-duration="20" ... />
  <path data-start="0" data-duration="30" ... />
</svg>
```

### `scenario-sync`

It's not the sexiest code ever, but it's quite flexible. In addition to this, the behaviour is fairly different.
By using this animation type, the default behaviour is the same as `oneByOne`. However, you can define some properties on a specific path item such as the duration, the delay to start (from the end of the previous path) and if it should be played synchronously.

- `data-delay` (integer)
  time between the end of the animation of the previous path and the start of the current path, in frames
- `data-duration` (integer)
  duration of this path animation, in frames
- `data-async` (no value required)
  make the drawing of this path asynchronous. It means the next path will start at the same time.
  If a path does not have an attribute for duration or delay then the default values, set in the options, will be used.

Example: here is a simple SVG containing 5 elements. With the following options `{duration: 20, delay: 0}`, we should get this timeline

![Timeline for script animation by default](https://raw.github.com/maxwellito/vivus/master/assets/script_default.png)

This looks like 'oneByOne' animation, synchronous mode. But to make it a bit custom, here is what I can do:

```html
<svg>
  <path data-duration="10" ... />
  <path data-delay="10" data-async ... />
  <path data-delay="15" ... />
  <path data-duration="10" data-delay="45" data-async ... />
  <path data-duration="50" data-delay="5" ... />
</svg>
```

This scenario should give us

![Timeline for this custom script animation](https://raw.github.com/maxwellito/vivus/master/assets/script_custom.png)

I'm sorry if it does not look very sexy, and it's not really easy to use. I'm happy to make any changes, as long as the idea sounds interesting. Post an issue and I'll be very happy to talk about it!

## Development

To make it simpler a gulp file is set up to automise minifying, JShint and tests.
If you have never used Gulp before this is a good opportunity. To use it, you need to install NodeJS first then run `sudo npm install -g gulp`.

To start, you will need to install the repo dependencies:

```bash
$ npm install
```

Then you can use NPM scripts to run the following tasks:

- `build` make the build (generate `dist/vivus.js` and `dist/vivus.min.js`)
- `lint` run ESlint on the source files
- `test` run Karma

## Troubleshoot

### Internet Explorer

Some SVG weren't working at all. The only solution found was to clone and replace each updated path element. Of course this solution requires more resources and a lot of DOM manipulation, but it will give a smooth animation like other browsers. This fallback is only applied on Internet Explorer (all versions), and can be disabled via the option `forceRender`.

Replacing each updated path by a clone was the only way to force IE to re-render the SVG. On some SVGs this trick is not necessary, but IE can be a bit tricky with this. If you're worried about performance, I would recommend checking if your SVG works correctly by disabling the `forceRender` option. If it works correctly on IE, then keep it like this.

By default, `forceRender` is `true` on Internet Explorer only.

### Firefox

For Firefox users, you might encounter some glitches depending on your SVG and browser version. On versions before 36, there is a problem retrieving path length via `getTotalLength` method. Returning 174321516544 instead of 209 (I'm not exaggerating, this comes from a real case), messing up the entire animation treatment. Unfortunately, there's nothing that this library can do, this is due to Firefox. I hope to find a workaround, but at the moment I can only recommend that you test your animation on previous versions of Firefox.

## Debug

For an easier debug have a look to the attribute `map` of your Vivus object. This contains the mapping of your animation. If you're using a modern browser, I recommend `console.table` to get a nice output of the array which will make your debug easier.

```javascript
const logo = new Vivus('myLogo', { type: 'scenario-sync' });

// The property 'map' contain all the SVG mapping
console.table(logo.map);
```

## Special thanks!

Thanks to all contributors! Also users who pushed me to improve the library by publishing it on NPM, or browser compatibility or features. Also thanks for fixing my awful english :)

- [@jolic](https://github.com/jolic) for dynamic SVG loading, ignore invisible paths, infinite and beyond...
- [@BenMcGeachy](https://github.com/BenMcGeachy) for making the documentation understandable
- [@TranscendOfSypherus](https://github.com/TranscendOfSypherus) for fixing the PathFormer
- [@flyingfisch](https://github.com/flyingfisch) for general helping with issues
- [@morgangiraud](https://github.com/morgangiraud) on the ignore invisible paths
- [@Nerdissimo](https://github.com/Nerdissimo) for inserting SVG without `object` wrapper
- [@jsimnz](https://github.com/jsimnz) for adding callbacks to play method

and many others...
