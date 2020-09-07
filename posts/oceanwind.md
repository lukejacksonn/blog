# Tailwind the switch statement

> How and why I wrote a library that converts tailwind shorthand into css at runtime

For the benefit of you that do not know already, [Tailwind](https://tailwindcss.com) is a utility-first CSS framework built for rapidly building custom UI on the web. It is very similar to the once popular and somewhat ubiquitous Bootstrap framework but with a much more functional twist.

<img width="100%" src="https://user-images.githubusercontent.com/1457604/91981751-32310b00-ed21-11ea-8a89-f30f1437f9a2.gif">

> ⚡️ Check out the [live and interactive demo](https://esm.codes/#Ly8gT2NlYW53aW5kIGRlbW8gYnkgQGx1a2VqYWNrc29ubgovLyAtLS0tLS0tLS0tLS0tLS0tCiAgICAKaW1wb3J0IHsgcmVuZGVyLCBoIH0gZnJvbSAnaHR0cHM6Ly91bnBrZy5jb20vcHJlYWN0P21vZHVsZSc7CmltcG9ydCBodG0gZnJvbSAnaHR0cHM6Ly91bnBrZy5jb20vaHRtP21vZHVsZSc7CmltcG9ydCBvdyBmcm9tICdodHRwczovL3VucGtnLmNvbS9vY2VhbndpbmQnOwoKY29uc3QgaHRtbCA9IGh0bS5iaW5kKGgpOwoKcmVuZGVyKAogIGh0bWxgCiAgICA8ZGl2IGNsYXNzTmFtZT0ke293YAogICAgICBoLWZ1bGwKICAgICAgYmctcHVycGxlLTUwMAogICAgICBmbGV4CiAgICAgIGl0ZW1zLWNlbnRlcgogICAgICBqdXN0aWZ5LWNlbnRlcgogICAgYH0+CiAgICAgIDxoMSBjbGFzc05hbWU9JHtvd2AKICAgICAgICB0ZXh0LXdoaXRlCiAgICAgICAgZm9udC1ib2xkCiAgICAgICAgZm9udC1zYW5zCiAgICAgICAgaG92ZXI6cm90YXRlLTMKICAgICAgICBob3ZlcjpzY2FsZS0xNTAKICAgICAgICBob3ZlcjpjdXJzb3ItcG9pbnRlcgogICAgICBgfT5IZWxsbyBXb3JsZDwvaDE+CiAgICA8L2Rpdj4KICBgLAogIGRvY3VtZW50LmJvZHkKKTs=)

This is a post about how I went about making [Oceanwind](https://github.com/lukejacksonn/oceanwind); my very own runtime implementation of Tailwind. If you are looking more for documentation rather than a story then please stop right here and go [checkout the README](https://github.com/lukejacksonn/oceanwind).

## What is atomic CSS exactly

Tailwind (like [Tachyons](https://tachyons.io) before it) takes advantage of _atomic styles_. An approach that is becoming more and more talked about lately. The idea, generally, is that instead of using class names like `btn-primary` which might add a multitude of style rules to a given element, we'd use more granular class names like, for example `p-10 bg-blue border-1 font-bold` which are often more self explanitory and usually map to a single CSS rule.

There are many well-written articles out there that define this philosophy. They go into more depth explaining the pros and cons of atomic CSS and/or compare it to various other approaches like BEM for example; see [In Defense of Utility-First CSS](https://frontstuff.io/in-defense-of-utility-first-css), [CSS Utility Classes and "Separation of Concerns"](https://adamwathan.me/css-utility-classes-and-separation-of-concerns) and [A year of Utility Classes](https://css-irl.info/a-year-of-utility-classes). I highly recommend reading some of these resources for a bit of context here!

Like most things, some people love the idea of atomic css, others hate it. So I will not be advocating for or against it here. What I will be explaning, is how I went about flipping everything on its head and developed – from the top down – a library that mitigates what I think are the biggest drawbacks of the current Tailwind implementation, whilst maintaining the same wonderfully thought out API.

## A little knowledge is a dangerous thing

If you have ever checked out any of [my repositories on GitHub](https://github.com/lukejacksonn) or read any of my previous articles, you will know that I am an advocate of "simple". If something isn't easy for me to grasp, remix or maintain then I will usually side step it completely, or try solve the problem myself in order to better my understanding of a specific domain.

Luckily for me the Tailwind API is amazingly simple to grasp. As mentioned previously, it is essentially a one-to-one mapping of some custom shorthand syntax to CSS rules. It is a language abstraction. All you have to do to be _good_ at Tailwind, much like CSS, is to learn the vocabulary. Colour me interested.

So I started digging around looking for the easiest way to integrate Tailwind into my project. The quick start guide suggests the following steps:

1. Install Tailwind via npm
2. Add Tailwind to your CSS
3. Create your Tailwind config file
4. Process your CSS with Tailwind

This all sounded pretty straight forward.. except for the last step. Why do I need to process my CSS after using Tailwind? I thought it was just a collection of useful class names!

It turns out that the recommended way of adding all the class names you might need in your project, is to use custome css directives which look something like this:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Tailwind will swap these directives out at build time with all of its generated CSS. As you might have noticed, this is not _normal_ or valid CSS. Which is why step 4 in the getting started guide is required. For most people this is probably not a big deal, but you see, I [don't use a build step](https://formidable.com/blog/2019/no-build-step) in the majority of my projects these days. This realisation suddenly made Tailwind a non-starter for me!

I was pretty gutted but continued scrolling down the getting started document when I saw the title **Using Tailwind via CDN**. Now, I'm a big fan of CDNs, they are fast and they are simple. I got all excited again. Apparently all it actually takes to add all the tailwind class names to your project, is this line of HTML:

```html
<link
  href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css"
  rel="stylesheet"
/>
```

This actually works great and ended up inspiring one developer to make a [PR to czs](https://github.com/lukejacksonn/csz/pull/9) (a small CSS-in-JS library I made a while back) which allows you to import CSS files from absolute URLs like this, from within JS modules. I was now up and running with Tailwind in my project!

OK. So why'd you go and rewrite a perfectly good stylesheet.. in JavaScript? Well, using the CDN version of Tailwind comes with a few downsides. these are outlined quite clearly in their documentation:

- You can't customize Tailwind's default theme
- You can't use any directives like @apply, @variants, etc.
- You can't enable features like group-hover
- You can't install third-party plugins
- You can't tree-shake unused styles

Ohh no! The lack of these features really takes the wind out the Tailwind sails. Not only that but the CDN build is large. Around 348kb of raw CSS. Admittedly it compresses pretty well (down to 27kb) as it consists of _a lot_ of repetition which gzip and brotli love. But this is still quite a hefty dependency to be adding to a brand new project, especially considering we don't get any of the more powerful features like variants (which allow us to scope styles under responsive and pseudo selectors) and we haven't actually styled anything yet!

## A Program to Utilize & Reduce Gross Excesses

So what's the craic? Why are Tailwind setting such a high baseline here? Well, this is mainly down to the optimize through purgation approach that has been taken in the library design. To use all of Tailwind, first you need to generate all of Tailwind. By that I mean, for the class `bg-white` to work then the class `.bg-white { background: #fff; }` must be defined. Tailwind doesn't know what class names you are going to use ahead of time, so it has to assume you want to use them all, which means it has to generate every possible permutation of every directive and variant.

When you start to work out about all the possible combinations of all class names and variants then you end up with some very big numbers. Imagine for example the `bg-` directive. It is suffixed by a color (like `white` in the example above) and there are 10 hues in the Tailwind base theme. Whatsmore there are 9 shades of each hue. That means there are `10 * 9` rules that need to be generated in order to cover all possible permutations of the `bg-` directive. There are more directives like this (that accept a color after them), like `text-` and `border-` for example, which, by the same logic as `bg-` will require 90 rules each to be generated. Wowzer.

If you are sat there thinking, well that isn't _so_ bad. Then lets talk about variants. Variants like `sm:` which essentially wraps a directive in a media query. So `sm:bg-white` translates to `@media (min-width: 640px) { .sm\:bg-white { background: white; } }` for example. There are 4 such responsive variants like this (`sm`, `md`, `lg`, `xl`). So you can probably see where this is going by now, this means that to cover all possible permutations of the `bg-` directive for example, we now need to generate `10 * 9 * 4` rules. That's 360 rules for one directive, then 360 more for `text-` and again for `border-` which is 1080 rules for 3 directives over 4 responsive variants! If this is starting to sound like a lot by now, wait until you hear about the pseudo variants like `:hover`, `:disabled`, `:active` etc. of which there are currently 16 documented. That's a bug number.

For those **not so** mathematically inclined like myself, the result of such a mega combinatory explosion becomes apparent when using the development build of Tailwind:

> Using the default configuration, the development build of Tailwind CSS is 2365.4kB uncompressed, 185.0kB minified and compressed with Gzip, and 44.6kB when compressed with Brotli.

That is **2.3 megabytes** of CSS.. most of which you probably won't use! How are you supposed to get all this output down to just what you need? Well, as outlined in the [controlling file size](https://tailwindcss.com/docs/controlling-file-size) guide:

> When building for production, you should always use Tailwind's purge option to tree-shake unused styles and optimize your final build size. When removing unused styles with Tailwind, it's very hard to end up with more than 10kb of compressed CSS.

That sounds more like it! Less than 10kb sounds like a very reasonable amount of CSS. So, long story short; Tailwind employs [PurgeCSS](https://purgecss.com) which scans your project files looking for any string matching the regular expression `/[^<>"'`\s]\*[^<>"'`\s:]/g` then looks through any CSS files removing any styles that were never used. This approach has been around for a while and is not novel to Tailwind but it obviously works quite well for them. The downside here, in my opinion, is that:

- It is another step required to get everything working efficiently
- It requires tentative and quite involved configuration to get right
- It doesn't _just work_ work at runtime (obviously)
- It is non-deterministic and quite error prone

All things considered, suddenly Tailwind was looking like a non-starter for me again; especially for an application that was going to make it beyond development and into production without a build step.

## Can't we have our cake and eat it?

After the realisation that you have to choose between a build step or masses of redundancy I took a step back from the idea. I had this niggling feeling that there was surely a better way to get what I wanted. So what did I actually want? Well, put simply, I needed a function that, when given a term like `bg-white` returns me `background-color: white`, when given `mt-1` it should return `margin-top: 0.25rem` as specified in the Tailwind API.

This got me thinking, could I make a regular expression then use string replace to turn `mt` into `margin-top` and `bg` into `background` and so on? It seemed trivial enough, so I started implementing such a function. I soon realised that with all the directives in the API, and with all the variants, that a regex would quickly become unweildly (not to mention slow)... back to the drawing board!

My next approach was to create a dictionary type structure, in the form of an object (which in python is aptly call a dictionary). The idea here was to split the key from the value for each shorthand then lookup the key and execute a transform function which gets passed the value. For example:

```js
const dictionary = {
  bg: val => ({ background: val }),
  mt: val => ({ margin-top: theme.unit[val] }),
  ...
}
```

It became apparent that I would need as well, a theme file. This file would consist of some names constants that could be used by differet directives; for example things like font sizes, widths, heights and colors. Tailwind already have a notion of a config file like this, so I pieced together from the documentation, a JSON object with every possible property in there.

This worked pretty well actually, at least for a start. The simple cases were simple but because this approach was founded on the quite a naieve assumption that each shorthand directive adhered to the `key-value` grammar, it started to get a bit messy when cases like `key-key-value` or `key-value-value` came along (like `overflow-x-hidden` or `bg-red-500` for example). Then there were cases that sometimes were in one form and sometimes in others. It became obvious that is was not going to be possible to generalise the full Tailwind API like this.

So I ended up reaching out to my colleague [Phil Pluckthun](https://github.com/kitten), seriously one of the smartest people I know! Having vast knowledge and experience with programming languages, lexing and parsing of grammars, he immediately started to break down the problem in a much more granular way than I had been doing. The first thing we did was to define all the grammar. This means going through all cases that we wanted to support, noting down any common patterns and coming up with our own notation for "valid" directives. The idea was that, once this was complete, we should have everything we needed to start generating a solution automatically via codegen.

This grammar file had entries that looked something like this:

```js
// .float-right => float: right;
// .float-left => float: left;
// .float-none => float: none;
[['float', '$any'], ['$0', '$1']],
```

First we start with some comments which were copied almost verbatim from the tailwind documentation. This gives us a mapping of Tailwind shorthand to CSS output that is desired for a particular directive; our given input and desire output. Then we go ahead and try generalise all the cases, making a rule. We decided quite early on to use a nested tuple style syntax to denote these rules. The outermost tuple contains two more tuples. On the left we have the input definition and on the right, the output definition.

We devised some custom notation pretty quickly. Thing like `$any` and `$0` or `$1`. This allowed us to reduce many directives, into just one generic rule. Perhaps you have already worked out the pattern here but in case you haven't:

- The `$any` covers the terms `right`, `left` and `none`
- The `$0` relates to `float` the first element in the input
- The `$1` relates to the second element in the input

Just to demonstrate the principle here, if the directive `float-cats` was suddenly to exist, then based on this grammar, you could infer the output would be `float: cats`. Pretty neat right! It turned out that this was quite a trivial case, some were even easier others weren't quite so straight forward. Eventually we were able to generalise them all. It became quite fun, but there were a _lot_! It was satisfying when you came across a directive that had many permutations but that could be reduced down to a single grammar.

```js
// .z-0 => z-index: 0;
// .z-10 => z-index: 10;
// .z-20 => z-index: 20;
// .z-30 => z-index: 30;
// .z-40 => z-index: 40;
// .z-50 => z-index: 50;
// .z-auto => z-index: auto;
[['z', '$any'], ['z-index', '$1']],
```

It also became apparent that our solution would be able to handle more than just the values prescribed in the Tailwind API. For example, the case above would produce `z-index: 10` when given `z-10` but similarly it would produce `z-index: 69` if given `z-69`. This was exciting. We still hadn't actually generated any code to do the translating, and we had no real idea whether it would actually end up being small enough to be worthwhile. But noticing how expressive we could be using this approach gave us a glimmer hope which was enough to make us persist. Going through every directive listed in the Tailwind documentation.

## Writing code that writes code

So now we had this big file containing (almost) all possible grammars – there were some real edgy edge cases that we decided to defer on in fear that it would have a drastic effect on the complexity of generating a translator function automatically. I'm not ashamed to admit, the next 5 or so hours of development were kind of a blur for me. Phil proceeded to import `@babel/types` and `@babel/generator` then got to work writing code that writes code.

I got the general gist of what was going on (and helped out by playing the role of duck pointing out syntactic errors and unscrambling some cryptic intermediate outputs) but by now I was way out of my depth. Luckily, the code that was being generated, although verbose, wasn't too hard to grok at all. It was essentially a big switch statement and those, I am familiar with!

There were a few key learnings and tricks that were applied to make the output not only work, but be as compact and consistent as possible. To demonstrate how the generated solution worked let's consider the first case we looked at which was `bg-white`. Now, at first this seems like a very trivial case that could be denoted by the grammar `[['bg', '$color'], ['background-color', '$1']]` but what we did not consider before is that `bg-red-500` is also a valid Tailwind shorthand but which has the grammar `[['bg', '$any', '$shade'], ['background-color', '$2']]`. So how did we go about covering both cases? Well it goes something like this:

```js
const out = {}
const input = 'bg-red-500'.split('-')

switch(input.length) {
  case 1: ...
  case 2:
    switch (input[0]) {
      case 'bg':
        out['background-color'] = input[1];
        break;
        ...
    }
    break;
  case 3:
    switch (input[0]) {
      case 'bg':
        out['background-color'] = theme.colors[input[1]][input[2]];
        break;
        ...
    }
    break;
  case 4: ...
}

return out;
```

For a start we split the input into parts at every `-` character. We then, somewhat unintuitively count how many parts we have ands switch on that; `bg-white` has two parts, whilst `bg-red-500` has three parts, and so on. This helps keep the translation operation for directives with different lengths (but a common first part) nice and straight forward. We then switch on the first part of the directive, in this instance looking for a `bg` case. It just so happens that we know (because it was defined in our grammar file) that, if a `bg` directive has just two parts then we can go ahead and use the second part as the CSS value. So `bg-rebeccapurple` for example, returns `{ background-color: rebeccapurple }` and we are done. If, however, the directive has three parts then we have to assume that a color from the _theme_ file is being requested. In the case of `bg-red-500` the `red-500` parts get converted to the value defined in the theme file, which just so happens to be `#F56565`, so `{ background-color: #F56565 }` is returned.

I have slightly trivialised the cases and the code here for the sakes of demonstration, but hopefully you get the gist. This really isn't rocket science. Rather a slightly fancy lookup table. Regardless, we were quite happy with ourselves and I personally, couldn't wait to try it out.

It was late by this point, perhaps 1am in the morning, but there was no way I was going to sleep without a quick play around to see if what we had made was going to work. It did... kind of! I tested some simple cases at first, they worked as expected and per the Tailwind spec. I tested a few directives with more parts and that required values be looked up from the theme file (like `bg-red-500`) and to my delight they worked too!

However the more I tried, the more edge cases I was finding that were either not covered or not returning the expected output. For fucks sake, that was a lot of work and all for nothing, I remember thinking. If it wasn't _complete_ then what was the point really. But I guess that is the nature of experiments, some you win, some you lose. If it was easy then everyone would be doing it. Nevermind, it's late. I'll go to sleep and pick it up again in the morning. Then I didn't...

## So can we have our cake and eat it

We were in the midst of lockdown at this point, my motivation and passion were dwindling. I woke up the next day and for some reason I couldn't face [the code we had written](https://gist.github.com/kitten/219ddda1db5df4ad42a05abf0f2738dd) despite it being pretty damn good for a nights work!

It had been such an ordeal getting everything together and to be quite honest I didn't really understand the codegen element of the project. That was Phil's department and I felt like I'd already used up a lot of his precious time. So I proceeded, quite solemnly to get on with my "real work" for the client I was assigned to at the time, whilst this project lay dorment on my hard drive for the next month. Phil made a few amendments and probably hoped that would inspire me to pick it back up but my brain was being stubborn.

> I realised that this was quite uncharacteristic of me and that my body was trying to tell me something. I needed some time off. I filed a request for a month long vacation which my employer was kind enough to grant me.

During my month off I hardly opened my laptop at all but this project was still lingering in the back of my mind. I knew there was still so much to do for it to be a proper proof of concept, no matter a production ready piece of software. Then one day (some time during week 3) I thought screw it, let's do it. I opened up my code editor and started writing some tests.

Writing tests were the logical next thing to do. The last thing I'd done is to identify that we had indeed missed some cases and/or got something wrong in the grammars or codegen. That said, I knew that it was _mostly_ right. The only way I was going to know what was wrong exactly is to write out an example of each unique type of directive, followed by what I expected the CSS output to look like.

```js
const tests = {
  'hidden': { display: 'none' },
  'bg-white': { background: 'white' },
  'float-left': { float: 'left' },
  ...
}
```

I ended up with another quite simple structure for the tests, one which I could iterate over quite easily. I knew that if I persisted with this approach and found a directive that wasn't behaving as expected, then I could go and find that entry in the switch statement and fix it by hand.

Sure, this was probably wasn't the smartest approach and the "right" thing to do would to go and fix the code that generated the switch statement, or check for incorrect grammar. But I then thought, well we only did all that codegen stuff so that we didn't have to type out thousands of lines of switch statement, but they were already written now and to be honest the edge cases we had deferred to a later date really were curveballs that would probably take muich longer to account for and generate automatically, than they would to just write by hand.

So my mind was made up. I started going through the whole Tailwind API again, one directive at a time, writing test cases then optimizing or fixing up the auto-generated code where appropriate. This was all done manually. It took what felt like _forever_ but turned out to be totally worthwhile. Now I knew two things. Firstly, that we had finally covered the vast majority of the API (including those pesky edge cases), secondly that our output was correct and that at least now if we changed something in the translate function then we'd know if it broke anything. I guess that's the whole point of tests!

So I was feeling much more optimistic about the project by now. There was however, still a lot to do!

## Variety is the spice of life

Up until now we had really just been focussed on the translation of shorthand directives into CSS and we'd kind of proved that was possible with this big switch statement. But there is a little more to this problem than that. For a start, as we have talked about before, there are variants; both responsive and pseudo.

That means when we are given `sm:bg-white` we need to generate `{ background: white }` but that only gets applied when rendered on small screens. This is an interesting problem and got me thinking (and you probably are too by now) about how these styles are going to get applied to an element. When using Tailwind there is no dynamic behaviour, you write a class name in your HTML and if the corresponding rules exists in the CSS then the styles will be applied to the element.

After some quick googling I stumbled across a library called Otion, which advertised itself as a CSS-in-JS solution tailored and optimized especially for atomic CSS. This sounded perfect and it was only a couple of kilobytes! So I started experimenting with how it might work.

```js
otion({
  'margin-top': '0.25rem',
  '@media (min-width: 640px)': {
    background: 'white',
  },
  ':hover': {
    background: 'red',
  },
});
// => "od34ud adsr81"
```

Essentially what Otion does is take a CSS-in-JS object, break it up into single rules, generate a class name for each rule, then append those rules to a stylesheet in the head of the document, finally returning a string of class names you can use on your element of choice. This seemed almost too good to be true. It seemed like the ideal fit for this project. It turns out that Kristof (the author of Otion) was also inspired by Tailwind too.

It was at this point that the project name came about too!

As you can see in the example above, Otion makes applying responsive variants pretty trivial. You pass it a media query with the rule you want scoped to that query in the form of an object and it will do the rest; essentially unwrapping the rules from the media query, generating the class names and then wrapping them up again before appending them to the DOM. It does a similar thing for pseudo selecters like `:hover` and `:active` too.

## All together now

Everything was pretty much in place. Now all that was left was to pull everything together into a function that would be exposed from the main module, then try using that function in a real life application.

Let's look at how that was all going to work.

```js
import oceanwind from './index.js';
document.body.className = oceanwind`mt-1 sm:bg-white`;
```

Most of the projects I work on are either preact or react based, therefore CSS-in-JS wasn't a new concept for me. I reached for a familiar variable input mechanism, a tagged template literal. In most JavaScript styling libraries there is the option to write css inbetween the template literals and so it should feel familiar to most developers. It also means that directives can be written over multiple lines as supposed to in one long line (which Tailwind is limited to). I thought that this should help improve readability in some instances.

Now the input method was established I just had to write the function that processed the inputs and generated the desired output. The steps I had in my head at this point went something like this:

1. Tidy up the input, forcing it into a single space delimited string
2. Split the string on the space character to get an array of directives
3. Lookup the translation for each directive in the array
4. Apply any variants to the directive translation
5. Merge all the translations together into a single CSS-in-JS like object
6. Pass the object to otion to generate class names and append styles to the DOM

This function ended up being quite compact (less that 20 meaningful lines of code). There were a couple of things that I'd overlooked but the first 4 of these steps were pretty trivial to implement given that the translation code that had already been written:

```js
const styles = rules
  .replace(/\s\s+/g, ' ')
  .trim()
  .split(' ')
  .map((rule) => {
    // Split the rule into parts
    rule = rule.split(':');
    // Seperate out directive from variants
    let directive = rule.pop();
    let variants = rule;
    // Lookup translation for directive
    let translation = translate(theme)(directive);
    // Apply variants to the translation
    variants.reverse().forEach((variant) => {
      if (theme.screen[variant]) translation = mediaQuery(variant)(translation);
      else translation = { [`:${variant}`]: translation };
    });
    // Return translation with variants applied
    return translation;
  });
```

This produced an array of translated directives with any variants applied. All that was left to do now was to merge the translations together to form the CSS-in-JS object that would get passed to otion. At first I thought that this would be as simple as reducing over an array and returning a object. But there was one small caveats with this approach.

If the input had multiple directive with variants applied, like `sm:scale-95 sm:rotate-3`, then you would end up with an array that looked something like this:

```js
[
  {
    '@media (min-width: 640px)': {
      transfrom: 'scale(0.95)',
    },
  },
  {
    '@media (min-width: 640px)': {
      transform: 'rotate(3deg)',
    },
  },
];
```

Merging these values in a typical fashion (using the spread operator) would result in the latter rule overriding the former. After realising this, it became quickly apparent that a _deep merge_ would be required. Being a senior developer and all I googled "deep merge objects in JavaScript" and copy pasted from the top accepted answer on StackOverflow dot com. With these 12 lines of code the issue was resolved.

There was also this annoying case caused by the way CSS accepts values for the `transform` property. Most CSS rules are pretty atomic by nature. By that I mean one key maps to one value and denotes one stylistic change to an element. There are of course execptions to this rules, for example thoes that accept shorthand values like `margin: 0 0 0 0` which denote multiple stylistic changes be applied to an element. Most properties like this can be broken down into their corresponding atomic parts - instead of `margin: 1rem 0 0 0` you can write `margin-top: 1rem` – but not `transform`, it is a special snowflake.

There is no `rotate` or `scale` property in CSS, they are both values of the `transform` property. I'm not actually sure why this is (and as far as I know it is unique to `transform`) but it needed fixing. I looked at how Tailwind were doing this. They were using CSS custom properties like `--transform-rotate` which I assumed meant that their tranform translation looked something like:

```js
transform: rotate(--transform-rotate) scale(--transform-scale);
```

Whereby they apply all transforms but have default null values for the custom properties if none were passed in as input. This seemed smart, and admitedly was something I'd overlooked when creating translations for the transform type directives.

I hadn't dealt with custom properties in this implementation yet as there just hadn't been much reason to up until now and although I knew that Otion does support custom properties, I went for a quick and dirty fix which involved tweaking slighty the deep merge function:

```js
prev[key] = key === 'transform' && pVal ? [oVal, pVal].join(' ') : oVal;
```

It now checks if it is merging a transform key, and if it is, then it mergest the existing value with the new value by means of joining with a space character, as prescribed by the CSS specification.

This was far from ideal and still makes me feel queezy but it fixed the problem so I ran with it. It would be good to look at the custom property method in the future and see if it is worth refactoring to. This exploration could lead to exciting new ways of using CSS custom properties.

## Are you quite finished already

A lot of progress had been made and it was now time to test out the module for reals. I setup a template es preact project using imports directly from unpkg – my ususal way of prototyping almost anything – then imported the oceanwind module and crossed my fingers.

```js
import { render, h } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

import ow from '../index.js';

const html = htm.bind(h);

render(
  html`<main className=${ow`h-full bg-red hover:bg-blue`}></main>`,
  document.body
);
```

Somewhat to my surprise, it worked! It was doing everything I'd have expected it to do. I tried applying responsive variants, pseudo variants and various combinations of both. This was a big relief. I committed one more time, wrote a README, published to npm (thus unpkg) and pushed everything up to GitHub.

Everything was nearly finished, we now have the whole Tailwind API at our disposal during runtime and we are only generating the classes we needed. This is quite literally a class generating machine; some code that writes code! What I was really curious about now though, was how big was it? That switch statement we generated all that time ago was not small. If the whole module ended up being larger than say, the CDN version of Tailwind then not much would have been gained by doing all this work.

So I opened up the network tab in the chome inspector, quite aprehensively:

<img alt="otion-network-tap" src="https://user-images.githubusercontent.com/1457604/92325073-9fa1ac00-f03f-11ea-8f05-92c10caa0529.png">

Because I'd spit the module up into a few files, tt was hard to tell the exact size of the overall thing, but it looking pretty good. The translator function was in its own file and weighed in at quite a hefty 27 kilobytes. But due to the masses of repetition in that function (terms like `switch`, `case` and `break`) gzip was able to compress it down to just 4 kilobytes. It was smaller than I'd even hoped for!

This was good but I knew it could be better. Knowing that all the files were required by the module index, it could be quite trivially bundled into one file for production use. As I stated earlier on in the article, I'm not one for big ol' build tool chains and so I wasn't about to set one up. A much better way I have found of doing this kind of pre-publish build is to employ `esbuild` like this:

```json
{
  "scripts": {
    "build": "esbuild --bundle index.js --outfile=index.min.js --format=esm --minify"
  }
}
```

This line of code takes the module index file, concatinates together all the modules it depends on, then minifies the result, exposing a single set of public exports. It does all this in tens of milliseconds with no configuration. The package itself is also tiny (around ~5MB), consisting of 7 files revolving around a single GO binary. A truly incredible piece of software.

The result of running the module through `esbuild` was **a single file weighing 22.9 kilobytes. It compressed down to 7.7kb with gzip and 7.2kb with brotli.** I couldn't have been happier.. all the styles you could ever ask for in less than the average purged Tailwind output file (which according to the documentation was around 10kb)!

It was now possible to do:

```js
import ow from 'https://unpkg.com/oceanwind/index.min.js';
```

I believe this really makes getting started with Tailwind _considerably_ less effort. Whats more is that there isn't much reason that it can't scale just like any other CSS-in-JS solution. In fact, because the Tailwind API constrants the developer into using only a small subset of all possible CSS values and because otion is optimized for this precise scenario, then I'd be surprised if it doesn't scale even better than most CSS-in-JS solutions.

Not only might you be better off technically by taking this approach, but by the nature of adhering to the Tailwind API you are going to be producing much more consistent designs. This makes it what I call a win win, win win; better for your developers, designers, product and users. I kind of brushed over the benefits of Tailwind in regards to this axiom at the start of the article but what Adam Wathan et al. has done to prove and popularise the philosophy of constrained yet composable design on the web is absolutely ground breaking, opening up doors to interesting and exciting futures.

Some people reading this will be thinking, this is at runtime is all well and good but now the client has to do more work, and these people would be correct. Deferring any kind of compilation like this to runtime will certainly require more processor cycles. Thankfully the transpilation step here is relatively cheap and results can be cached reliably (similar to [`htm`](https://github.com/developit/htm)) to the point where the impact on perf should be almost negligable if you are already using a frontend framework to render UI. That said, I haven't tried optimizing for performance yet so I imagine there are still some gains to be had.

## What does the future hold

That concludes the journey to building oceanwind so far. In summary I'm pretty happy with the outcome and am excited to hear what people think to the approach, how you could improve on it, what you would like to see added feature wise and if there are any bugs (there probably will be.. lots).

By the nature of essentially creating an abstraction on top of an abstraction, keeping the APIs of Oceanwind aligned with Tailwind will take considerable effort. I'm not sure how much time I will be able to dedicate to this task so if you notice something missing and have some free time then perhaps take the time to fork the project and make a pull request with a proposed implementation along with a test case.

If you have made it this far then thank you for your time, I hope you learnt something here. Let me know on [Twitter](https://twitter.com/lukejacksonn) if you build anything with Oceanwind. I'd love to hear from you!
