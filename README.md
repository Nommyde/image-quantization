IQ.ts
-----

Complete Image Quantization Library in **TypeScript** _(MIT License)_

[![demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](http://igor-bezkrovny.github.io/image-q/demo)
[![github](https://img.shields.io/badge/github-.com-brightgreen.svg)](https://github.com/igor-bezkrovny/image-quantization)
[![npm version](https://badge.fury.io/js/image-q.svg)](https://www.npmjs.com/package/image-q)
[![API Documentation](https://img.shields.io/badge/API_Documentation-Available-blue.svg)](http://igor-bezkrovny.github.io/image-q/doc)
[![NPM License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

![quantization](https://raw.githubusercontent.com/igor-bezkrovny/image-quantization/master/quantization.png "quantization")

Table of Contents
-----------------

* [Introduction](#introduction)
* [Capability](#capability)
* [Usage](#usage)
* [Todo](#todo)
* [Changelog](#changelog)
* [Credits](#credits)
* [References](#references)
* [License](#license)

Introduction
------------

Image Color Number Reduction with alpha support using RgbQuant/NeuQuant/Xiaolin Wu's algorithms and Euclidean/Manhattan/CIEDE2000 color distance formulas in TypeScript
 
Capability
----------

1. Platforms supported
	* browser (Chrome 7.0+, FireFox 4.0+, IE 10+, Opera 11.6+, Safari 5.1+)
	* node.js (Node.js 0.9.0+)
	
2. Builds
	* **dist/browser-iq**.js - JavaScript build for browser (global `var IQ`)
	* **dist/node-iq**.js - JavaScript build for Node.js (`module.exports = IQ`)
	* **src/iq.ts** - TypeScript module (use `/// <reference path="path-to-library/src/iq.ts" />`)
	 
3. Import
	* `HTMLImageElement`
	* `HTMLCanvasElement`
	* `NodeCanvas`
	* `ImageData`
	* `Array`
	* `CanvasPixelArray`
	* `Uint8Array`
	* `Uint32Array`
	 
4. Color Distance
	* `Euclidean` - originally used in Xiaolin Wu's Quantizer **WuQuant**
	* `EuclideanRgbQuantWOAlpha` (sRGB coefficients/without alpha support) - originally used in **RgbQuant**
	* `EuclideanRgbQuantWithAlpha` (sRGB coefficients)
	* `Manhattan` - originally used in **NeuQuant** 
	* `ManhattanSRGB` (sRGB coefficients)
	* `CIEDE2000_Original` - full CIEDE2000 implementation (very very very slow) 
	* `CIEDE2000` - part of formula was stripped as it meaningless for JavaScript floating-point precision/RGB 8bit per channel converted to Lab (very very slow)
	* `CIE94` - full CIE94 implementation
	* `CMETRIC`
	* `PNGQUANT` - used in pngQuant tool

5. Palette Quantizers
	* `NeuQuant` (original code ported, integer calculations)
	* `RgbQuant`
	* `WuQuant`
	* `NeuQuantFloat` (floating-point calculations)
	
6. Image Quantizers
	* `NearestColor`
	* `ErrorDiffusionArray` - two modes of error propagation are supported: `xnview` and `gimp`
		1. `FloydSteinberg`
        2. `FalseFloydSteinberg`
        3. `Stucki`
        4. `Atkinson`
        5. `Jarvis`
        6. `Burkes`
        7. `Sierra`
        8. `TwoSierra`
        9. `SierraLite`
	* `ErrorDiffusionRiemersma` - Hilbert space-filling curve is used

7. Output
	* `Uint32Array`
	* `Uint8Array`  
	 
Include IQ Library into your project
------------------------------------
##### TypeScript + Node.js/Browser project 
```javascript
/// <reference path='<path-to-iq>/src/iq.ts' />
```

##### JavaScript + Node.js project
```javascript
var iq = require("<path-to-iq>/dist/node-iq.js");
```

##### JavaScript + Browser project
```html
<script src="<path-to-iq>/dist/browser-iq.js" type="text/javascript" charset="utf-8"></script>
```

Usage
-----

##### Load Image (simple example)
```javascript
var img = document.createElement("img");
img.onload = function() {
	// image is loaded, here should be all code utilizing image
	...
}
img.src = "http://pixabay.com/static/uploads/photo/2012/04/11/11/32/letter-a-27580_640.png"
```

##### Generate Palette   
```javascript
// desired colors number
var targetColors = 256;
   
// create pointContainer and fill it with image
var pointContainer = IQ.Utils.PointContainer.fromHTMLImageElement(img);

// create chosen distance calculator (see classes implementing `IQ.Distance.IDistanceCalculator`)
var distanceCalculator = new IQ.Distance.Euclidean();

// create chosen palette quantizer (see classes implementing `IQ.Palette.IPaletteQuantizer`) 
var paletteQuantizer = new IQ.Palette.RgbQuant(distanceCalculator, targetColors);
		
// feed out pointContainer filled with image to paletteQuantizer
paletteQuantizer.sample(pointContainer);

... (you may sample more than one image to create mutual palette) 

// take generated palette
var palette = paletteQuantizer.quantize();
```

##### Apply Palette to Image (Image Dithering) 
```javascript
// create image quantizer (see classes implementing `IQ.Image.IImageDitherer`)
var imageDitherer = new IQ.Image.NearestColor(distanceCalculator);

// apply palette to image
var resultPointContainer = imageQuantizer.quantize(pointContainer, palette);
```

You may work with resultPointContainer directly or you may convert it to `Uint8Array`/`Uint32Array`
```javascript
var uint8array = resultPointContainer.toUint8Array();
```

TODO
----
1. notification about progress  
2. ~~riemersma dithering~~  
3. ordered dithering

Changelog
---------

##### 0.1.4 (2015-06-24)
	+ Refactoring 
	+ Riemersma dithering added (Hilbert Curve)
	+ Readme.md updated
	+ build.cmd updated

##### 0.1.3 (2015-06-16)
	+ NeuQuant is fixed (again) according to original Anthony Dekker source code (all values should be integer)
	+ Error Diffusion Dithering is now calculates error like XNVIEW
	+ Refactoring

##### 0.1.2 (2015-06-16)
	+ Documentation generation fixed
	+ File name case problem fixed

##### 0.1.1 (2015-06-16)
	+ Auto-generated documentation added
	+ Refactoring 

##### 0.1.0 (2015-06-16)
	+ Code cleanup, removed unnecessary files

##### 0.0.5 (2015-06-16)
	+ PNGQUANT color distance added, need to check its quality
	+ CIEDE2000 and CIE94 fixed for use in NeuQuant
	+ NeuQuant is fixed according to original Anthony Dekker source code (all values should be integer) 
	+ Code refactoring and cleanup
	* We have some slowdown because of red/green/blue/alpha normalization according to white point per each calculateRaw/calculateNormalized call 

##### 0.0.4 (2015-06-15)
	+ CIEDE2000 color distance equation optimized (original CIEDE2000 equation is available as class `CIEDE2000_Original`) 

##### 0.0.3b (2015-06-11)
	+ CMETRIC color distance fixed

##### 0.0.3a (2015-06-11)
	+ Cleanup
	+ Draft of CMETRIC color distance added

##### 0.0.2 (2015-06-10)
	+ rgb2xyz & xyz2lab fixed. CIEDE2000 works much better now.
	+ CIE94 distance formula added. More investigation is needed.

##### 0.0.1
	+ Initial

Credits
-------
Thanks to Leon Sorokin for information share and his original RgbQuant!

References
----------

* Palette Quantization Algorithms

	1. [RgbQuant (Leon Sorokin)](https://github.com/leeoniya/RgbQuant.js) `JavaScript`
	2. [NeuQuant (Johan Nordberg)](https://github.com/jnordberg/gif.js/blob/master/src/TypedNeuQuant.js) `TypeScript`
	3. [NeuQuant (Tim Oxley)](https://github.com/timoxley/neuquant) `JavaScript`
	4. [NeuQuant (Devon Govett)](https://github.com/devongovett/neuquant) `JavaScript`
	5. [NeuQuant32 (Stuart Coyle)](https://github.com/stuart/pngnq/blob/master/src/neuquant32.c) `C`
	6. [Xiaolin Wu (Xiaolin Wu)](http://www.ece.mcmaster.ca/~xwu/cq.c) `C` 
	7. [Xiaolin Wu (Smart-K8)](http://www.codeproject.com/Articles/66341/A-Simple-Yet-Quite-Powerful-Palette-Quantizer-in-C) `C#`
	8. Xiaolin Wu w/ Alpha (Matt Wrock) [How to add Alpha](https://code.msdn.microsoft.com/windowsdesktop/Convert-32-bit-PNGs-to-81ef8c81/view/SourceCode#content), [Source Code](https://nquant.codeplex.com) `C#`
	9. [MedianCut (mwcz)](https://github.com/mwcz/median-cut-js) `GPLv3`

* Image Quantization Algorithms

	1. [All (ImageMagik doc)](http://www.imagemagick.org/Usage/quantize/#dither)
	2. [Error Diffusion dithering (Tanner Helland)](http://www.tannerhelland.com/4660/dithering-eleven-algorithms-source-code)
	3. [Riemersma dithering](http://www.compuphase.com/riemer.htm) `TODO: Check License`
	4. [Ordered dithering (Joel Yliluoma)](http://bisqwit.iki.fi/story/howto/dither/jy)

* Color Distance Formulas

	1. Euclidean Distance
	2. Manhattan Distance
	3. CIE94 Distance
	   - [Source Code (Iulius Curt)](https://github.com/iuliux/CIE94.js)
	4. CIEDE2000
	   - [Math and Test Data Table (PDF)](http://www.ece.rochester.edu/~gsharma/ciede2000/ciede2000noteCRNA.pdf) 
	   - [Source Code (Greg Fiumara)](https://github.com/gfiumara/CIEDE2000) `C` 
	5. Euclidean Distance w/o Alpha (RgbQuant)
	6. Euclidean Distance w/o sRGB coefficients (Xiaolin Wu Quant)  
	7. Manhattan Distance w/o sRGB coefficients (NeuQuant)
	8. [CMETRIC](http://www.compuphase.com/cmetric.htm) `DRAFT!`

* Color conversion formulas

	1. [Pseudo-code](http://www.easyrgb.com/?X=MATH)

> Be sure to fix rgb2xyz/xyz2lab. Issue is with strange part of code: `r = r > 0.04045 ? ...`. Check http://en.wikipedia.org/wiki/Lab_color_space   

* Image Quality Assessment

	1. [SSIM info](http://en.wikipedia.org/wiki/Structural_similarity)
	2. [SSIM (Rhys-e)](https://github.com/rhys-e/structural-similarity) `Java` `License: MIT`
	3. PSNR ? TBD
	4. MSE ? TBD

* Other

	1. [HUSL (Boronine) - info](http://www.husl-colors.org)
	2. [HUSL (Boronine) - code](https://github.com/husl-colors/husl)
	3. [Color Image Quantization for Frame Buffer Display](https://www.cs.cmu.edu/~ph/ciq_thesis)
	4. [K-Means](http://arxiv.org/pdf/1101.0395.pdf)
	5. [Efficient Color Quantization by Hierarchical Clustering Algorithms](ftp://cs.joensuu.fi/pub/Theses/2005_MSc_Hautamaki_Ville.pdf)

License
-------

[MIT](LICENSE)
