"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var translate_service_1 = require('./translate.service');
var TranslatePipe = (function () {
    function TranslatePipe(translate, _ref) {
        this.translate = translate;
        this._ref = _ref;
        this.value = '';
    }
    /**
     * @name equals
     *
     * @description
     * Determines if two objects or two values are equivalent.
     *
     * Two objects or values are considered equivalent if at least one of the following is true:
     *
     * * Both objects or values pass `===` comparison.
     * * Both objects or values are of the same type and all of their properties are equal by
     *   comparing them with `equals`.
     *
     * @param {*} o1 Object or value to compare.
     * @param {*} o2 Object or value to compare.
     * @returns {boolean} True if arguments are equal.
     */
    TranslatePipe.prototype.equals = function (o1, o2) {
        if (o1 === o2)
            return true;
        if (o1 === null || o2 === null)
            return false;
        if (o1 !== o1 && o2 !== o2)
            return true; // NaN === NaN
        var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
        if (t1 == t2 && t1 == 'object') {
            if (Array.isArray(o1)) {
                if (!Array.isArray(o2))
                    return false;
                if ((length = o1.length) == o2.length) {
                    for (key = 0; key < length; key++) {
                        if (!this.equals(o1[key], o2[key]))
                            return false;
                    }
                    return true;
                }
            }
            else {
                if (Array.isArray(o2)) {
                    return false;
                }
                keySet = Object.create(null);
                for (key in o1) {
                    if (!this.equals(o1[key], o2[key])) {
                        return false;
                    }
                    keySet[key] = true;
                }
                for (key in o2) {
                    if (!(key in keySet) && typeof o2[key] !== 'undefined') {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    };
    TranslatePipe.prototype.updateValue = function (key, interpolateParams) {
        var _this = this;
        this.translate.get(key, interpolateParams).subscribe(function (res) {
            _this.value = res ? res : key;
            _this.lastKey = key;
            _this._ref.markForCheck();
        });
    };
    TranslatePipe.prototype.transform = function (query) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!query || query.length === 0) {
            return query;
        }
        // if we ask another time for the same key, return the last value
        if (this.equals(query, this.lastKey) && this.equals(args, this.lastParams)) {
            return this.value;
        }
        var interpolateParams;
        if (args.length && args[0] !== null) {
            if (typeof args[0] === 'string' && args[0].length) {
                // we accept objects written in the template such as {n:1},
                // which is why we might need to change it to real JSON objects such as {"n":1}
                try {
                    interpolateParams = JSON.parse(args[0].replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": '));
                }
                catch (e) {
                    throw new SyntaxError("Wrong parameter in TranslatePipe. Expected a valid Object, received: " + args[0]);
                }
            }
            else if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
                interpolateParams = args[0];
            }
        }
        // store the query, in case it changes
        this.lastKey = query;
        // store the params, in case they change
        this.lastParams = args;
        // set the value
        this.updateValue(query, interpolateParams);
        // if there is a subscription to onLangChange, clean it
        this._dispose();
        // subscribe to onTranslationChange event, in case the translations change
        if (!this.onTranslationChange) {
            this.onTranslationChange = this.translate.onTranslationChange.subscribe(function (event) {
                if (_this.lastKey && event.lang === _this.translate.currentLang) {
                    _this.lastKey = null;
                    _this.updateValue(query, interpolateParams);
                }
            });
        }
        // subscribe to onLangChange event, in case the language changes
        if (!this.onLangChange) {
            this.onLangChange = this.translate.onLangChange.subscribe(function (event) {
                if (_this.lastKey) {
                    _this.lastKey = null; // we want to make sure it doesn't return the same value until it's been updated
                    _this.updateValue(query, interpolateParams);
                }
            });
        }
        return this.value;
    };
    /**
     * Clean any existing subscription to change events
     * @private
     */
    TranslatePipe.prototype._dispose = function () {
        if (typeof this.onTranslationChange !== 'undefined') {
            this.onTranslationChange.unsubscribe();
            this.onTranslationChange = undefined;
        }
        if (typeof this.onLangChange !== 'undefined') {
            this.onLangChange.unsubscribe();
            this.onLangChange = undefined;
        }
    };
    TranslatePipe.prototype.ngOnDestroy = function () {
        this._dispose();
    };
    TranslatePipe = __decorate([
        core_1.Injectable(),
        core_1.Pipe({
            name: 'translate',
            pure: false // required to update the value when the promise is resolved
        }), 
        __metadata('design:paramtypes', [translate_service_1.TranslateService, core_1.ChangeDetectorRef])
    ], TranslatePipe);
    return TranslatePipe;
}());
exports.TranslatePipe = TranslatePipe;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLnBpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2xhdGUucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEscUJBQTBGLGVBQWUsQ0FBQyxDQUFBO0FBQzFHLGtDQUF3RSxxQkFBcUIsQ0FBQyxDQUFBO0FBTzlGO0lBT0ksdUJBQW9CLFNBQTJCLEVBQVUsSUFBdUI7UUFBNUQsY0FBUyxHQUFULFNBQVMsQ0FBa0I7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFtQjtRQU5oRixVQUFLLEdBQVcsRUFBRSxDQUFDO0lBT25CLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7O09BZUc7SUFDSyw4QkFBTSxHQUFkLFVBQWUsRUFBTyxFQUFFLEVBQU87UUFDM0IsRUFBRSxDQUFBLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDMUIsRUFBRSxDQUFBLENBQUMsRUFBRSxLQUFLLElBQUksSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUM1QyxFQUFFLENBQUEsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYztRQUN0RCxJQUFJLEVBQUUsR0FBRyxPQUFPLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxFQUFFLEVBQUUsTUFBYyxFQUFFLEdBQVEsRUFBRSxNQUFXLENBQUM7UUFDMUUsRUFBRSxDQUFBLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQztZQUM1QixFQUFFLENBQUEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsRUFBRSxDQUFBLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFD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SSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxTQUFTLENBQUM7UUFDekMsQ0FBQztRQUNELEVBQUUsQ0FBQSxDQUFDLE9BQU8sSUFBSSxDQUFDLFlBQVksS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7UUFDbEMsQ0FBQztJQUNMLENBQUM7SUFFRCxtQ0FBVyxHQUFYO1FBQ0ksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUF2Skw7UUFBQyxpQkFBVSxFQUFFO1FBQ1osV0FBSSxDQUFDO1lBQ0YsSUFBSSxFQUFFLFdBQVc7WUFDakIsSUFBSSxFQUFFLEtBQUssQ0FBQyw0REFBNEQ7U0FDM0UsQ0FBQzs7cUJBQUE7SUFvSkYsb0JBQUM7QUFBRCxDQUFDLEFBbkpELElBbUpDO0FBbkpZLHFCQUFhLGdCQW1KekIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UGlwZVRyYW5zZm9ybSwgUGlwZSwgSW5qZWN0YWJsZSwgRXZlbnRFbWl0dGVyLCBPbkRlc3Ryb3ksIENoYW5nZURldGVjdG9yUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtUcmFuc2xhdGVTZXJ2aWNlLCBMYW5nQ2hhbmdlRXZlbnQsIFRyYW5zbGF0aW9uQ2hhbmdlRXZlbnR9IGZyb20gJy4vdHJhbnNsYXRlLnNlcnZpY2UnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5AUGlwZSh7XHJcbiAgICBuYW1lOiAndHJhbnNsYXRlJyxcclxuICAgIHB1cmU6IGZhbHNlIC8vIHJlcXVpcmVkIHRvIHVwZGF0ZSB0aGUgdmFsdWUgd2hlbiB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZFxyXG59KVxyXG5leHBvcnQgY2xhc3MgVHJhbnNsYXRlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0sIE9uRGVzdHJveSB7XHJcbiAgICB2YWx1ZTogc3RyaW5nID0gJyc7XHJcbiAgICBsYXN0S2V5OiBzdHJpbmc7XHJcbiAgICBsYXN0UGFyYW1zOiBhbnlbXTtcclxuICAgIG9uVHJhbnNsYXRpb25DaGFuZ2U6IEV2ZW50RW1pdHRlcjxUcmFuc2xhdGlvbkNoYW5nZUV2ZW50PjtcclxuICAgIG9uTGFuZ0NoYW5nZTogRXZlbnRFbWl0dGVyPExhbmdDaGFuZ2VFdmVudD47XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSB0cmFuc2xhdGU6IFRyYW5zbGF0ZVNlcnZpY2UsIHByaXZhdGUgX3JlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBuYW1lIGVxdWFsc1xyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogRGV0ZXJtaW5lcyBpZiB0d28gb2JqZWN0cyBvciB0d28gdmFsdWVzIGFyZSBlcXVpdmFsZW50LlxyXG4gICAgICpcclxuICAgICAqIFR3byBvYmplY3RzIG9yIHZhbHVlcyBhcmUgY29uc2lkZXJlZCBlcXVpdmFsZW50IGlmIGF0IGxlYXN0IG9uZSBvZiB0aGUgZm9sbG93aW5nIGlzIHRydWU6XHJcbiAgICAgKlxyXG4gICAgICogKiBCb3RoIG9iamVjdHMgb3IgdmFsdWVzIHBhc3MgYD09PWAgY29tcGFyaXNvbi5cclxuICAgICAqICogQm90aCBvYmplY3RzIG9yIHZhbHVlcyBhcmUgb2YgdGhlIHNhbWUgdHlwZSBhbmQgYWxsIG9mIHRoZWlyIHByb3BlcnRpZXMgYXJlIGVxdWFsIGJ5XHJcbiAgICAgKiAgIGNvbXBhcmluZyB0aGVtIHdpdGggYGVxdWFsc2AuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHsqfSBvMSBPYmplY3Qgb3IgdmFsdWUgdG8gY29tcGFyZS5cclxuICAgICAqIEBwYXJhbSB7Kn0gbzIgT2JqZWN0IG9yIHZhbHVlIHRvIGNvbXBhcmUuXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBhcmd1bWVudHMgYXJlIGVxdWFsLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGVxdWFscyhvMTogYW55LCBvMjogYW55KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYobzEgPT09IG8yKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICBpZihvMSA9PT0gbnVsbCB8fCBvMiA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGlmKG8xICE9PSBvMSAmJiBvMiAhPT0gbzIpIHJldHVybiB0cnVlOyAvLyBOYU4gPT09IE5hTlxyXG4gICAgICAgIHZhciB0MSA9IHR5cGVvZiBvMSwgdDIgPSB0eXBlb2YgbzIsIGxlbmd0aDogbnVtYmVyLCBrZXk6IGFueSwga2V5U2V0OiBhbnk7XHJcbiAgICAgICAgaWYodDEgPT0gdDIgJiYgdDEgPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgaWYoQXJyYXkuaXNBcnJheShvMSkpIHtcclxuICAgICAgICAgICAgICAgIGlmKCFBcnJheS5pc0FycmF5KG8yKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYoKGxlbmd0aCA9IG8xLmxlbmd0aCkgPT0gbzIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrZXkgPSAwOyBrZXkgPCBsZW5ndGg7IGtleSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCF0aGlzLmVxdWFscyhvMVtrZXldLCBvMltrZXldKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmKEFycmF5LmlzQXJyYXkobzIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAga2V5U2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIG8xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoIXRoaXMuZXF1YWxzKG8xW2tleV0sIG8yW2tleV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAga2V5U2V0W2tleV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gbzIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZighKGtleSBpbiBrZXlTZXQpICYmIHR5cGVvZiBvMltrZXldICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVZhbHVlKGtleTogc3RyaW5nLCBpbnRlcnBvbGF0ZVBhcmFtcz86IE9iamVjdCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudHJhbnNsYXRlLmdldChrZXksIGludGVycG9sYXRlUGFyYW1zKS5zdWJzY3JpYmUoKHJlczogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSByZXMgPyByZXMgOiBrZXk7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdEtleSA9IGtleTtcclxuICAgICAgICAgICAgdGhpcy5fcmVmLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRyYW5zZm9ybShxdWVyeTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IGFueSB7XHJcbiAgICAgICAgaWYoIXF1ZXJ5IHx8IHF1ZXJ5Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcXVlcnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGlmIHdlIGFzayBhbm90aGVyIHRpbWUgZm9yIHRoZSBzYW1lIGtleSwgcmV0dXJuIHRoZSBsYXN0IHZhbHVlXHJcbiAgICAgICAgaWYodGhpcy5lcXVhbHMocXVlcnksIHRoaXMubGFzdEtleSkgJiYgdGhpcy5lcXVhbHMoYXJncywgdGhpcy5sYXN0UGFyYW1zKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBpbnRlcnBvbGF0ZVBhcmFtczogT2JqZWN0O1xyXG4gICAgICAgIGlmKGFyZ3MubGVuZ3RoICYmIGFyZ3NbMF0gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgaWYodHlwZW9mIGFyZ3NbMF0gPT09ICdzdHJpbmcnICYmIGFyZ3NbMF0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyB3ZSBhY2NlcHQgb2JqZWN0cyB3cml0dGVuIGluIHRoZSB0ZW1wbGF0ZSBzdWNoIGFzIHtuOjF9LFxyXG4gICAgICAgICAgICAgICAgLy8gd2hpY2ggaXMgd2h5IHdlIG1pZ2h0IG5lZWQgdG8gY2hhbmdlIGl0IHRvIHJlYWwgSlNPTiBvYmplY3RzIHN1Y2ggYXMge1wiblwiOjF9XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGludGVycG9sYXRlUGFyYW1zID0gSlNPTi5wYXJzZShhcmdzWzBdLnJlcGxhY2UoLyhbJ1wiXSk/KFthLXpBLVowLTlfXSspKFsnXCJdKT86L2csICdcIiQyXCI6ICcpKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFdyb25nIHBhcmFtZXRlciBpbiBUcmFuc2xhdGVQaXBlLiBFeHBlY3RlZCBhIHZhbGlkIE9iamVjdCwgcmVjZWl2ZWQ6ICR7YXJnc1swXX1gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiBhcmdzWzBdID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShhcmdzWzBdKSkge1xyXG4gICAgICAgICAgICAgICAgaW50ZXJwb2xhdGVQYXJhbXMgPSBhcmdzWzBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzdG9yZSB0aGUgcXVlcnksIGluIGNhc2UgaXQgY2hhbmdlc1xyXG4gICAgICAgIHRoaXMubGFzdEtleSA9IHF1ZXJ5O1xyXG5cclxuICAgICAgICAvLyBzdG9yZSB0aGUgcGFyYW1zLCBpbiBjYXNlIHRoZXkgY2hhbmdlXHJcbiAgICAgICAgdGhpcy5sYXN0UGFyYW1zID0gYXJncztcclxuXHJcbiAgICAgICAgLy8gc2V0IHRoZSB2YWx1ZVxyXG4gICAgICAgIHRoaXMudXBkYXRlVmFsdWUocXVlcnksIGludGVycG9sYXRlUGFyYW1zKTtcclxuXHJcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSBzdWJzY3JpcHRpb24gdG8gb25MYW5nQ2hhbmdlLCBjbGVhbiBpdFxyXG4gICAgICAgIHRoaXMuX2Rpc3Bvc2UoKTtcclxuXHJcbiAgICAgICAgLy8gc3Vic2NyaWJlIHRvIG9uVHJhbnNsYXRpb25DaGFuZ2UgZXZlbnQsIGluIGNhc2UgdGhlIHRyYW5zbGF0aW9ucyBjaGFuZ2VcclxuICAgICAgICBpZighdGhpcy5vblRyYW5zbGF0aW9uQ2hhbmdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25UcmFuc2xhdGlvbkNoYW5nZSA9IHRoaXMudHJhbnNsYXRlLm9uVHJhbnNsYXRpb25DaGFuZ2Uuc3Vic2NyaWJlKChldmVudDogVHJhbnNsYXRpb25DaGFuZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGFzdEtleSAmJiBldmVudC5sYW5nID09PSB0aGlzLnRyYW5zbGF0ZS5jdXJyZW50TGFuZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdEtleSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVWYWx1ZShxdWVyeSwgaW50ZXJwb2xhdGVQYXJhbXMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gc3Vic2NyaWJlIHRvIG9uTGFuZ0NoYW5nZSBldmVudCwgaW4gY2FzZSB0aGUgbGFuZ3VhZ2UgY2hhbmdlc1xyXG4gICAgICAgIGlmKCF0aGlzLm9uTGFuZ0NoYW5nZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9uTGFuZ0NoYW5nZSA9IHRoaXMudHJhbnNsYXRlLm9uTGFuZ0NoYW5nZS5zdWJzY3JpYmUoKGV2ZW50OiBMYW5nQ2hhbmdlRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxhc3RLZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RLZXkgPSBudWxsOyAvLyB3ZSB3YW50IHRvIG1ha2Ugc3VyZSBpdCBkb2Vzbid0IHJldHVybiB0aGUgc2FtZSB2YWx1ZSB1bnRpbCBpdCdzIGJlZW4gdXBkYXRlZFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVmFsdWUocXVlcnksIGludGVycG9sYXRlUGFyYW1zKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsZWFuIGFueSBleGlzdGluZyBzdWJzY3JpcHRpb24gdG8gY2hhbmdlIGV2ZW50c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2Rpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICAgICAgaWYodHlwZW9mIHRoaXMub25UcmFuc2xhdGlvbkNoYW5nZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgdGhpcy5vblRyYW5zbGF0aW9uQ2hhbmdlLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgIHRoaXMub25UcmFuc2xhdGlvbkNoYW5nZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZW9mIHRoaXMub25MYW5nQ2hhbmdlICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICB0aGlzLm9uTGFuZ0NoYW5nZS51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9uTGFuZ0NoYW5nZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5fZGlzcG9zZSgpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==