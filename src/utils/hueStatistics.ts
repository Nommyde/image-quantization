/**
 * @preserve
 * Copyright 2015 Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * hueStatistics.ts - part of Image Quantization Library
 */

/// <reference path='./utils.ts' />
module IQ.Utils {

    class HueGroup {
        public num:number = 0;
        public cols:number[] = [];
    }

    export class HueStatistics {
        private _numGroups;
        private _minCols;
        private _stats;
        private _groupsFull;

        constructor(numGroups:number, minCols:number) {
            this._numGroups = numGroups;
            this._minCols = minCols;
            this._stats = [];

            for (var i = 0; i <= numGroups; i++) {
                this._stats[i] = new HueGroup();
            }

            this._groupsFull = 0;
        }

        public check(i32) {
            if (this._groupsFull == this._numGroups + 1) {
                this.check = function () {
                };
            }

            var r = (i32 & 0xff),
                g = (i32 >>> 8) & 0xff,
                b = (i32 >>> 16) & 0xff,
                a = (i32 >>> 24) & 0xff,
                hg = (r == g && g == b) ? 0 : 1 + Utils.hueGroup(Conversion.rgb2hsl(r, g, b).h, this._numGroups),
                gr:HueGroup = this._stats[hg],
                min = this._minCols;

            gr.num++;

            if (gr.num > min)
                return;
            if (gr.num == min)
                this._groupsFull++;

            if (gr.num <= min)
                this._stats[hg].cols.push(i32);
        }

        public inject(histG) {
            switch (Object.prototype.toString.call(histG).slice(8, -1)) {
                case "Array":
                    for (var i = 0; i <= this._numGroups; i++) {
                        if (this._stats[i].num <= this._minCols) {
                            this._stats[i].cols.forEach(function (col) {
                                if (histG.indexOf(col) == -1)
                                    histG.push(col);
                            });
                        }
                    }
                    break;
                case "Object":
                    for (var i = 0; i <= this._numGroups; i++) {
                        if (this._stats[i].num <= this._minCols) {
                            this._stats[i].cols.forEach(function (col) {
                                if (!histG[col])
                                    histG[col] = 1;
                                else
                                    histG[col]++;
                            });
                        }
                    }
                    break;
            }

        }
    }

}
