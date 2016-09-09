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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require("@angular/core");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
require("rxjs/add/operator/share");
require("rxjs/add/operator/map");
require("rxjs/add/operator/merge");
require("rxjs/add/operator/toArray");
var translate_parser_1 = require("./translate.parser");
var MissingTranslationHandler = (function () {
    function MissingTranslationHandler() {
    }
    return MissingTranslationHandler;
}());
exports.MissingTranslationHandler = MissingTranslationHandler;
var TranslateLoader = (function () {
    function TranslateLoader() {
    }
    return TranslateLoader;
}());
exports.TranslateLoader = TranslateLoader;
var TranslateStaticLoader = (function () {
    function TranslateStaticLoader(http, prefix, suffix) {
        if (prefix === void 0) { prefix = "i18n"; }
        if (suffix === void 0) { suffix = ".json"; }
        this.http = http;
        this.prefix = prefix;
        this.suffix = suffix;
    }
    /**
     * Gets the translations from the server
     * @param lang
     * @returns {any}
     */
    TranslateStaticLoader.prototype.getTranslation = function (lang) {
        return this.http.get(this.prefix + "/" + lang + this.suffix)
            .map(function (res) { return res.json(); });
    };
    return TranslateStaticLoader;
}());
exports.TranslateStaticLoader = TranslateStaticLoader;
var TranslateService = (function () {
    /**
     *
     * @param http The Angular 2 http provider
     * @param currentLoader An instance of the loader currently used
     * @param missingTranslationHandler A handler for missing translations.
     */
    function TranslateService(currentLoader, missingTranslationHandler) {
        this.currentLoader = currentLoader;
        this.missingTranslationHandler = missingTranslationHandler;
        /**
         * The lang currently used
         */
        this.currentLang = this.defaultLang;
        /**
         * An EventEmitter to listen to translation change events
         * onTranslationChange.subscribe((params: TranslationChangeEvent) => {
         *     // do something
         * });
         * @type {ng.EventEmitter<TranslationChangeEvent>}
         */
        this.onTranslationChange = new core_1.EventEmitter();
        /**
         * An EventEmitter to listen to lang change events
         * onLangChange.subscribe((params: LangChangeEvent) => {
         *     // do something
         * });
         * @type {ng.EventEmitter<LangChangeEvent>}
         */
        this.onLangChange = new core_1.EventEmitter();
        this.translations = {};
        this.langs = [];
        this.parser = new translate_parser_1.Parser();
    }
    /**
     * Sets the default language to use as a fallback
     * @param lang
     */
    TranslateService.prototype.setDefaultLang = function (lang) {
        this.defaultLang = lang;
    };
    /**
     * Changes the lang currently used
     * @param lang
     * @returns {Observable<*>}
     */
    TranslateService.prototype.use = function (lang) {
        var _this = this;
        var pending;
        // check if this language is available
        if (typeof this.translations[lang] === "undefined") {
            // not available, ask for it
            pending = this.getTranslation(lang);
        }
        if (typeof pending !== "undefined") {
            // on init set the currentLang immediately
            if (!this.currentLang) {
                this.currentLang = lang;
            }
            pending.subscribe(function (res) {
                _this.changeLang(lang);
            });
            return pending;
        }
        else {
            this.changeLang(lang);
            return Observable_1.Observable.of(this.translations[lang]);
        }
    };
    /**
     * Gets an object of translations for a given language with the current loader
     * @param lang
     * @returns {Observable<*>}
     */
    TranslateService.prototype.getTranslation = function (lang) {
        var _this = this;
        this.pending = this.currentLoader.getTranslation(lang).share();
        this.pending.subscribe(function (res) {
            _this.translations[lang] = res;
            _this.updateLangs();
        }, function (err) {
            throw err;
        }, function () {
            _this.pending = undefined;
        });
        return this.pending;
    };
    /**
     * Manually sets an object of translations for a given language
     * @param lang
     * @param translations
     * @param shouldMerge
     */
    TranslateService.prototype.setTranslation = function (lang, translations, shouldMerge) {
        if (shouldMerge === void 0) { shouldMerge = false; }
        if (shouldMerge && this.translations[lang]) {
            Object.assign(this.translations[lang], translations);
            this.onTranslationChange.emit({ translations: translations, lang: lang });
        }
        else {
            this.translations[lang] = translations;
        }
        this.updateLangs();
    };
    /**
     * Returns an array of currently available langs
     * @returns {any}
     */
    TranslateService.prototype.getLangs = function () {
        return this.langs;
    };
    /**
     * @param langs
     * Add available langs
     */
    TranslateService.prototype.addLangs = function (langs) {
        var _this = this;
        langs.forEach(function (lang) {
            if (_this.langs.indexOf(lang) === -1) {
                _this.langs.push(lang);
            }
        });
    };
    /**
     * Update the list of available langs
     */
    TranslateService.prototype.updateLangs = function () {
        this.addLangs(Object.keys(this.translations));
    };
    /**
     * Returns the parsed result of the translations
     * @param translations
     * @param key
     * @param interpolateParams
     * @returns {any}
     */
    TranslateService.prototype.getParsedResult = function (translations, key, interpolateParams) {
        var res;
        if (key instanceof Array) {
            var result = {}, observables = false;
            for (var _i = 0, key_1 = key; _i < key_1.length; _i++) {
                var k = key_1[_i];
                result[k] = this.getParsedResult(translations, k, interpolateParams);
                if (typeof result[k].subscribe === "function") {
                    observables = true;
                }
            }
            if (observables) {
                var mergedObs = void 0;
                for (var _a = 0, key_2 = key; _a < key_2.length; _a++) {
                    var k = key_2[_a];
                    var obs = typeof result[k].subscribe === "function" ? result[k] : Observable_1.Observable.of(result[k]);
                    if (typeof mergedObs === "undefined") {
                        mergedObs = obs;
                    }
                    else {
                        mergedObs = mergedObs.merge(obs);
                    }
                }
                return mergedObs.toArray().map(function (arr) {
                    var obj = {};
                    arr.forEach(function (value, index) {
                        obj[key[index]] = value;
                    });
                    return obj;
                });
            }
            return result;
        }
        if (translations) {
            res = this.parser.interpolate(this.parser.getValue(translations, key), interpolateParams);
        }
        if (typeof res === "undefined" && this.defaultLang && this.defaultLang !== this.currentLang) {
            res = this.parser.interpolate(this.parser.getValue(this.translations[this.defaultLang], key), interpolateParams);
        }
        if (!res && this.missingTranslationHandler) {
            res = this.missingTranslationHandler.handle(key);
        }
        return res || key;
    };
    /**
     * Gets the translated value of a key (or an array of keys)
     * @param key
     * @param interpolateParams
     * @returns {any} the translated key, or an object of translated keys
     */
    TranslateService.prototype.get = function (key, interpolateParams) {
        var _this = this;
        if (!key) {
            throw new Error("Parameter \"key\" required");
        }
        // check if we are loading a new translation to use
        if (this.pending) {
            return Observable_1.Observable.create(function (observer) {
                var onComplete = function (res) {
                    observer.next(res);
                    observer.complete();
                };
                _this.pending.subscribe(function (res) {
                    res = _this.getParsedResult(res, key, interpolateParams);
                    if (typeof res.subscribe === "function") {
                        res.subscribe(onComplete);
                    }
                    else {
                        onComplete(res);
                    }
                });
            });
        }
        else {
            var res = this.getParsedResult(this.translations[this.currentLang], key, interpolateParams);
            if (typeof res.subscribe === "function") {
                return res;
            }
            else {
                return Observable_1.Observable.of(res);
            }
        }
    };
    /**
     * Returns a translation instantly from the internal state of loaded translation.
     * All rules regarding the current language, the preferred language of even fallback languages will be used except any promise handling.
     * @param key
     * @param interpolateParams
     * @returns {string}
     */
    TranslateService.prototype.instant = function (key, interpolateParams) {
        if (!key) {
            throw new Error("Parameter \"key\" required");
        }
        var res = this.getParsedResult(this.translations[this.currentLang], key, interpolateParams);
        if (typeof res.subscribe !== "undefined") {
            if (key instanceof Array) {
                var obj_1 = {};
                key.forEach(function (value, index) {
                    obj_1[key[index]] = key[index];
                });
                return obj_1;
            }
            return key;
        }
        else {
            return res;
        }
    };
    /**
     * Sets the translated value of a key
     * @param key
     * @param value
     * @param lang
     */
    TranslateService.prototype.set = function (key, value, lang) {
        if (lang === void 0) { lang = this.currentLang; }
        this.translations[lang][key] = value;
        this.updateLangs();
        this.onTranslationChange.emit({ translations: (_a = {}, _a[key] = value, _a), lang: lang });
        var _a;
    };
    /**
     * Changes the current lang
     * @param lang
     */
    TranslateService.prototype.changeLang = function (lang) {
        this.currentLang = lang;
        this.onLangChange.emit({ lang: lang, translations: this.translations[lang] });
    };
    /**
     * Allows to reload the lang file from the file
     * @param lang
     * @returns {Observable<any>}
     */
    TranslateService.prototype.reloadLang = function (lang) {
        this.resetLang(lang);
        return this.getTranslation(lang);
    };
    /**
     * Deletes inner translation
     * @param lang
     */
    TranslateService.prototype.resetLang = function (lang) {
        this.translations[lang] = undefined;
    };
    TranslateService.prototype.getBrowserLang = function () {
        if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
            return undefined;
        }
        var browserLang;
        if (typeof window.navigator['languages'] !== 'undefined' && window.navigator['languages'].length > 0) {
            browserLang = window.navigator['languages'][0].indexOf('-') !== -1 || window.navigator['languages'].length < 2 ? window.navigator['languages'][0] : window.navigator['languages'][1];
        }
        else {
            browserLang = window.navigator['language'] || window.navigator['browserLanguage'];
        }
        return browserLang && browserLang.length ? browserLang.split('-')[0] : undefined; // use navigator lang if available
    };
    TranslateService = __decorate([
        core_1.Injectable(),
        __param(1, core_1.Optional()), 
        __metadata('design:paramtypes', [TranslateLoader, MissingTranslationHandler])
    ], TranslateService);
    return TranslateService;
}());
exports.TranslateService = TranslateService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2xhdGUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEscUJBQWlELGVBQWUsQ0FBQyxDQUFBO0FBRWpFLDJCQUF5QixpQkFBaUIsQ0FBQyxDQUFBO0FBRTNDLFFBQU8sd0JBQXdCLENBQUMsQ0FBQTtBQUNoQyxRQUFPLHlCQUF5QixDQUFDLENBQUE7QUFDakMsUUFBTyx1QkFBdUIsQ0FBQyxDQUFBO0FBQy9CLFFBQU8seUJBQXlCLENBQUMsQ0FBQTtBQUNqQyxRQUFPLDJCQUEyQixDQUFDLENBQUE7QUFFbkMsaUNBQXFCLG9CQUFvQixDQUFDLENBQUE7QUFpQjFDO0lBQUE7SUFVQSxDQUFDO0lBQUQsZ0NBQUM7QUFBRCxDQUFDLEFBVkQsSUFVQztBQVZxQixpQ0FBeUIsNEJBVTlDLENBQUE7QUFFRDtJQUFBO0lBRUEsQ0FBQztJQUFELHNCQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFGcUIsdUJBQWUsa0JBRXBDLENBQUE7QUFFRDtJQUNJLCtCQUFvQixJQUFVLEVBQVUsTUFBdUIsRUFBVSxNQUF3QjtRQUFqRSxzQkFBK0IsR0FBL0IsZUFBK0I7UUFBRSxzQkFBZ0MsR0FBaEMsZ0JBQWdDO1FBQTdFLFNBQUksR0FBSixJQUFJLENBQU07UUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFpQjtRQUFVLFdBQU0sR0FBTixNQUFNLENBQWtCO0lBQ2pHLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksOENBQWMsR0FBckIsVUFBc0IsSUFBWTtRQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUksSUFBSSxDQUFDLE1BQU0sU0FBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQVEsQ0FBQzthQUN2RCxHQUFHLENBQUMsVUFBQyxHQUFhLElBQUssT0FBQSxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQVYsQ0FBVSxDQUFD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U0FBUyxDQUFDO1FBQ3JCLENBQUM7UUFDRCxJQUFJLFdBQWdCLENBQUM7UUFDckIsRUFBRSxDQUFDLENBQUMsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLFdBQVcsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25HLFdBQVcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLFdBQVcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRUQsTUFBTSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsa0NBQWtDO0lBQ3hILENBQUM7SUFyVEw7UUFBQyxpQkFBVSxFQUFFO21CQXFDMkMsZUFBUSxFQUFFOzt3QkFyQ3JEO0lBc1RiLHVCQUFDO0FBQUQsQ0FBQyxBQXJURCxJQXFUQztBQXJUWSx3QkFBZ0IsbUJBcVQ1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBFdmVudEVtaXR0ZXIsIE9wdGlvbmFsfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQge0h0dHAsIFJlc3BvbnNlfSBmcm9tIFwiQGFuZ3VsYXIvaHR0cFwiO1xyXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gXCJyeGpzL09ic2VydmFibGVcIjtcclxuaW1wb3J0IHtPYnNlcnZlcn0gZnJvbSBcInJ4anMvT2JzZXJ2ZXJcIjtcclxuaW1wb3J0IFwicnhqcy9hZGQvb2JzZXJ2YWJsZS9vZlwiO1xyXG5pbXBvcnQgXCJyeGpzL2FkZC9vcGVyYXRvci9zaGFyZVwiO1xyXG5pbXBvcnQgXCJyeGpzL2FkZC9vcGVyYXRvci9tYXBcIjtcclxuaW1wb3J0IFwicnhqcy9hZGQvb3BlcmF0b3IvbWVyZ2VcIjtcclxuaW1wb3J0IFwicnhqcy9hZGQvb3BlcmF0b3IvdG9BcnJheVwiO1xyXG5cclxuaW1wb3J0IHtQYXJzZXJ9IGZyb20gXCIuL3RyYW5zbGF0ZS5wYXJzZXJcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVHJhbnNsYXRpb25DaGFuZ2VFdmVudCB7XHJcbiAgICB0cmFuc2xhdGlvbnM6IGFueTtcclxuICAgIGxhbmc6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMYW5nQ2hhbmdlRXZlbnQge1xyXG4gICAgbGFuZzogc3RyaW5nO1xyXG4gICAgdHJhbnNsYXRpb25zOiBhbnk7XHJcbn1cclxuXHJcbmRlY2xhcmUgaW50ZXJmYWNlIFdpbmRvdyB7XHJcbiAgICBuYXZpZ2F0b3I6IGFueTtcclxufVxyXG5kZWNsYXJlIHZhciB3aW5kb3c6IFdpbmRvdztcclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyIHtcclxuICAgIC8qKlxyXG4gICAgICogQSBmdW5jdGlvbiB0aGF0IGhhbmRsZXMgbWlzc2luZyB0cmFuc2xhdGlvbnMuXHJcbiAgICAgKiBAcGFyYW0ga2V5IHRoZSBtaXNzaW5nIGtleVxyXG4gICAgICogQHJldHVybnMge2FueX0gYSB2YWx1ZSBvciBhbiBvYnNlcnZhYmxlXHJcbiAgICAgKiBJZiBpdCByZXR1cm5zIGEgdmFsdWUsIHRoZW4gdGhpcyB2YWx1ZSBpcyB1c2VkLlxyXG4gICAgICogSWYgaXQgcmV0dXJuIGFuIG9ic2VydmFibGUsIHRoZSB2YWx1ZSByZXR1cm5lZCBieSB0aGlzIG9ic2VydmFibGUgd2lsbCBiZSB1c2VkIChleGNlcHQgaWYgdGhlIG1ldGhvZCB3YXMgXCJpbnN0YW50XCIpLlxyXG4gICAgICogSWYgaXQgZG9lc24ndCByZXR1cm4gdGhlbiB0aGUga2V5IHdpbGwgYmUgdXNlZCBhcyBhIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIGFic3RyYWN0IGhhbmRsZShrZXk6IHN0cmluZyk6IGFueTtcclxufVxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRyYW5zbGF0ZUxvYWRlciB7XHJcbiAgICBhYnN0cmFjdCBnZXRUcmFuc2xhdGlvbihsYW5nOiBzdHJpbmcpOiBPYnNlcnZhYmxlPGFueT47XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUcmFuc2xhdGVTdGF0aWNMb2FkZXIgaW1wbGVtZW50cyBUcmFuc2xhdGVMb2FkZXIge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwLCBwcml2YXRlIHByZWZpeDogc3RyaW5nID0gXCJpMThuXCIsIHByaXZhdGUgc3VmZml4OiBzdHJpbmcgPSBcIi5qc29uXCIpIHtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIHRyYW5zbGF0aW9ucyBmcm9tIHRoZSBzZXJ2ZXJcclxuICAgICAqIEBwYXJhbSBsYW5nXHJcbiAgICAgKiBAcmV0dXJucyB7YW55fVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0VHJhbnNsYXRpb24obGFuZzogc3RyaW5nKTogT2JzZXJ2YWJsZTxhbnk+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5odHRwLmdldChgJHt0aGlzLnByZWZpeH0vJHtsYW5nfSR7dGhpcy5zdWZmaXh9YClcclxuICAgICAgICAgICAgLm1hcCgocmVzOiBSZXNwb25zZSkgPT4gcmVzLmpzb24oKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIFRyYW5zbGF0ZVNlcnZpY2Uge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbGFuZyBjdXJyZW50bHkgdXNlZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY3VycmVudExhbmc6IHN0cmluZyA9IHRoaXMuZGVmYXVsdExhbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBbiBFdmVudEVtaXR0ZXIgdG8gbGlzdGVuIHRvIHRyYW5zbGF0aW9uIGNoYW5nZSBldmVudHNcclxuICAgICAqIG9uVHJhbnNsYXRpb25DaGFuZ2Uuc3Vic2NyaWJlKChwYXJhbXM6IFRyYW5zbGF0aW9uQ2hhbmdlRXZlbnQpID0+IHtcclxuICAgICAqICAgICAvLyBkbyBzb21ldGhpbmdcclxuICAgICAqIH0pO1xyXG4gICAgICogQHR5cGUge25nLkV2ZW50RW1pdHRlcjxUcmFuc2xhdGlvbkNoYW5nZUV2ZW50Pn1cclxuICAgICAqL1xyXG4gICAgcHVibGljIG9uVHJhbnNsYXRpb25DaGFuZ2U6IEV2ZW50RW1pdHRlcjxUcmFuc2xhdGlvbkNoYW5nZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8VHJhbnNsYXRpb25DaGFuZ2VFdmVudD4oKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFuIEV2ZW50RW1pdHRlciB0byBsaXN0ZW4gdG8gbGFuZyBjaGFuZ2UgZXZlbnRzXHJcbiAgICAgKiBvbkxhbmdDaGFuZ2Uuc3Vic2NyaWJlKChwYXJhbXM6IExhbmdDaGFuZ2VFdmVudCkgPT4ge1xyXG4gICAgICogICAgIC8vIGRvIHNvbWV0aGluZ1xyXG4gICAgICogfSk7XHJcbiAgICAgKiBAdHlwZSB7bmcuRXZlbnRFbWl0dGVyPExhbmdDaGFuZ2VFdmVudD59XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBvbkxhbmdDaGFuZ2U6IEV2ZW50RW1pdHRlcjxMYW5nQ2hhbmdlRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxMYW5nQ2hhbmdlRXZlbnQ+KCk7XHJcblxyXG4gICAgcHJpdmF0ZSBwZW5kaW5nOiBhbnk7XHJcbiAgICBwcml2YXRlIHRyYW5zbGF0aW9uczogYW55ID0ge307XHJcbiAgICBwcml2YXRlIGRlZmF1bHRMYW5nOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGxhbmdzOiBBcnJheTxzdHJpbmc+ID0gW107XHJcbiAgICBwcml2YXRlIHBhcnNlcjogUGFyc2VyID0gbmV3IFBhcnNlcigpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBodHRwIFRoZSBBbmd1bGFyIDIgaHR0cCBwcm92aWRlclxyXG4gICAgICogQHBhcmFtIGN1cnJlbnRMb2FkZXIgQW4gaW5zdGFuY2Ugb2YgdGhlIGxvYWRlciBjdXJyZW50bHkgdXNlZFxyXG4gICAgICogQHBhcmFtIG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIgQSBoYW5kbGVyIGZvciBtaXNzaW5nIHRyYW5zbGF0aW9ucy5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIGN1cnJlbnRMb2FkZXI6IFRyYW5zbGF0ZUxvYWRlciwgQE9wdGlvbmFsKCkgcHJpdmF0ZSBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyOiBNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyKSB7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBkZWZhdWx0IGxhbmd1YWdlIHRvIHVzZSBhcyBhIGZhbGxiYWNrXHJcbiAgICAgKiBAcGFyYW0gbGFuZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0RGVmYXVsdExhbmcobGFuZzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0TGFuZyA9IGxhbmc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGFuZ2VzIHRoZSBsYW5nIGN1cnJlbnRseSB1c2VkXHJcbiAgICAgKiBAcGFyYW0gbGFuZ1xyXG4gICAgICogQHJldHVybnMge09ic2VydmFibGU8Kj59XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB1c2UobGFuZzogc3RyaW5nKTogT2JzZXJ2YWJsZTxhbnk+IHtcclxuICAgICAgICBsZXQgcGVuZGluZzogT2JzZXJ2YWJsZTxhbnk+O1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIHRoaXMgbGFuZ3VhZ2UgaXMgYXZhaWxhYmxlXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnRyYW5zbGF0aW9uc1tsYW5nXSA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICAvLyBub3QgYXZhaWxhYmxlLCBhc2sgZm9yIGl0XHJcbiAgICAgICAgICAgIHBlbmRpbmcgPSB0aGlzLmdldFRyYW5zbGF0aW9uKGxhbmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBwZW5kaW5nICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgIC8vIG9uIGluaXQgc2V0IHRoZSBjdXJyZW50TGFuZyBpbW1lZGlhdGVseVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY3VycmVudExhbmcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudExhbmcgPSBsYW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBlbmRpbmcuc3Vic2NyaWJlKChyZXM6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VMYW5nKGxhbmcpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBwZW5kaW5nO1xyXG4gICAgICAgIH0gZWxzZSB7IC8vIHdlIGhhdmUgdGhpcyBsYW5ndWFnZSwgcmV0dXJuIGFuIE9ic2VydmFibGVcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VMYW5nKGxhbmcpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIE9ic2VydmFibGUub2YodGhpcy50cmFuc2xhdGlvbnNbbGFuZ10pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgYW4gb2JqZWN0IG9mIHRyYW5zbGF0aW9ucyBmb3IgYSBnaXZlbiBsYW5ndWFnZSB3aXRoIHRoZSBjdXJyZW50IGxvYWRlclxyXG4gICAgICogQHBhcmFtIGxhbmdcclxuICAgICAqIEByZXR1cm5zIHtPYnNlcnZhYmxlPCo+fVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0VHJhbnNsYXRpb24obGFuZzogc3RyaW5nKTogT2JzZXJ2YWJsZTxhbnk+IHtcclxuICAgICAgICB0aGlzLnBlbmRpbmcgPSB0aGlzLmN1cnJlbnRMb2FkZXIuZ2V0VHJhbnNsYXRpb24obGFuZykuc2hhcmUoKTtcclxuICAgICAgICB0aGlzLnBlbmRpbmcuc3Vic2NyaWJlKChyZXM6IE9iamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zbGF0aW9uc1tsYW5nXSA9IHJlcztcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVMYW5ncygpO1xyXG4gICAgICAgIH0sIChlcnI6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBlbmRpbmcgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnBlbmRpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYW51YWxseSBzZXRzIGFuIG9iamVjdCBvZiB0cmFuc2xhdGlvbnMgZm9yIGEgZ2l2ZW4gbGFuZ3VhZ2VcclxuICAgICAqIEBwYXJhbSBsYW5nXHJcbiAgICAgKiBAcGFyYW0gdHJhbnNsYXRpb25zXHJcbiAgICAgKiBAcGFyYW0gc2hvdWxkTWVyZ2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldFRyYW5zbGF0aW9uKGxhbmc6IHN0cmluZywgdHJhbnNsYXRpb25zOiBPYmplY3QsIHNob3VsZE1lcmdlOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcclxuICAgICAgICBpZiAoc2hvdWxkTWVyZ2UgJiYgdGhpcy50cmFuc2xhdGlvbnNbbGFuZ10pIHtcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLnRyYW5zbGF0aW9uc1tsYW5nXSwgdHJhbnNsYXRpb25zKTtcclxuICAgICAgICAgICAgdGhpcy5vblRyYW5zbGF0aW9uQ2hhbmdlLmVtaXQoe3RyYW5zbGF0aW9uczogdHJhbnNsYXRpb25zLCBsYW5nOiBsYW5nfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2xhdGlvbnNbbGFuZ10gPSB0cmFuc2xhdGlvbnM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudXBkYXRlTGFuZ3MoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgb2YgY3VycmVudGx5IGF2YWlsYWJsZSBsYW5nc1xyXG4gICAgICogQHJldHVybnMge2FueX1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldExhbmdzKCk6IEFycmF5PHN0cmluZz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIGxhbmdzXHJcbiAgICAgKiBBZGQgYXZhaWxhYmxlIGxhbmdzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRMYW5ncyhsYW5nczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xyXG4gICAgICAgIGxhbmdzLmZvckVhY2goKGxhbmc6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBpZih0aGlzLmxhbmdzLmluZGV4T2YobGFuZykgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhbmdzLnB1c2gobGFuZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZSB0aGUgbGlzdCBvZiBhdmFpbGFibGUgbGFuZ3NcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB1cGRhdGVMYW5ncygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmFkZExhbmdzKE9iamVjdC5rZXlzKHRoaXMudHJhbnNsYXRpb25zKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBwYXJzZWQgcmVzdWx0IG9mIHRoZSB0cmFuc2xhdGlvbnNcclxuICAgICAqIEBwYXJhbSB0cmFuc2xhdGlvbnNcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBpbnRlcnBvbGF0ZVBhcmFtc1xyXG4gICAgICogQHJldHVybnMge2FueX1cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRQYXJzZWRSZXN1bHQodHJhbnNsYXRpb25zOiBhbnksIGtleTogYW55LCBpbnRlcnBvbGF0ZVBhcmFtcz86IE9iamVjdCk6IGFueSB7XHJcbiAgICAgICAgbGV0IHJlczogc3RyaW5nfE9ic2VydmFibGU8c3RyaW5nPjtcclxuXHJcbiAgICAgICAgaWYgKGtleSBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IGFueSA9IHt9LFxyXG4gICAgICAgICAgICAgICAgb2JzZXJ2YWJsZXM6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgZm9yIChsZXQgayBvZiBrZXkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrXSA9IHRoaXMuZ2V0UGFyc2VkUmVzdWx0KHRyYW5zbGF0aW9ucywgaywgaW50ZXJwb2xhdGVQYXJhbXMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHRba10uc3Vic2NyaWJlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBvYnNlcnZhYmxlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9ic2VydmFibGVzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWVyZ2VkT2JzOiBhbnk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrIG9mIGtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBvYnMgPSB0eXBlb2YgcmVzdWx0W2tdLnN1YnNjcmliZSA9PT0gXCJmdW5jdGlvblwiID8gcmVzdWx0W2tdIDogT2JzZXJ2YWJsZS5vZihyZXN1bHRba10pO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWVyZ2VkT2JzID09PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lcmdlZE9icyA9IG9icztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXJnZWRPYnMgPSBtZXJnZWRPYnMubWVyZ2Uob2JzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVyZ2VkT2JzLnRvQXJyYXkoKS5tYXAoKGFycjogQXJyYXk8c3RyaW5nPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBvYmo6IGFueSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgICAgIGFyci5mb3JFYWNoKCh2YWx1ZTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ialtrZXlbaW5kZXhdXSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRyYW5zbGF0aW9ucykge1xyXG4gICAgICAgICAgICByZXMgPSB0aGlzLnBhcnNlci5pbnRlcnBvbGF0ZSh0aGlzLnBhcnNlci5nZXRWYWx1ZSh0cmFuc2xhdGlvbnMsIGtleSksIGludGVycG9sYXRlUGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgcmVzID09PSBcInVuZGVmaW5lZFwiICYmIHRoaXMuZGVmYXVsdExhbmcgJiYgdGhpcy5kZWZhdWx0TGFuZyAhPT0gdGhpcy5jdXJyZW50TGFuZykge1xyXG4gICAgICAgICAgICByZXMgPSB0aGlzLnBhcnNlci5pbnRlcnBvbGF0ZSh0aGlzLnBhcnNlci5nZXRWYWx1ZSh0aGlzLnRyYW5zbGF0aW9uc1t0aGlzLmRlZmF1bHRMYW5nXSwga2V5KSwgaW50ZXJwb2xhdGVQYXJhbXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZXMgJiYgdGhpcy5taXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIHJlcyA9IHRoaXMubWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlci5oYW5kbGUoa2V5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXMgfHwga2V5O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgdHJhbnNsYXRlZCB2YWx1ZSBvZiBhIGtleSAob3IgYW4gYXJyYXkgb2Yga2V5cylcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBpbnRlcnBvbGF0ZVBhcmFtc1xyXG4gICAgICogQHJldHVybnMge2FueX0gdGhlIHRyYW5zbGF0ZWQga2V5LCBvciBhbiBvYmplY3Qgb2YgdHJhbnNsYXRlZCBrZXlzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQoa2V5OiBzdHJpbmd8QXJyYXk8c3RyaW5nPiwgaW50ZXJwb2xhdGVQYXJhbXM/OiBPYmplY3QpOiBPYnNlcnZhYmxlPHN0cmluZ3xhbnk+IHtcclxuICAgICAgICBpZiAoIWtleSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBhcmFtZXRlciBcImtleVwiIHJlcXVpcmVkYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNoZWNrIGlmIHdlIGFyZSBsb2FkaW5nIGEgbmV3IHRyYW5zbGF0aW9uIHRvIHVzZVxyXG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9ic2VydmFibGUuY3JlYXRlKChvYnNlcnZlcjogT2JzZXJ2ZXI8c3RyaW5nPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9uQ29tcGxldGUgPSAocmVzOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBlbmRpbmcuc3Vic2NyaWJlKChyZXM6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcyA9IHRoaXMuZ2V0UGFyc2VkUmVzdWx0KHJlcywga2V5LCBpbnRlcnBvbGF0ZVBhcmFtcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXMuc3Vic2NyaWJlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnN1YnNjcmliZShvbkNvbXBsZXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCByZXMgPSB0aGlzLmdldFBhcnNlZFJlc3VsdCh0aGlzLnRyYW5zbGF0aW9uc1t0aGlzLmN1cnJlbnRMYW5nXSwga2V5LCBpbnRlcnBvbGF0ZVBhcmFtcyk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzLnN1YnNjcmliZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9ic2VydmFibGUub2YocmVzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSB0cmFuc2xhdGlvbiBpbnN0YW50bHkgZnJvbSB0aGUgaW50ZXJuYWwgc3RhdGUgb2YgbG9hZGVkIHRyYW5zbGF0aW9uLlxyXG4gICAgICogQWxsIHJ1bGVzIHJlZ2FyZGluZyB0aGUgY3VycmVudCBsYW5ndWFnZSwgdGhlIHByZWZlcnJlZCBsYW5ndWFnZSBvZiBldmVuIGZhbGxiYWNrIGxhbmd1YWdlcyB3aWxsIGJlIHVzZWQgZXhjZXB0IGFueSBwcm9taXNlIGhhbmRsaW5nLlxyXG4gICAgICogQHBhcmFtIGtleVxyXG4gICAgICogQHBhcmFtIGludGVycG9sYXRlUGFyYW1zXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaW5zdGFudChrZXk6IHN0cmluZ3xBcnJheTxzdHJpbmc+LCBpbnRlcnBvbGF0ZVBhcmFtcz86IE9iamVjdCk6IHN0cmluZ3xhbnkge1xyXG4gICAgICAgIGlmICgha2V5KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUGFyYW1ldGVyIFwia2V5XCIgcmVxdWlyZWRgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCByZXMgPSB0aGlzLmdldFBhcnNlZFJlc3VsdCh0aGlzLnRyYW5zbGF0aW9uc1t0aGlzLmN1cnJlbnRMYW5nXSwga2V5LCBpbnRlcnBvbGF0ZVBhcmFtcyk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiByZXMuc3Vic2NyaWJlICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgIGlmIChrZXkgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9iajogYW55ID0ge307XHJcbiAgICAgICAgICAgICAgICBrZXkuZm9yRWFjaCgodmFsdWU6IHN0cmluZywgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIG9ialtrZXlbaW5kZXhdXSA9IGtleVtpbmRleF07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGtleTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHRyYW5zbGF0ZWQgdmFsdWUgb2YgYSBrZXlcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICogQHBhcmFtIGxhbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZywgbGFuZzogc3RyaW5nID0gdGhpcy5jdXJyZW50TGFuZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudHJhbnNsYXRpb25zW2xhbmddW2tleV0gPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUxhbmdzKCk7XHJcbiAgICAgICAgdGhpcy5vblRyYW5zbGF0aW9uQ2hhbmdlLmVtaXQoe3RyYW5zbGF0aW9uczoge1trZXldOiB2YWx1ZX0sIGxhbmc6IGxhbmd9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoYW5nZXMgdGhlIGN1cnJlbnQgbGFuZ1xyXG4gICAgICogQHBhcmFtIGxhbmdcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGFuZ2VMYW5nKGxhbmc6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY3VycmVudExhbmcgPSBsYW5nO1xyXG4gICAgICAgIHRoaXMub25MYW5nQ2hhbmdlLmVtaXQoe2xhbmc6IGxhbmcsIHRyYW5zbGF0aW9uczogdGhpcy50cmFuc2xhdGlvbnNbbGFuZ119KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFsbG93cyB0byByZWxvYWQgdGhlIGxhbmcgZmlsZSBmcm9tIHRoZSBmaWxlXHJcbiAgICAgKiBAcGFyYW0gbGFuZ1xyXG4gICAgICogQHJldHVybnMge09ic2VydmFibGU8YW55Pn1cclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlbG9hZExhbmcobGFuZzogc3RyaW5nKTogT2JzZXJ2YWJsZTxhbnk+IHtcclxuICAgICAgICB0aGlzLnJlc2V0TGFuZyhsYW5nKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRUcmFuc2xhdGlvbihsYW5nKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlbGV0ZXMgaW5uZXIgdHJhbnNsYXRpb25cclxuICAgICAqIEBwYXJhbSBsYW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZXNldExhbmcobGFuZzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy50cmFuc2xhdGlvbnNbbGFuZ10gPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldEJyb3dzZXJMYW5nKCk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3aW5kb3cubmF2aWdhdG9yID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYnJvd3Nlckxhbmc6IGFueTtcclxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5uYXZpZ2F0b3JbJ2xhbmd1YWdlcyddICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubmF2aWdhdG9yWydsYW5ndWFnZXMnXS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGJyb3dzZXJMYW5nID0gd2luZG93Lm5hdmlnYXRvclsnbGFuZ3VhZ2VzJ11bMF0uaW5kZXhPZignLScpICE9PSAtMSB8fCB3aW5kb3cubmF2aWdhdG9yWydsYW5ndWFnZXMnXS5sZW5ndGggPCAyID8gd2luZG93Lm5hdmlnYXRvclsnbGFuZ3VhZ2VzJ11bMF0gOiB3aW5kb3cubmF2aWdhdG9yWydsYW5ndWFnZXMnXVsxXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBicm93c2VyTGFuZyA9IHdpbmRvdy5uYXZpZ2F0b3JbJ2xhbmd1YWdlJ10gfHwgd2luZG93Lm5hdmlnYXRvclsnYnJvd3Nlckxhbmd1YWdlJ107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYnJvd3NlckxhbmcgJiYgYnJvd3NlckxhbmcubGVuZ3RoID8gYnJvd3Nlckxhbmcuc3BsaXQoJy0nKVswXSA6IHVuZGVmaW5lZDsgLy8gdXNlIG5hdmlnYXRvciBsYW5nIGlmIGF2YWlsYWJsZVxyXG4gICAgfVxyXG59XHJcbiJdfQ==