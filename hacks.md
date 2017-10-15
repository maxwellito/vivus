# Vivus hacks

Some tricks about Vivus are very interesting and might help you but doesn't have their place in the documentation. So you will see them here.

## Animate `fill` with CSS

On inline SVG, it's very easy to animate fill color with just a bit of CSS.

Let's imagine you have an inline SVG element in your page with the ID `mySVG`. You apply the following CSS to make it with fill opacity to 0 by default, and a class with the opacity of 1 (with transition). Then once the animation finished, the class can be added to the svg. 

```css
/* Style */
#mySVG * {
  fill-opacity: 0;
  transition: fill-opacity 1s;
}

#mySVG.finished * {
  fill-opacity: 1;
}
```

```js
/* JavaScript */
new Vivus('mySVG', {}, function (obj) {
  obj.el.classList.add('finished');
});
```

**WARNING**: This hack cannot work on sandboxed solutions like the use of `object` tag.
