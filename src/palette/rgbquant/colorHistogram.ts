/*
 * Copyright (c) 2015, Leon Sorokin
 * All rights reserved. (MIT Licensed)
 *
 * ColorHistogram.js - an image quantization lib
 */

/**
 * @preserve TypeScript port:
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * colorHistogram.ts - part of Image Quantization Library
 */
/// <reference path='../../utils/hueStatistics.ts' />
module IQ.Utils {

	export class ColorHistogram {
		private static _boxSize = [64, 64];
		private static _boxPixels = 2;
		private static _hueGroups = 10;

		// 1 = by global population, 2 = subregion population threshold
		private _method : number;

		// HueStatistics instance
		private _hueStats : HueStatistics;

		private _histogram : {[color : string] : number};

		// # of highest-frequency colors to start with for palette reduction
		private _initColors : number;

		// if > 0, enables hues stats and min-color retention per group
		private _minHueCols : number;

		constructor(method : number, colors : number) {
			// 1 = by global population, 2 = subregion population threshold
			this._method = method;

			// if > 0, enables hues stats and min-color retention per group
			this._minHueCols = colors << 2;//opts.minHueCols || 0;

			// # of highest-frequency colors to start with for palette reduction
			this._initColors = colors << 2;

			// HueStatistics instance
			this._hueStats = new HueStatistics(ColorHistogram._hueGroups, this._minHueCols);

			this._histogram = {};
		}

		public sample(pointBuffer : PointContainer) : void {
			switch (this._method) {
				case 1:
					this._colorStats1D(pointBuffer);
					break;
				case 2:
					this._colorStats2D(pointBuffer);
					break;
			}
		}

		public getImportanceSortedColorsIDXI32() {
			var sorted = Utils.sortedHashKeys(this._histogram, true);

			// TODO: check that other code waits for null
			if (sorted.length == 0) {
				return null;
			}

			switch (this._method) {
				case 1:
					var initialColorsLimit = Math.min(sorted.length, this._initColors),
						last               = sorted[initialColorsLimit - 1],
						freq               = this._histogram[last];

					var idxi32 = sorted.slice(0, initialColorsLimit);

					// add any cut off colors with same freq as last
					var pos = initialColorsLimit, len = sorted.length;
					while (pos < len && this._histogram[sorted[pos]] == freq)
						idxi32.push(sorted[pos++]);

					// inject min huegroup colors
					this._hueStats.inject(idxi32);
					break;

				case 2:
					var idxi32 = sorted;
					break;
			}

			// int32-ify values
			idxi32 = idxi32.map(function (v) {
				return +v;
			});

			return idxi32;
		}

		// global top-population
		private _colorStats1D(pointBuffer : Utils.PointContainer) {
			var histG      = this._histogram,
				pointArray = pointBuffer.getPointArray(),
				len        = pointArray.length;

			for (var i = 0; i < len; i++) {
				var col = pointArray[i].uint32;

				// collect hue stats
				this._hueStats.check(col);

				if (col in histG)
					histG[col]++;
				else
					histG[col] = 1;
			}
		}

		// population threshold within subregions
		// FIXME: this can over-reduce (few/no colors same?), need a way to keep
		// important colors that dont ever reach local thresholds (gradients?)
		private _colorStats2D(pointBuffer : Utils.PointContainer) {
			var width      = pointBuffer.getWidth(),
				height     = pointBuffer.getHeight(),
				pointArray = pointBuffer.getPointArray();

			var boxW  = ColorHistogram._boxSize[0],
				boxH  = ColorHistogram._boxSize[1],
				area  = boxW * boxH,
				boxes = Utils.makeBoxes(width, height, boxW, boxH),
				histG = this._histogram;

			boxes.forEach(function (box) {
				var effc  = Math.round((box.w * box.h) / area) * ColorHistogram._boxPixels,
					histL = {},
					col;

				if(effc < 2) effc = 2;

				this._iterateBox(box, width, function (i) {
					col = pointArray[i].uint32;

					// collect hue stats
					this._hueStats.check(col);

					if (col in histG)
						histG[col]++;
					else if (col in histL) {
						if (++histL[col] >= effc)
							histG[col] = histL[col];
					}
					else
						histL[col] = 1;
				});
			}, this);

			// inject min huegroup colors
			this._hueStats.inject(histG);

		}

		// iterates @bbox within a parent rect of width @wid; calls @fn, passing index within parent
		private _iterateBox(bbox, wid, fn) {
			var b   = bbox,
				i0  = b.y * wid + b.x,
				i1  = (b.y + b.h - 1) * wid + (b.x + b.w - 1),
				cnt = 0, incr = wid - b.w + 1, i = i0;

			do {
				fn.call(this, i);
				i += (++cnt % b.w == 0) ? incr : 1;
			} while (i <= i1);
		}

	}
}