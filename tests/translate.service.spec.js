"use strict";
var http_1 = require("@angular/http");
var testing_1 = require("@angular/http/testing");
var ng2_translate_1 = require('./../ng2-translate');
var Observable_1 = require("rxjs/Observable");
var testing_2 = require("@angular/core/testing");
var mockBackendResponse = function (connection, response) {
    connection.mockRespond(new http_1.Response(new http_1.ResponseOptions({ body: response })));
};
describe('TranslateService', function () {
    var injector;
    var backend;
    var translate;
    var connection; // this will be set when a new connection is emitted from the backend.
    beforeEach(function () {
        testing_2.TestBed.configureTestingModule({
            imports: [http_1.HttpModule, ng2_translate_1.TranslateModule.forRoot()],
            providers: [
                { provide: http_1.XHRBackend, useClass: testing_1.MockBackend }
            ]
        });
        injector = testing_2.getTestBed();
        backend = injector.get(http_1.XHRBackend);
        translate = injector.get(ng2_translate_1.TranslateService);
        // sets the connection when someone tries to access the backend with an xhr request
        backend.connections.subscribe(function (c) { return connection = c; });
    });
    afterEach(function () {
        injector = undefined;
        backend = undefined;
        translate = undefined;
        connection = undefined;
    });
    it('is defined', function () {
        expect(ng2_translate_1.TranslateService).toBeDefined();
        expect(translate).toBeDefined();
        expect(translate instanceof ng2_translate_1.TranslateService).toBeTruthy();
    });
    it('should be able to get translations', function () {
        translate.use('en');
        // this will request the translation from the backend because we use a static files loader for TranslateService
        translate.get('TEST').subscribe(function (res) {
            expect(res).toEqual('This is a test');
        });
        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test", "TEST2": "This is another test"}');
        // this will request the translation from downloaded translations without making a request to the backend
        translate.get('TEST2').subscribe(function (res) {
            expect(res).toEqual('This is another test');
        });
    });
    it('should be able to get an array translations', function () {
        var translations = { "TEST": "This is a test", "TEST2": "This is another test2" };
        translate.use('en');
        // this will request the translation from the backend because we use a static files loader for TranslateService
        translate.get(['TEST', 'TEST2']).subscribe(function (res) {
            expect(res).toEqual(translations);
        });
        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, JSON.stringify(translations));
    });
    it("should fallback to the default language", function () {
        translate.use('fr');
        translate.setDefaultLang('en');
        translate.setTranslation('en', { "TEST": "This is a test" });
        translate.get('TEST').subscribe(function (res) {
            expect(res).toEqual('This is a test');
        });
        mockBackendResponse(connection, '{}');
    });
    it("should return the key when it doesn't find a translation", function () {
        translate.use('en');
        translate.get('TEST').subscribe(function (res) {
            expect(res).toEqual('TEST');
        });
        mockBackendResponse(connection, '{}');
    });
    it("should return the key when you haven't defined any translation", function () {
        translate.get('TEST').subscribe(function (res) {
            expect(res).toEqual('TEST');
        });
    });
    it('should be able to get translations with params', function () {
        translate.use('en');
        translate.get('TEST', { param: 'with param' }).subscribe(function (res) {
            expect(res).toEqual('This is a test with param');
        });
        mockBackendResponse(connection, '{"TEST": "This is a test {{param}}"}');
    });
    it('should be able to get translations with nested params', function () {
        translate.use('en');
        translate.get('TEST', { param: { value: 'with param' } }).subscribe(function (res) {
            expect(res).toEqual('This is a test with param');
        });
        mockBackendResponse(connection, '{"TEST": "This is a test {{param.value}}"}');
    });
    it('should throw if you forget the key', function () {
        translate.use('en');
        expect(function () {
            translate.get(undefined);
        }).toThrowError('Parameter "key" required');
    });
    it('should be able to get translations with nested keys', function () {
        translate.use('en');
        translate.get('TEST.TEST').subscribe(function (res) {
            expect(res).toEqual('This is a test');
        });
        mockBackendResponse(connection, '{"TEST": {"TEST": "This is a test"}, "TEST2": {"TEST2": {"TEST2": "This is another test"}}}');
        translate.get('TEST2.TEST2.TEST2').subscribe(function (res) {
            expect(res).toEqual('This is another test');
        });
    });
    it("shouldn't override the translations if you set the translations twice ", function (done) {
        translate.setTranslation('en', { "TEST": "This is a test" }, true);
        translate.setTranslation('en', { "TEST2": "This is a test" }, true);
        translate.use('en');
        translate.get('TEST').subscribe(function (res) {
            expect(res).toEqual('This is a test');
            expect(connection).not.toBeDefined();
            done();
        });
    });
    it("shouldn't do a request to the backend if you set the translation yourself", function (done) {
        translate.setTranslation('en', { "TEST": "This is a test" });
        translate.use('en');
        translate.get('TEST').subscribe(function (res) {
            expect(res).toEqual('This is a test');
            expect(connection).not.toBeDefined();
            done();
        });
    });
    it('should be able to get instant translations', function () {
        translate.setTranslation('en', { "TEST": "This is a test" });
        translate.use('en');
        expect(translate.instant('TEST')).toEqual('This is a test');
    });
    it('should be able to get instant translations of an array', function () {
        var translations = { "TEST": "This is a test", "TEST2": "This is a test2" };
        translate.setTranslation('en', translations);
        translate.use('en');
        expect(translate.instant(['TEST', 'TEST2'])).toEqual(translations);
    });
    it('should return the key if instant translations are not available', function () {
        translate.setTranslation('en', { "TEST": "This is a test" });
        translate.use('en');
        expect(translate.instant('TEST2')).toEqual('TEST2');
    });
    it('should trigger an event when the translation value changes', function () {
        translate.setTranslation('en', {});
        translate.onTranslationChange.subscribe(function (event) {
            expect(event.translations).toBeDefined();
            expect(event.translations["TEST"]).toEqual("This is a test");
            expect(event.lang).toBe('en');
        });
        translate.set("TEST", "This is a test", 'en');
    });
    it('should trigger an event when the lang changes', function () {
        var tr = { "TEST": "This is a test" };
        translate.setTranslation('en', tr);
        translate.onLangChange.subscribe(function (event) {
            expect(event.lang).toBe('en');
            expect(event.translations).toEqual(tr);
        });
        translate.use('en');
    });
    it('should be able to reset a lang', function (done) {
        translate.use('en');
        spyOn(connection, 'mockRespond').and.callThrough();
        // this will request the translation from the backend because we use a static files loader for TranslateService
        translate.get('TEST').subscribe(function (res) {
            expect(res).toEqual('This is a test');
            expect(connection.mockRespond).toHaveBeenCalledTimes(1);
            // reset the lang as if it was never initiated
            translate.resetLang('en');
            expect(translate.instant('TEST')).toEqual('TEST');
            // use set timeout because no request is really made and we need to trigger zone to resolve the observable
            setTimeout(function () {
                translate.get('TEST').subscribe(function (res2) {
                    expect(res2).toEqual('TEST'); // because the loader is "pristine" as if it was never called
                    expect(connection.mockRespond).toHaveBeenCalledTimes(1);
                    done();
                });
            }, 10);
        });
        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test"}');
    });
    it('should be able to reload a lang', function () {
        translate.use('en');
        // this will request the translation from the backend because we use a static files loader for TranslateService
        translate.get('TEST').subscribe(function (res) {
            expect(res).toEqual('This is a test');
            // reset the lang as if it was never initiated
            translate.reloadLang('en').subscribe(function (res2) {
                expect(translate.instant('TEST')).toEqual('This is a test 2');
            });
            mockBackendResponse(connection, '{"TEST": "This is a test 2"}');
        });
        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test"}');
    });
    it('should be able to add new langs', function () {
        translate.addLangs(['pl', 'es']);
        expect(translate.getLangs()).toEqual(['pl', 'es']);
        translate.addLangs(['fr']);
        translate.addLangs(['pl', 'fr']);
        expect(translate.getLangs()).toEqual(['pl', 'es', 'fr']);
        // this will request the translation from the backend because we use a static files loader for TranslateService
        translate.use('en').subscribe(function (res) {
            expect(translate.getLangs()).toEqual(['pl', 'es', 'fr', 'en']);
            translate.addLangs(['de']);
            expect(translate.getLangs()).toEqual(['pl', 'es', 'fr', 'en', 'de']);
        });
        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test"}');
    });
    it('should be able to get the browserLang', function () {
        var browserLang = translate.getBrowserLang();
        expect(browserLang).toBeDefined();
        expect(typeof browserLang === 'string').toBeTruthy();
    });
});
describe('MissingTranslationHandler', function () {
    var injector;
    var backend;
    var translate;
    var connection; // this will be set when a new connection is emitted from the backend.
    var missingTranslationHandler;
    var Missing = (function () {
        function Missing() {
        }
        Missing.prototype.handle = function (key) {
            return "handled";
        };
        return Missing;
    }());
    var MissingObs = (function () {
        function MissingObs() {
        }
        MissingObs.prototype.handle = function (key) {
            return Observable_1.Observable.of("handled: " + key);
        };
        return MissingObs;
    }());
    var prepare = (function (handlerClass) {
        testing_2.TestBed.configureTestingModule({
            imports: [http_1.HttpModule, ng2_translate_1.TranslateModule.forRoot()],
            providers: [
                { provide: ng2_translate_1.MissingTranslationHandler, useClass: handlerClass },
                { provide: http_1.XHRBackend, useClass: testing_1.MockBackend }
            ]
        });
        injector = testing_2.getTestBed();
        backend = injector.get(http_1.XHRBackend);
        translate = injector.get(ng2_translate_1.TranslateService);
        missingTranslationHandler = injector.get(ng2_translate_1.MissingTranslationHandler);
        // sets the connection when someone tries to access the backend with an xhr request
        backend.connections.subscribe(function (c) { return connection = c; });
    });
    afterEach(function () {
        injector = undefined;
        backend = undefined;
        translate = undefined;
        connection = undefined;
        missingTranslationHandler = undefined;
    });
    it('should use the MissingTranslationHandler when the key does not exist', function () {
        prepare(Missing);
        translate.use('en');
        spyOn(missingTranslationHandler, 'handle').and.callThrough();
        translate.get('nonExistingKey').subscribe(function (res) {
            expect(missingTranslationHandler.handle).toHaveBeenCalledWith('nonExistingKey');
            expect(res).toEqual('handled');
        });
        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test"}');
    });
    it('should return the key when using MissingTranslationHandler & the handler returns nothing', function () {
        var MissingUndef = (function () {
            function MissingUndef() {
            }
            MissingUndef.prototype.handle = function (key) {
            };
            return MissingUndef;
        }());
        prepare(MissingUndef);
        translate.use('en');
        spyOn(missingTranslationHandler, 'handle').and.callThrough();
        translate.get('nonExistingKey').subscribe(function (res) {
            expect(missingTranslationHandler.handle).toHaveBeenCalledWith('nonExistingKey');
            expect(res).toEqual('nonExistingKey');
        });
        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test"}');
    });
    it('should not call the MissingTranslationHandler when the key exists', function () {
        prepare(Missing);
        translate.use('en');
        spyOn(missingTranslationHandler, 'handle').and.callThrough();
        translate.get('TEST').subscribe(function () {
            expect(missingTranslationHandler.handle).not.toHaveBeenCalled();
        });
        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test"}');
    });
    it('should use the MissingTranslationHandler when the key does not exist & we use instant translation', function () {
        prepare(Missing);
        translate.use('en');
        spyOn(missingTranslationHandler, 'handle').and.callThrough();
        expect(translate.instant('nonExistingKey')).toEqual('handled');
        expect(missingTranslationHandler.handle).toHaveBeenCalledWith('nonExistingKey');
    });
    it('should wait for the MissingTranslationHandler when it returns an observable & we use get', function () {
        prepare(MissingObs);
        translate.use('en');
        spyOn(missingTranslationHandler, 'handle').and.callThrough();
        translate.get('nonExistingKey').subscribe(function (res) {
            expect(missingTranslationHandler.handle).toHaveBeenCalledWith('nonExistingKey');
            expect(res).toEqual('handled: nonExistingKey');
        });
        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test"}');
    });
    it('should wait for the MissingTranslationHandler when it returns an observable & we use get with an array', function () {
        var translations = {
            nonExistingKey1: 'handled: nonExistingKey1',
            nonExistingKey2: 'handled: nonExistingKey2',
            nonExistingKey3: 'handled: nonExistingKey3'
        };
        prepare(MissingObs);
        translate.use('en');
        spyOn(missingTranslationHandler, 'handle').and.callThrough();
        translate.get(Object.keys(translations)).subscribe(function (res) {
            expect(missingTranslationHandler.handle).toHaveBeenCalledTimes(3);
            expect(res).toEqual(translations);
        });
        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test"}');
    });
    it('should not wait for the MissingTranslationHandler when it returns an observable & we use instant', function () {
        prepare(MissingObs);
        translate.use('en');
        spyOn(missingTranslationHandler, 'handle').and.callThrough();
        expect(translate.instant('nonExistingKey')).toEqual('nonExistingKey');
        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test"}');
    });
    it('should not wait for the MissingTranslationHandler when it returns an observable & we use instant with an array', function () {
        var translations = {
            nonExistingKey1: 'handled: nonExistingKey1',
            nonExistingKey2: 'handled: nonExistingKey2',
            nonExistingKey3: 'handled: nonExistingKey3'
        };
        prepare(MissingObs);
        translate.use('en');
        spyOn(missingTranslationHandler, 'handle').and.callThrough();
        expect(translate.instant(Object.keys(translations))).toEqual({
            nonExistingKey1: 'nonExistingKey1',
            nonExistingKey2: 'nonExistingKey2',
            nonExistingKey3: 'nonExistingKey3'
        });
        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test"}');
    });
});
describe('TranslateLoader', function () {
    var injector;
    var backend;
    var translate;
    var connection; // this will be set when a new connection is emitted from the backend.
    var prepare = function (_injector) {
        backend = _injector.get(http_1.XHRBackend);
        translate = _injector.get(ng2_translate_1.TranslateService);
        // sets the connection when someone tries to access the backend with an xhr request
        backend.connections.subscribe(function (c) { return connection = c; });
    };
    it('should be able to provide TranslateStaticLoader', function () {
        testing_2.TestBed.configureTestingModule({
            imports: [http_1.HttpModule, ng2_translate_1.TranslateModule.forRoot()],
            providers: [
                { provide: http_1.XHRBackend, useClass: testing_1.MockBackend }
            ]
        });
        injector = testing_2.getTestBed();
        prepare(injector);
        expect(translate).toBeDefined();
        expect(translate.currentLoader).toBeDefined();
        expect(translate.currentLoader instanceof ng2_translate_1.TranslateStaticLoader).toBeTruthy();
        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use('en');
        // this will request the translation from the backend because we use a static files loader for TranslateService
        translate.get('TEST').subscribe(function (res) {
            expect(res).toEqual('This is a test');
        });
        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test"}');
    });
    it('should be able to provide any TranslateLoader', function () {
        var CustomLoader = (function () {
            function CustomLoader() {
            }
            CustomLoader.prototype.getTranslation = function (lang) {
                return Observable_1.Observable.of({ "TEST": "This is a test" });
            };
            return CustomLoader;
        }());
        testing_2.TestBed.configureTestingModule({
            imports: [http_1.HttpModule, ng2_translate_1.TranslateModule.forRoot({ provide: ng2_translate_1.TranslateLoader, useClass: CustomLoader })],
            providers: [
                { provide: http_1.XHRBackend, useClass: testing_1.MockBackend }
            ]
        });
        injector = testing_2.getTestBed();
        prepare(injector);
        expect(translate).toBeDefined();
        expect(translate.currentLoader).toBeDefined();
        expect(translate.currentLoader instanceof CustomLoader).toBeTruthy();
        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use('en');
        // this will request the translation from the CustomLoader
        translate.get('TEST').subscribe(function (res) {
            expect(res).toEqual('This is a test');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLnNlcnZpY2Uuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRyYW5zbGF0ZS5zZXJ2aWNlLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLHFCQUFnRSxlQUFlLENBQUMsQ0FBQTtBQUNoRix3QkFBMEMsdUJBQXVCLENBQUMsQ0FBQTtBQUNsRSw4QkFPTyxvQkFBb0IsQ0FBQyxDQUFBO0FBQzVCLDJCQUF5QixpQkFBaUIsQ0FBQyxDQUFBO0FBQzNDLHdCQUFrQyx1QkFBdUIsQ0FBQyxDQUFBO0FBRTFELElBQU0sbUJBQW1CLEdBQUcsVUFBQyxVQUEwQixFQUFFLFFBQWdCO0lBQ3JFLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxlQUFRLENBQUMsSUFBSSxzQkFBZSxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hGLENBQUMsQ0FBQztBQUVGLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRTtJQUN6QixJQUFJLFFBQWtCLENBQUM7SUFDdkIsSUFBSSxPQUFvQixDQUFDO0lBQ3pCLElBQUksU0FBMkIsQ0FBQztJQUNoQyxJQUFJLFVBQTBCLENBQUMsQ0FBQyxzRUFBc0U7SUFFdEcsVUFBVSxDQUFDO1FBQ1AsaUJBQU8sQ0FBQyxzQkFBc0IsQ0FBQztZQUMzQixPQUFPLEVBQUUsQ0FBQyxpQkFBVSxFQUFFLCtCQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEQsU0FBUyxFQUFFO2dCQUNQLEVBQUMsT0FBTyxFQUFFLGlCQUFVLEVBQUUsUUFBUSxFQUFFLHFCQUFXLEVBQUM7YUFDL0M7U0FDSixDQUFDLENBQUM7UUFDSCxRQUFRLEdBQUcsb0JBQVUsRUFBRSxDQUFDO1FBQ3hCLE9BQU8sR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGlCQUFVLENBQUMsQ0FBQztRQUNuQyxTQUFTLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0IsQ0FBQyxDQUFDO1FBQzNDLG1G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QUFDLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBQ0wsbUJBQUM7UUFBRCxDQUFDLEFBSkQsSUFJQztRQUNELGlCQUFPLENBQUMsc0JBQXNCLENBQUM7WUFDM0IsT0FBTyxFQUFFLENBQUMsaUJBQVUsRUFBRSwrQkFBZSxDQUFDLE9BQU8sQ0FBQyxFQUFDLE9BQU8sRUFBRSwrQkFBZSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUMsQ0FBQyxDQUFDO1lBQ2xHLFNBQVMsRUFBRTtnQkFDUCxFQUFDLE9BQU8sRUFBRSxpQkFBVSxFQUFFLFFBQVEsRUFBRSxxQkFBVyxFQUFDO2FBQy9DO1NBQ0osQ0FBQyxDQUFDO1FBQ0gsUUFBUSxHQUFHLG9CQUFVLEVBQUUsQ0FBQztRQUN4QixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDOUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLFlBQVksWUFBWSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFckUsMkZBQTJGO1FBQzNGLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFcEIsMERBQTBEO1FBQzFELFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQUMsR0FBVztZQUN4QyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0IHtSZXNwb25zZU9wdGlvbnMsIFJlc3BvbnNlLCBYSFJCYWNrZW5kLCBIdHRwTW9kdWxlfSBmcm9tIFwiQGFuZ3VsYXIvaHR0cFwiO1xyXG5pbXBvcnQge01vY2tCYWNrZW5kLCBNb2NrQ29ubmVjdGlvbn0gZnJvbSBcIkBhbmd1bGFyL2h0dHAvdGVzdGluZ1wiO1xyXG5pbXBvcnQge1xyXG4gICAgVHJhbnNsYXRlU2VydmljZSxcclxuICAgIE1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIsXHJcbiAgICBUcmFuc2xhdGVMb2FkZXIsXHJcbiAgICBUcmFuc2xhdGVTdGF0aWNMb2FkZXIsXHJcbiAgICBMYW5nQ2hhbmdlRXZlbnQsXHJcbiAgICBUcmFuc2xhdGlvbkNoYW5nZUV2ZW50LCBUcmFuc2xhdGVNb2R1bGVcclxufSBmcm9tICcuLy4uL25nMi10cmFuc2xhdGUnO1xyXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gXCJyeGpzL09ic2VydmFibGVcIjtcclxuaW1wb3J0IHtnZXRUZXN0QmVkLCBUZXN0QmVkfSBmcm9tIFwiQGFuZ3VsYXIvY29yZS90ZXN0aW5nXCI7XHJcblxyXG5jb25zdCBtb2NrQmFja2VuZFJlc3BvbnNlID0gKGNvbm5lY3Rpb246IE1vY2tDb25uZWN0aW9uLCByZXNwb25zZTogc3RyaW5nKSA9PiB7XHJcbiAgICBjb25uZWN0aW9uLm1vY2tSZXNwb25kKG5ldyBSZXNwb25zZShuZXcgUmVzcG9uc2VPcHRpb25zKHtib2R5OiByZXNwb25zZX0pKSk7XHJcbn07XHJcblxyXG5kZXNjcmliZSgnVHJhbnNsYXRlU2VydmljZScsICgpID0+IHtcclxuICAgIGxldCBpbmplY3RvcjogSW5qZWN0b3I7XHJcbiAgICBsZXQgYmFja2VuZDogTW9ja0JhY2tlbmQ7XHJcbiAgICBsZXQgdHJhbnNsYXRlOiBUcmFuc2xhdGVTZXJ2aWNlO1xyXG4gICAgbGV0IGNvbm5lY3Rpb246IE1vY2tDb25uZWN0aW9uOyAvLyB0aGlzIHdpbGwgYmUgc2V0IHdoZW4gYSBuZXcgY29ubmVjdGlvbiBpcyBlbWl0dGVkIGZyb20gdGhlIGJhY2tlbmQuXHJcblxyXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XHJcbiAgICAgICAgVGVzdEJlZC5jb25maWd1cmVUZXN0aW5nTW9kdWxlKHtcclxuICAgICAgICAgICAgaW1wb3J0czogW0h0dHBNb2R1bGUsIFRyYW5zbGF0ZU1vZHVsZS5mb3JSb290KCldLFxyXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtcclxuICAgICAgICAgICAgICAgIHtwcm92aWRlOiBYSFJCYWNrZW5kLCB1c2VDbGFzczogTW9ja0JhY2tlbmR9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpbmplY3RvciA9IGdldFRlc3RCZWQoKTtcclxuICAgICAgICBiYWNrZW5kID0gaW5qZWN0b3IuZ2V0KFhIUkJhY2tlbmQpO1xyXG4gICAgICAgIHRyYW5zbGF0ZSA9IGluamVjdG9yLmdldChUcmFuc2xhdGVTZXJ2aWNlKTtcclxuICAgICAgICAvLyBzZXRzIHRoZSBjb25uZWN0aW9uIHdoZW4gc29tZW9uZSB0cmllcyB0byBhY2Nlc3MgdGhlIGJhY2tlbmQgd2l0aCBhbiB4aHIgcmVxdWVzdFxyXG4gICAgICAgIGJhY2tlbmQuY29ubmVjdGlvbnMuc3Vic2NyaWJlKChjOiBNb2NrQ29ubmVjdGlvbikgPT4gY29ubmVjdGlvbiA9IGMpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgYWZ0ZXJFYWNoKCgpID0+IHtcclxuICAgICAgICBpbmplY3RvciA9IHVuZGVmaW5lZDtcclxuICAgICAgICBiYWNrZW5kID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIHRyYW5zbGF0ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICBjb25uZWN0aW9uID0gdW5kZWZpbmVkO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ2lzIGRlZmluZWQnLCAoKSA9PiB7XHJcbiAgICAgICAgZXhwZWN0KFRyYW5zbGF0ZVNlcnZpY2UpLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgZXhwZWN0KHRyYW5zbGF0ZSkudG9CZURlZmluZWQoKTtcclxuICAgICAgICBleHBlY3QodHJhbnNsYXRlIGluc3RhbmNlb2YgVHJhbnNsYXRlU2VydmljZSkudG9CZVRydXRoeSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBiZSBhYmxlIHRvIGdldCB0cmFuc2xhdGlvbnMnLCAoKSA9PiB7XHJcbiAgICAgICAgdHJhbnNsYXRlLnVzZSgnZW4nKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcyB3aWxsIHJlcXVlc3QgdGhlIHRyYW5zbGF0aW9uIGZyb20gdGhlIGJhY2tlbmQgYmVjYXVzZSB3ZSB1c2UgYSBzdGF0aWMgZmlsZXMgbG9hZGVyIGZvciBUcmFuc2xhdGVTZXJ2aWNlXHJcbiAgICAgICAgdHJhbnNsYXRlLmdldCgnVEVTVCcpLnN1YnNjcmliZSgocmVzOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgZXhwZWN0KHJlcykudG9FcXVhbCgnVGhpcyBpcyBhIHRlc3QnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gbW9jayByZXNwb25zZSBhZnRlciB0aGUgeGhyIHJlcXVlc3QsIG90aGVyd2lzZSBpdCB3aWxsIGJlIHVuZGVmaW5lZFxyXG4gICAgICAgIG1vY2tCYWNrZW5kUmVzcG9uc2UoY29ubmVjdGlvbiwgJ3tcIlRFU1RcIjogXCJUaGlzIGlzIGEgdGVzdFwiLCBcIlRFU1QyXCI6IFwiVGhpcyBpcyBhbm90aGVyIHRlc3RcIn0nKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcyB3aWxsIHJlcXVlc3QgdGhlIHRyYW5zbGF0aW9uIGZyb20gZG93bmxvYWRlZCB0cmFuc2xhdGlvbnMgd2l0aG91dCBtYWtpbmcgYSByZXF1ZXN0IHRvIHRoZSBiYWNrZW5kXHJcbiAgICAgICAgdHJhbnNsYXRlLmdldCgnVEVTVDInKS5zdWJzY3JpYmUoKHJlczogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGV4cGVjdChyZXMpLnRvRXF1YWwoJ1RoaXMgaXMgYW5vdGhlciB0ZXN0Jyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIGJlIGFibGUgdG8gZ2V0IGFuIGFycmF5IHRyYW5zbGF0aW9ucycsICgpID0+IHtcclxuICAgICAgICB2YXIgdHJhbnNsYXRpb25zID0ge1wiVEVTVFwiOiBcIlRoaXMgaXMgYSB0ZXN0XCIsIFwiVEVTVDJcIjogXCJUaGlzIGlzIGFub3RoZXIgdGVzdDJcIn07XHJcbiAgICAgICAgdHJhbnNsYXRlLnVzZSgnZW4nKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcyB3aWxsIHJlcXVlc3QgdGhlIHRyYW5zbGF0aW9uIGZyb20gdGhlIGJhY2tlbmQgYmVjYXVzZSB3ZSB1c2UgYSBzdGF0aWMgZmlsZXMgbG9hZGVyIGZvciBUcmFuc2xhdGVTZXJ2aWNlXHJcbiAgICAgICAgdHJhbnNsYXRlLmdldChbJ1RFU1QnLCAnVEVTVDInXSkuc3Vic2NyaWJlKChyZXM6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBleHBlY3QocmVzKS50b0VxdWFsKHRyYW5zbGF0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIG1vY2sgcmVzcG9uc2UgYWZ0ZXIgdGhlIHhociByZXF1ZXN0LCBvdGhlcndpc2UgaXQgd2lsbCBiZSB1bmRlZmluZWRcclxuICAgICAgICBtb2NrQmFja2VuZFJlc3BvbnNlKGNvbm5lY3Rpb24sIEpTT04uc3RyaW5naWZ5KHRyYW5zbGF0aW9ucykpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoXCJzaG91bGQgZmFsbGJhY2sgdG8gdGhlIGRlZmF1bHQgbGFuZ3VhZ2VcIiwgKCkgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZS51c2UoJ2ZyJyk7XHJcblxyXG4gICAgICAgIHRyYW5zbGF0ZS5zZXREZWZhdWx0TGFuZygnZW4nKTtcclxuICAgICAgICB0cmFuc2xhdGUuc2V0VHJhbnNsYXRpb24oJ2VuJywge1wiVEVTVFwiOiBcIlRoaXMgaXMgYSB0ZXN0XCJ9KTtcclxuXHJcbiAgICAgICAgdHJhbnNsYXRlLmdldCgnVEVTVCcpLnN1YnNjcmliZSgocmVzOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgZXhwZWN0KHJlcykudG9FcXVhbCgnVGhpcyBpcyBhIHRlc3QnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbW9ja0JhY2tlbmRSZXNwb25zZShjb25uZWN0aW9uLCAne30nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KFwic2hvdWxkIHJldHVybiB0aGUga2V5IHdoZW4gaXQgZG9lc24ndCBmaW5kIGEgdHJhbnNsYXRpb25cIiwgKCkgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcblxyXG4gICAgICAgIHRyYW5zbGF0ZS5nZXQoJ1RFU1QnKS5zdWJzY3JpYmUoKHJlczogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGV4cGVjdChyZXMpLnRvRXF1YWwoJ1RFU1QnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbW9ja0JhY2tlbmRSZXNwb25zZShjb25uZWN0aW9uLCAne30nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KFwic2hvdWxkIHJldHVybiB0aGUga2V5IHdoZW4geW91IGhhdmVuJ3QgZGVmaW5lZCBhbnkgdHJhbnNsYXRpb25cIiwgKCkgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZS5nZXQoJ1RFU1QnKS5zdWJzY3JpYmUoKHJlczogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGV4cGVjdChyZXMpLnRvRXF1YWwoJ1RFU1QnKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgYmUgYWJsZSB0byBnZXQgdHJhbnNsYXRpb25zIHdpdGggcGFyYW1zJywgKCkgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcblxyXG4gICAgICAgIHRyYW5zbGF0ZS5nZXQoJ1RFU1QnLCB7cGFyYW06ICd3aXRoIHBhcmFtJ30pLnN1YnNjcmliZSgocmVzOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgZXhwZWN0KHJlcykudG9FcXVhbCgnVGhpcyBpcyBhIHRlc3Qgd2l0aCBwYXJhbScpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBtb2NrQmFja2VuZFJlc3BvbnNlKGNvbm5lY3Rpb24sICd7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3Qge3twYXJhbX19XCJ9Jyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIGJlIGFibGUgdG8gZ2V0IHRyYW5zbGF0aW9ucyB3aXRoIG5lc3RlZCBwYXJhbXMnLCAoKSA9PiB7XHJcbiAgICAgICAgdHJhbnNsYXRlLnVzZSgnZW4nKTtcclxuXHJcbiAgICAgICAgdHJhbnNsYXRlLmdldCgnVEVTVCcsIHtwYXJhbToge3ZhbHVlOiAnd2l0aCBwYXJhbSd9fSkuc3Vic2NyaWJlKChyZXM6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBleHBlY3QocmVzKS50b0VxdWFsKCdUaGlzIGlzIGEgdGVzdCB3aXRoIHBhcmFtJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG1vY2tCYWNrZW5kUmVzcG9uc2UoY29ubmVjdGlvbiwgJ3tcIlRFU1RcIjogXCJUaGlzIGlzIGEgdGVzdCB7e3BhcmFtLnZhbHVlfX1cIn0nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgdGhyb3cgaWYgeW91IGZvcmdldCB0aGUga2V5JywgKCkgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcblxyXG4gICAgICAgIGV4cGVjdCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZS5nZXQodW5kZWZpbmVkKTtcclxuICAgICAgICB9KS50b1Rocm93RXJyb3IoJ1BhcmFtZXRlciBcImtleVwiIHJlcXVpcmVkJyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIGJlIGFibGUgdG8gZ2V0IHRyYW5zbGF0aW9ucyB3aXRoIG5lc3RlZCBrZXlzJywgKCkgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcblxyXG4gICAgICAgIHRyYW5zbGF0ZS5nZXQoJ1RFU1QuVEVTVCcpLnN1YnNjcmliZSgocmVzOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgZXhwZWN0KHJlcykudG9FcXVhbCgnVGhpcyBpcyBhIHRlc3QnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbW9ja0JhY2tlbmRSZXNwb25zZShjb25uZWN0aW9uLCAne1wiVEVTVFwiOiB7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3RcIn0sIFwiVEVTVDJcIjoge1wiVEVTVDJcIjoge1wiVEVTVDJcIjogXCJUaGlzIGlzIGFub3RoZXIgdGVzdFwifX19Jyk7XHJcblxyXG4gICAgICAgIHRyYW5zbGF0ZS5nZXQoJ1RFU1QyLlRFU1QyLlRFU1QyJykuc3Vic2NyaWJlKChyZXM6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBleHBlY3QocmVzKS50b0VxdWFsKCdUaGlzIGlzIGFub3RoZXIgdGVzdCcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoXCJzaG91bGRuJ3Qgb3ZlcnJpZGUgdGhlIHRyYW5zbGF0aW9ucyBpZiB5b3Ugc2V0IHRoZSB0cmFuc2xhdGlvbnMgdHdpY2UgXCIsIChkb25lOiBGdW5jdGlvbikgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbignZW4nLCB7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3RcIn0sIHRydWUpO1xyXG4gICAgICAgIHRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbignZW4nLCB7XCJURVNUMlwiOiBcIlRoaXMgaXMgYSB0ZXN0XCJ9LCB0cnVlKTtcclxuICAgICAgICB0cmFuc2xhdGUudXNlKCdlbicpO1xyXG5cclxuICAgICAgICB0cmFuc2xhdGUuZ2V0KCdURVNUJykuc3Vic2NyaWJlKChyZXM6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBleHBlY3QocmVzKS50b0VxdWFsKCdUaGlzIGlzIGEgdGVzdCcpO1xyXG4gICAgICAgICAgICBleHBlY3QoY29ubmVjdGlvbikubm90LnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KFwic2hvdWxkbid0IGRvIGEgcmVxdWVzdCB0byB0aGUgYmFja2VuZCBpZiB5b3Ugc2V0IHRoZSB0cmFuc2xhdGlvbiB5b3Vyc2VsZlwiLCAoZG9uZTogRnVuY3Rpb24pID0+IHtcclxuICAgICAgICB0cmFuc2xhdGUuc2V0VHJhbnNsYXRpb24oJ2VuJywge1wiVEVTVFwiOiBcIlRoaXMgaXMgYSB0ZXN0XCJ9KTtcclxuICAgICAgICB0cmFuc2xhdGUudXNlKCdlbicpO1xyXG5cclxuICAgICAgICB0cmFuc2xhdGUuZ2V0KCdURVNUJykuc3Vic2NyaWJlKChyZXM6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBleHBlY3QocmVzKS50b0VxdWFsKCdUaGlzIGlzIGEgdGVzdCcpO1xyXG4gICAgICAgICAgICBleHBlY3QoY29ubmVjdGlvbikubm90LnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgYmUgYWJsZSB0byBnZXQgaW5zdGFudCB0cmFuc2xhdGlvbnMnLCAoKSA9PiB7XHJcbiAgICAgICAgdHJhbnNsYXRlLnNldFRyYW5zbGF0aW9uKCdlbicsIHtcIlRFU1RcIjogXCJUaGlzIGlzIGEgdGVzdFwifSk7XHJcbiAgICAgICAgdHJhbnNsYXRlLnVzZSgnZW4nKTtcclxuXHJcbiAgICAgICAgZXhwZWN0KHRyYW5zbGF0ZS5pbnN0YW50KCdURVNUJykpLnRvRXF1YWwoJ1RoaXMgaXMgYSB0ZXN0Jyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIGJlIGFibGUgdG8gZ2V0IGluc3RhbnQgdHJhbnNsYXRpb25zIG9mIGFuIGFycmF5JywgKCkgPT4ge1xyXG4gICAgICAgIHZhciB0cmFuc2xhdGlvbnMgPSB7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3RcIiwgXCJURVNUMlwiOiBcIlRoaXMgaXMgYSB0ZXN0MlwifTtcclxuICAgICAgICB0cmFuc2xhdGUuc2V0VHJhbnNsYXRpb24oJ2VuJywgdHJhbnNsYXRpb25zKTtcclxuICAgICAgICB0cmFuc2xhdGUudXNlKCdlbicpO1xyXG5cclxuICAgICAgICBleHBlY3QodHJhbnNsYXRlLmluc3RhbnQoWydURVNUJywgJ1RFU1QyJ10pKS50b0VxdWFsKHRyYW5zbGF0aW9ucyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHJldHVybiB0aGUga2V5IGlmIGluc3RhbnQgdHJhbnNsYXRpb25zIGFyZSBub3QgYXZhaWxhYmxlJywgKCkgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbignZW4nLCB7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3RcIn0pO1xyXG4gICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcblxyXG4gICAgICAgIGV4cGVjdCh0cmFuc2xhdGUuaW5zdGFudCgnVEVTVDInKSkudG9FcXVhbCgnVEVTVDInKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgdHJpZ2dlciBhbiBldmVudCB3aGVuIHRoZSB0cmFuc2xhdGlvbiB2YWx1ZSBjaGFuZ2VzJywgKCkgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbignZW4nLCB7fSk7XHJcbiAgICAgICAgdHJhbnNsYXRlLm9uVHJhbnNsYXRpb25DaGFuZ2Uuc3Vic2NyaWJlKChldmVudDogVHJhbnNsYXRpb25DaGFuZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBleHBlY3QoZXZlbnQudHJhbnNsYXRpb25zKS50b0JlRGVmaW5lZCgpO1xyXG4gICAgICAgICAgICBleHBlY3QoZXZlbnQudHJhbnNsYXRpb25zW1wiVEVTVFwiXSkudG9FcXVhbChcIlRoaXMgaXMgYSB0ZXN0XCIpO1xyXG4gICAgICAgICAgICBleHBlY3QoZXZlbnQubGFuZykudG9CZSgnZW4nKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0cmFuc2xhdGUuc2V0KFwiVEVTVFwiLCBcIlRoaXMgaXMgYSB0ZXN0XCIsICdlbicpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCB0cmlnZ2VyIGFuIGV2ZW50IHdoZW4gdGhlIGxhbmcgY2hhbmdlcycsICgpID0+IHtcclxuICAgICAgICB2YXIgdHIgPSB7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3RcIn07XHJcbiAgICAgICAgdHJhbnNsYXRlLnNldFRyYW5zbGF0aW9uKCdlbicsIHRyKTtcclxuICAgICAgICB0cmFuc2xhdGUub25MYW5nQ2hhbmdlLnN1YnNjcmliZSgoZXZlbnQ6IExhbmdDaGFuZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBleHBlY3QoZXZlbnQubGFuZykudG9CZSgnZW4nKTtcclxuICAgICAgICAgICAgZXhwZWN0KGV2ZW50LnRyYW5zbGF0aW9ucykudG9FcXVhbCh0cik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdHJhbnNsYXRlLnVzZSgnZW4nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgYmUgYWJsZSB0byByZXNldCBhIGxhbmcnLCAoZG9uZTogRnVuY3Rpb24pID0+IHtcclxuICAgICAgICB0cmFuc2xhdGUudXNlKCdlbicpO1xyXG4gICAgICAgIHNweU9uKGNvbm5lY3Rpb24sICdtb2NrUmVzcG9uZCcpLmFuZC5jYWxsVGhyb3VnaCgpO1xyXG5cclxuICAgICAgICAvLyB0aGlzIHdpbGwgcmVxdWVzdCB0aGUgdHJhbnNsYXRpb24gZnJvbSB0aGUgYmFja2VuZCBiZWNhdXNlIHdlIHVzZSBhIHN0YXRpYyBmaWxlcyBsb2FkZXIgZm9yIFRyYW5zbGF0ZVNlcnZpY2VcclxuICAgICAgICB0cmFuc2xhdGUuZ2V0KCdURVNUJykuc3Vic2NyaWJlKChyZXM6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBleHBlY3QocmVzKS50b0VxdWFsKCdUaGlzIGlzIGEgdGVzdCcpO1xyXG4gICAgICAgICAgICBleHBlY3QoY29ubmVjdGlvbi5tb2NrUmVzcG9uZCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpO1xyXG5cclxuICAgICAgICAgICAgLy8gcmVzZXQgdGhlIGxhbmcgYXMgaWYgaXQgd2FzIG5ldmVyIGluaXRpYXRlZFxyXG4gICAgICAgICAgICB0cmFuc2xhdGUucmVzZXRMYW5nKCdlbicpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHRyYW5zbGF0ZS5pbnN0YW50KCdURVNUJykpLnRvRXF1YWwoJ1RFU1QnKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHVzZSBzZXQgdGltZW91dCBiZWNhdXNlIG5vIHJlcXVlc3QgaXMgcmVhbGx5IG1hZGUgYW5kIHdlIG5lZWQgdG8gdHJpZ2dlciB6b25lIHRvIHJlc29sdmUgdGhlIG9ic2VydmFibGVcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGUuZ2V0KCdURVNUJykuc3Vic2NyaWJlKChyZXMyOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBleHBlY3QocmVzMikudG9FcXVhbCgnVEVTVCcpOyAvLyBiZWNhdXNlIHRoZSBsb2FkZXIgaXMgXCJwcmlzdGluZVwiIGFzIGlmIGl0IHdhcyBuZXZlciBjYWxsZWRcclxuICAgICAgICAgICAgICAgICAgICBleHBlY3QoY29ubmVjdGlvbi5tb2NrUmVzcG9uZCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LCAxMCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIG1vY2sgcmVzcG9uc2UgYWZ0ZXIgdGhlIHhociByZXF1ZXN0LCBvdGhlcndpc2UgaXQgd2lsbCBiZSB1bmRlZmluZWRcclxuICAgICAgICBtb2NrQmFja2VuZFJlc3BvbnNlKGNvbm5lY3Rpb24sICd7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3RcIn0nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgYmUgYWJsZSB0byByZWxvYWQgYSBsYW5nJywgKCkgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMgd2lsbCByZXF1ZXN0IHRoZSB0cmFuc2xhdGlvbiBmcm9tIHRoZSBiYWNrZW5kIGJlY2F1c2Ugd2UgdXNlIGEgc3RhdGljIGZpbGVzIGxvYWRlciBmb3IgVHJhbnNsYXRlU2VydmljZVxyXG4gICAgICAgIHRyYW5zbGF0ZS5nZXQoJ1RFU1QnKS5zdWJzY3JpYmUoKHJlczogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGV4cGVjdChyZXMpLnRvRXF1YWwoJ1RoaXMgaXMgYSB0ZXN0Jyk7XHJcblxyXG4gICAgICAgICAgICAvLyByZXNldCB0aGUgbGFuZyBhcyBpZiBpdCB3YXMgbmV2ZXIgaW5pdGlhdGVkXHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZS5yZWxvYWRMYW5nKCdlbicpLnN1YnNjcmliZSgocmVzMjogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QodHJhbnNsYXRlLmluc3RhbnQoJ1RFU1QnKSkudG9FcXVhbCgnVGhpcyBpcyBhIHRlc3QgMicpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG1vY2tCYWNrZW5kUmVzcG9uc2UoY29ubmVjdGlvbiwgJ3tcIlRFU1RcIjogXCJUaGlzIGlzIGEgdGVzdCAyXCJ9Jyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIG1vY2sgcmVzcG9uc2UgYWZ0ZXIgdGhlIHhociByZXF1ZXN0LCBvdGhlcndpc2UgaXQgd2lsbCBiZSB1bmRlZmluZWRcclxuICAgICAgICBtb2NrQmFja2VuZFJlc3BvbnNlKGNvbm5lY3Rpb24sICd7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3RcIn0nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgYmUgYWJsZSB0byBhZGQgbmV3IGxhbmdzJywgKCkgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZS5hZGRMYW5ncyhbJ3BsJywgJ2VzJ10pO1xyXG4gICAgICAgIGV4cGVjdCh0cmFuc2xhdGUuZ2V0TGFuZ3MoKSkudG9FcXVhbChbJ3BsJywgJ2VzJ10pO1xyXG4gICAgICAgIHRyYW5zbGF0ZS5hZGRMYW5ncyhbJ2ZyJ10pO1xyXG4gICAgICAgIHRyYW5zbGF0ZS5hZGRMYW5ncyhbJ3BsJywgJ2ZyJ10pO1xyXG4gICAgICAgIGV4cGVjdCh0cmFuc2xhdGUuZ2V0TGFuZ3MoKSkudG9FcXVhbChbJ3BsJywgJ2VzJywgJ2ZyJ10pO1xyXG5cclxuICAgICAgICAvLyB0aGlzIHdpbGwgcmVxdWVzdCB0aGUgdHJhbnNsYXRpb24gZnJvbSB0aGUgYmFja2VuZCBiZWNhdXNlIHdlIHVzZSBhIHN0YXRpYyBmaWxlcyBsb2FkZXIgZm9yIFRyYW5zbGF0ZVNlcnZpY2VcclxuICAgICAgICB0cmFuc2xhdGUudXNlKCdlbicpLnN1YnNjcmliZSgocmVzOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgZXhwZWN0KHRyYW5zbGF0ZS5nZXRMYW5ncygpKS50b0VxdWFsKFsncGwnLCAnZXMnLCAnZnInLCAnZW4nXSk7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZS5hZGRMYW5ncyhbJ2RlJ10pO1xyXG4gICAgICAgICAgICBleHBlY3QodHJhbnNsYXRlLmdldExhbmdzKCkpLnRvRXF1YWwoWydwbCcsICdlcycsICdmcicsICdlbicsICdkZSddKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gbW9jayByZXNwb25zZSBhZnRlciB0aGUgeGhyIHJlcXVlc3QsIG90aGVyd2lzZSBpdCB3aWxsIGJlIHVuZGVmaW5lZFxyXG4gICAgICAgIG1vY2tCYWNrZW5kUmVzcG9uc2UoY29ubmVjdGlvbiwgJ3tcIlRFU1RcIjogXCJUaGlzIGlzIGEgdGVzdFwifScpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBiZSBhYmxlIHRvIGdldCB0aGUgYnJvd3NlckxhbmcnLCAoKSA9PiB7XHJcbiAgICAgICAgbGV0IGJyb3dzZXJMYW5nID0gdHJhbnNsYXRlLmdldEJyb3dzZXJMYW5nKCk7XHJcbiAgICAgICAgZXhwZWN0KGJyb3dzZXJMYW5nKS50b0JlRGVmaW5lZCgpO1xyXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgYnJvd3NlckxhbmcgPT09ICdzdHJpbmcnKS50b0JlVHJ1dGh5KCk7XHJcbiAgICB9KTtcclxufSk7XHJcblxyXG5kZXNjcmliZSgnTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlcicsICgpID0+IHtcclxuICAgIGxldCBpbmplY3RvcjogSW5qZWN0b3I7XHJcbiAgICBsZXQgYmFja2VuZDogTW9ja0JhY2tlbmQ7XHJcbiAgICBsZXQgdHJhbnNsYXRlOiBUcmFuc2xhdGVTZXJ2aWNlO1xyXG4gICAgbGV0IGNvbm5lY3Rpb246IE1vY2tDb25uZWN0aW9uOyAvLyB0aGlzIHdpbGwgYmUgc2V0IHdoZW4gYSBuZXcgY29ubmVjdGlvbiBpcyBlbWl0dGVkIGZyb20gdGhlIGJhY2tlbmQuXHJcbiAgICBsZXQgbWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlcjogTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlcjtcclxuXHJcbiAgICBjbGFzcyBNaXNzaW5nIGltcGxlbWVudHMgTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlciB7XHJcbiAgICAgICAgaGFuZGxlKGtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImhhbmRsZWRcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTWlzc2luZ09icyBpbXBsZW1lbnRzIE1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIge1xyXG4gICAgICAgIGhhbmRsZShrZXk6IHN0cmluZyk6IE9ic2VydmFibGU8YW55PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBPYnNlcnZhYmxlLm9mKGBoYW5kbGVkOiAke2tleX1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHByZXBhcmUgPSAoKGhhbmRsZXJDbGFzczogRnVuY3Rpb24pID0+IHtcclxuICAgICAgICBUZXN0QmVkLmNvbmZpZ3VyZVRlc3RpbmdNb2R1bGUoe1xyXG4gICAgICAgICAgICBpbXBvcnRzOiBbSHR0cE1vZHVsZSwgVHJhbnNsYXRlTW9kdWxlLmZvclJvb3QoKV0sXHJcbiAgICAgICAgICAgIHByb3ZpZGVyczogW1xyXG4gICAgICAgICAgICAgICAge3Byb3ZpZGU6IE1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIsIHVzZUNsYXNzOiBoYW5kbGVyQ2xhc3N9LFxyXG4gICAgICAgICAgICAgICAge3Byb3ZpZGU6IFhIUkJhY2tlbmQsIHVzZUNsYXNzOiBNb2NrQmFja2VuZH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGluamVjdG9yID0gZ2V0VGVzdEJlZCgpO1xyXG4gICAgICAgIGJhY2tlbmQgPSBpbmplY3Rvci5nZXQoWEhSQmFja2VuZCk7XHJcbiAgICAgICAgdHJhbnNsYXRlID0gaW5qZWN0b3IuZ2V0KFRyYW5zbGF0ZVNlcnZpY2UpO1xyXG4gICAgICAgIG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIgPSBpbmplY3Rvci5nZXQoTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlcik7XHJcbiAgICAgICAgLy8gc2V0cyB0aGUgY29ubmVjdGlvbiB3aGVuIHNvbWVvbmUgdHJpZXMgdG8gYWNjZXNzIHRoZSBiYWNrZW5kIHdpdGggYW4geGhyIHJlcXVlc3RcclxuICAgICAgICBiYWNrZW5kLmNvbm5lY3Rpb25zLnN1YnNjcmliZSgoYzogTW9ja0Nvbm5lY3Rpb24pID0+IGNvbm5lY3Rpb24gPSBjKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGFmdGVyRWFjaCgoKSA9PiB7XHJcbiAgICAgICAgaW5qZWN0b3IgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgYmFja2VuZCA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0cmFuc2xhdGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29ubmVjdGlvbiA9IHVuZGVmaW5lZDtcclxuICAgICAgICBtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyID0gdW5kZWZpbmVkO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCB1c2UgdGhlIE1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIgd2hlbiB0aGUga2V5IGRvZXMgbm90IGV4aXN0JywgKCkgPT4ge1xyXG4gICAgICAgIHByZXBhcmUoTWlzc2luZyk7XHJcbiAgICAgICAgdHJhbnNsYXRlLnVzZSgnZW4nKTtcclxuICAgICAgICBzcHlPbihtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyLCAnaGFuZGxlJykuYW5kLmNhbGxUaHJvdWdoKCk7XHJcblxyXG4gICAgICAgIHRyYW5zbGF0ZS5nZXQoJ25vbkV4aXN0aW5nS2V5Jykuc3Vic2NyaWJlKChyZXM6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICBleHBlY3QobWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlci5oYW5kbGUpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKCdub25FeGlzdGluZ0tleScpO1xyXG4gICAgICAgICAgICBleHBlY3QocmVzKS50b0VxdWFsKCdoYW5kbGVkJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIG1vY2sgcmVzcG9uc2UgYWZ0ZXIgdGhlIHhociByZXF1ZXN0LCBvdGhlcndpc2UgaXQgd2lsbCBiZSB1bmRlZmluZWRcclxuICAgICAgICBtb2NrQmFja2VuZFJlc3BvbnNlKGNvbm5lY3Rpb24sICd7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3RcIn0nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRoZSBrZXkgd2hlbiB1c2luZyBNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyICYgdGhlIGhhbmRsZXIgcmV0dXJucyBub3RoaW5nJywgKCkgPT4ge1xyXG4gICAgICAgIGNsYXNzIE1pc3NpbmdVbmRlZiBpbXBsZW1lbnRzIE1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIge1xyXG4gICAgICAgICAgICBoYW5kbGUoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJlcGFyZShNaXNzaW5nVW5kZWYpO1xyXG4gICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcbiAgICAgICAgc3B5T24obWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlciwgJ2hhbmRsZScpLmFuZC5jYWxsVGhyb3VnaCgpO1xyXG5cclxuICAgICAgICB0cmFuc2xhdGUuZ2V0KCdub25FeGlzdGluZ0tleScpLnN1YnNjcmliZSgocmVzOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgZXhwZWN0KG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIuaGFuZGxlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCgnbm9uRXhpc3RpbmdLZXknKTtcclxuICAgICAgICAgICAgZXhwZWN0KHJlcykudG9FcXVhbCgnbm9uRXhpc3RpbmdLZXknKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gbW9jayByZXNwb25zZSBhZnRlciB0aGUgeGhyIHJlcXVlc3QsIG90aGVyd2lzZSBpdCB3aWxsIGJlIHVuZGVmaW5lZFxyXG4gICAgICAgIG1vY2tCYWNrZW5kUmVzcG9uc2UoY29ubmVjdGlvbiwgJ3tcIlRFU1RcIjogXCJUaGlzIGlzIGEgdGVzdFwifScpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBub3QgY2FsbCB0aGUgTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlciB3aGVuIHRoZSBrZXkgZXhpc3RzJywgKCkgPT4ge1xyXG4gICAgICAgIHByZXBhcmUoTWlzc2luZyk7XHJcbiAgICAgICAgdHJhbnNsYXRlLnVzZSgnZW4nKTtcclxuICAgICAgICBzcHlPbihtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyLCAnaGFuZGxlJykuYW5kLmNhbGxUaHJvdWdoKCk7XHJcblxyXG4gICAgICAgIHRyYW5zbGF0ZS5nZXQoJ1RFU1QnKS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgICBleHBlY3QobWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlci5oYW5kbGUpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIG1vY2sgcmVzcG9uc2UgYWZ0ZXIgdGhlIHhociByZXF1ZXN0LCBvdGhlcndpc2UgaXQgd2lsbCBiZSB1bmRlZmluZWRcclxuICAgICAgICBtb2NrQmFja2VuZFJlc3BvbnNlKGNvbm5lY3Rpb24sICd7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3RcIn0nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgdXNlIHRoZSBNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyIHdoZW4gdGhlIGtleSBkb2VzIG5vdCBleGlzdCAmIHdlIHVzZSBpbnN0YW50IHRyYW5zbGF0aW9uJywgKCkgPT4ge1xyXG4gICAgICAgIHByZXBhcmUoTWlzc2luZyk7XHJcbiAgICAgICAgdHJhbnNsYXRlLnVzZSgnZW4nKTtcclxuICAgICAgICBzcHlPbihtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyLCAnaGFuZGxlJykuYW5kLmNhbGxUaHJvdWdoKCk7XHJcblxyXG4gICAgICAgIGV4cGVjdCh0cmFuc2xhdGUuaW5zdGFudCgnbm9uRXhpc3RpbmdLZXknKSkudG9FcXVhbCgnaGFuZGxlZCcpO1xyXG4gICAgICAgIGV4cGVjdChtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyLmhhbmRsZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoJ25vbkV4aXN0aW5nS2V5Jyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHdhaXQgZm9yIHRoZSBNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyIHdoZW4gaXQgcmV0dXJucyBhbiBvYnNlcnZhYmxlICYgd2UgdXNlIGdldCcsICgpID0+IHtcclxuICAgICAgICBwcmVwYXJlKE1pc3NpbmdPYnMpO1xyXG4gICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcbiAgICAgICAgc3B5T24obWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlciwgJ2hhbmRsZScpLmFuZC5jYWxsVGhyb3VnaCgpO1xyXG5cclxuICAgICAgICB0cmFuc2xhdGUuZ2V0KCdub25FeGlzdGluZ0tleScpLnN1YnNjcmliZSgocmVzOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgZXhwZWN0KG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIuaGFuZGxlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCgnbm9uRXhpc3RpbmdLZXknKTtcclxuICAgICAgICAgICAgZXhwZWN0KHJlcykudG9FcXVhbCgnaGFuZGxlZDogbm9uRXhpc3RpbmdLZXknKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gbW9jayByZXNwb25zZSBhZnRlciB0aGUgeGhyIHJlcXVlc3QsIG90aGVyd2lzZSBpdCB3aWxsIGJlIHVuZGVmaW5lZFxyXG4gICAgICAgIG1vY2tCYWNrZW5kUmVzcG9uc2UoY29ubmVjdGlvbiwgJ3tcIlRFU1RcIjogXCJUaGlzIGlzIGEgdGVzdFwifScpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCB3YWl0IGZvciB0aGUgTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlciB3aGVuIGl0IHJldHVybnMgYW4gb2JzZXJ2YWJsZSAmIHdlIHVzZSBnZXQgd2l0aCBhbiBhcnJheScsICgpID0+IHtcclxuICAgICAgICBsZXQgdHJhbnNsYXRpb25zID0ge1xyXG4gICAgICAgICAgICBub25FeGlzdGluZ0tleTE6ICdoYW5kbGVkOiBub25FeGlzdGluZ0tleTEnLFxyXG4gICAgICAgICAgICBub25FeGlzdGluZ0tleTI6ICdoYW5kbGVkOiBub25FeGlzdGluZ0tleTInLFxyXG4gICAgICAgICAgICBub25FeGlzdGluZ0tleTM6ICdoYW5kbGVkOiBub25FeGlzdGluZ0tleTMnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHJlcGFyZShNaXNzaW5nT2JzKTtcclxuICAgICAgICB0cmFuc2xhdGUudXNlKCdlbicpO1xyXG4gICAgICAgIHNweU9uKG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIsICdoYW5kbGUnKS5hbmQuY2FsbFRocm91Z2goKTtcclxuXHJcbiAgICAgICAgdHJhbnNsYXRlLmdldChPYmplY3Qua2V5cyh0cmFuc2xhdGlvbnMpKS5zdWJzY3JpYmUoKHJlczogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGV4cGVjdChtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyLmhhbmRsZSkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDMpO1xyXG4gICAgICAgICAgICBleHBlY3QocmVzKS50b0VxdWFsKHRyYW5zbGF0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIG1vY2sgcmVzcG9uc2UgYWZ0ZXIgdGhlIHhociByZXF1ZXN0LCBvdGhlcndpc2UgaXQgd2lsbCBiZSB1bmRlZmluZWRcclxuICAgICAgICBtb2NrQmFja2VuZFJlc3BvbnNlKGNvbm5lY3Rpb24sICd7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3RcIn0nKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgbm90IHdhaXQgZm9yIHRoZSBNaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyIHdoZW4gaXQgcmV0dXJucyBhbiBvYnNlcnZhYmxlICYgd2UgdXNlIGluc3RhbnQnLCAoKSA9PiB7XHJcbiAgICAgICAgcHJlcGFyZShNaXNzaW5nT2JzKTtcclxuICAgICAgICB0cmFuc2xhdGUudXNlKCdlbicpO1xyXG4gICAgICAgIHNweU9uKG1pc3NpbmdUcmFuc2xhdGlvbkhhbmRsZXIsICdoYW5kbGUnKS5hbmQuY2FsbFRocm91Z2goKTtcclxuXHJcbiAgICAgICAgZXhwZWN0KHRyYW5zbGF0ZS5pbnN0YW50KCdub25FeGlzdGluZ0tleScpKS50b0VxdWFsKCdub25FeGlzdGluZ0tleScpO1xyXG5cclxuICAgICAgICAvLyBtb2NrIHJlc3BvbnNlIGFmdGVyIHRoZSB4aHIgcmVxdWVzdCwgb3RoZXJ3aXNlIGl0IHdpbGwgYmUgdW5kZWZpbmVkXHJcbiAgICAgICAgbW9ja0JhY2tlbmRSZXNwb25zZShjb25uZWN0aW9uLCAne1wiVEVTVFwiOiBcIlRoaXMgaXMgYSB0ZXN0XCJ9Jyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIG5vdCB3YWl0IGZvciB0aGUgTWlzc2luZ1RyYW5zbGF0aW9uSGFuZGxlciB3aGVuIGl0IHJldHVybnMgYW4gb2JzZXJ2YWJsZSAmIHdlIHVzZSBpbnN0YW50IHdpdGggYW4gYXJyYXknLCAoKSA9PiB7XHJcbiAgICAgICAgbGV0IHRyYW5zbGF0aW9ucyA9IHtcclxuICAgICAgICAgICAgbm9uRXhpc3RpbmdLZXkxOiAnaGFuZGxlZDogbm9uRXhpc3RpbmdLZXkxJyxcclxuICAgICAgICAgICAgbm9uRXhpc3RpbmdLZXkyOiAnaGFuZGxlZDogbm9uRXhpc3RpbmdLZXkyJyxcclxuICAgICAgICAgICAgbm9uRXhpc3RpbmdLZXkzOiAnaGFuZGxlZDogbm9uRXhpc3RpbmdLZXkzJ1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHByZXBhcmUoTWlzc2luZ09icyk7XHJcbiAgICAgICAgdHJhbnNsYXRlLnVzZSgnZW4nKTtcclxuICAgICAgICBzcHlPbihtaXNzaW5nVHJhbnNsYXRpb25IYW5kbGVyLCAnaGFuZGxlJykuYW5kLmNhbGxUaHJvdWdoKCk7XHJcblxyXG4gICAgICAgIGV4cGVjdCh0cmFuc2xhdGUuaW5zdGFudChPYmplY3Qua2V5cyh0cmFuc2xhdGlvbnMpKSkudG9FcXVhbCh7XHJcbiAgICAgICAgICAgIG5vbkV4aXN0aW5nS2V5MTogJ25vbkV4aXN0aW5nS2V5MScsXHJcbiAgICAgICAgICAgIG5vbkV4aXN0aW5nS2V5MjogJ25vbkV4aXN0aW5nS2V5MicsXHJcbiAgICAgICAgICAgIG5vbkV4aXN0aW5nS2V5MzogJ25vbkV4aXN0aW5nS2V5MydcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gbW9jayByZXNwb25zZSBhZnRlciB0aGUgeGhyIHJlcXVlc3QsIG90aGVyd2lzZSBpdCB3aWxsIGJlIHVuZGVmaW5lZFxyXG4gICAgICAgIG1vY2tCYWNrZW5kUmVzcG9uc2UoY29ubmVjdGlvbiwgJ3tcIlRFU1RcIjogXCJUaGlzIGlzIGEgdGVzdFwifScpO1xyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuZGVzY3JpYmUoJ1RyYW5zbGF0ZUxvYWRlcicsICgpID0+IHtcclxuICAgIGxldCBpbmplY3RvcjogSW5qZWN0b3I7XHJcbiAgICBsZXQgYmFja2VuZDogTW9ja0JhY2tlbmQ7XHJcbiAgICBsZXQgdHJhbnNsYXRlOiBUcmFuc2xhdGVTZXJ2aWNlO1xyXG4gICAgbGV0IGNvbm5lY3Rpb246IE1vY2tDb25uZWN0aW9uOyAvLyB0aGlzIHdpbGwgYmUgc2V0IHdoZW4gYSBuZXcgY29ubmVjdGlvbiBpcyBlbWl0dGVkIGZyb20gdGhlIGJhY2tlbmQuXHJcblxyXG4gICAgdmFyIHByZXBhcmUgPSAoX2luamVjdG9yOiBJbmplY3RvcikgPT4ge1xyXG4gICAgICAgIGJhY2tlbmQgPSBfaW5qZWN0b3IuZ2V0KFhIUkJhY2tlbmQpO1xyXG4gICAgICAgIHRyYW5zbGF0ZSA9IF9pbmplY3Rvci5nZXQoVHJhbnNsYXRlU2VydmljZSk7XHJcbiAgICAgICAgLy8gc2V0cyB0aGUgY29ubmVjdGlvbiB3aGVuIHNvbWVvbmUgdHJpZXMgdG8gYWNjZXNzIHRoZSBiYWNrZW5kIHdpdGggYW4geGhyIHJlcXVlc3RcclxuICAgICAgICBiYWNrZW5kLmNvbm5lY3Rpb25zLnN1YnNjcmliZSgoYzogTW9ja0Nvbm5lY3Rpb24pID0+IGNvbm5lY3Rpb24gPSBjKTtcclxuICAgIH07XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBiZSBhYmxlIHRvIHByb3ZpZGUgVHJhbnNsYXRlU3RhdGljTG9hZGVyJywgKCkgPT4ge1xyXG4gICAgICAgIFRlc3RCZWQuY29uZmlndXJlVGVzdGluZ01vZHVsZSh7XHJcbiAgICAgICAgICAgIGltcG9ydHM6IFtIdHRwTW9kdWxlLCBUcmFuc2xhdGVNb2R1bGUuZm9yUm9vdCgpXSxcclxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbXHJcbiAgICAgICAgICAgICAgICB7cHJvdmlkZTogWEhSQmFja2VuZCwgdXNlQ2xhc3M6IE1vY2tCYWNrZW5kfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaW5qZWN0b3IgPSBnZXRUZXN0QmVkKCk7XHJcbiAgICAgICAgcHJlcGFyZShpbmplY3Rvcik7XHJcblxyXG4gICAgICAgIGV4cGVjdCh0cmFuc2xhdGUpLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgZXhwZWN0KHRyYW5zbGF0ZS5jdXJyZW50TG9hZGVyKS50b0JlRGVmaW5lZCgpO1xyXG4gICAgICAgIGV4cGVjdCh0cmFuc2xhdGUuY3VycmVudExvYWRlciBpbnN0YW5jZW9mIFRyYW5zbGF0ZVN0YXRpY0xvYWRlcikudG9CZVRydXRoeSgpO1xyXG5cclxuICAgICAgICAvLyB0aGUgbGFuZyB0byB1c2UsIGlmIHRoZSBsYW5nIGlzbid0IGF2YWlsYWJsZSwgaXQgd2lsbCB1c2UgdGhlIGN1cnJlbnQgbG9hZGVyIHRvIGdldCB0aGVtXHJcbiAgICAgICAgdHJhbnNsYXRlLnVzZSgnZW4nKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcyB3aWxsIHJlcXVlc3QgdGhlIHRyYW5zbGF0aW9uIGZyb20gdGhlIGJhY2tlbmQgYmVjYXVzZSB3ZSB1c2UgYSBzdGF0aWMgZmlsZXMgbG9hZGVyIGZvciBUcmFuc2xhdGVTZXJ2aWNlXHJcbiAgICAgICAgdHJhbnNsYXRlLmdldCgnVEVTVCcpLnN1YnNjcmliZSgocmVzOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgZXhwZWN0KHJlcykudG9FcXVhbCgnVGhpcyBpcyBhIHRlc3QnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gbW9jayByZXNwb25zZSBhZnRlciB0aGUgeGhyIHJlcXVlc3QsIG90aGVyd2lzZSBpdCB3aWxsIGJlIHVuZGVmaW5lZFxyXG4gICAgICAgIG1vY2tCYWNrZW5kUmVzcG9uc2UoY29ubmVjdGlvbiwgJ3tcIlRFU1RcIjogXCJUaGlzIGlzIGEgdGVzdFwifScpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBiZSBhYmxlIHRvIHByb3ZpZGUgYW55IFRyYW5zbGF0ZUxvYWRlcicsICgpID0+IHtcclxuICAgICAgICBjbGFzcyBDdXN0b21Mb2FkZXIgaW1wbGVtZW50cyBUcmFuc2xhdGVMb2FkZXIge1xyXG4gICAgICAgICAgICBnZXRUcmFuc2xhdGlvbihsYW5nOiBzdHJpbmcpOiBPYnNlcnZhYmxlPGFueT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9ic2VydmFibGUub2Yoe1wiVEVTVFwiOiBcIlRoaXMgaXMgYSB0ZXN0XCJ9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBUZXN0QmVkLmNvbmZpZ3VyZVRlc3RpbmdNb2R1bGUoe1xyXG4gICAgICAgICAgICBpbXBvcnRzOiBbSHR0cE1vZHVsZSwgVHJhbnNsYXRlTW9kdWxlLmZvclJvb3Qoe3Byb3ZpZGU6IFRyYW5zbGF0ZUxvYWRlciwgdXNlQ2xhc3M6IEN1c3RvbUxvYWRlcn0pXSxcclxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbXHJcbiAgICAgICAgICAgICAgICB7cHJvdmlkZTogWEhSQmFja2VuZCwgdXNlQ2xhc3M6IE1vY2tCYWNrZW5kfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaW5qZWN0b3IgPSBnZXRUZXN0QmVkKCk7XHJcbiAgICAgICAgcHJlcGFyZShpbmplY3Rvcik7XHJcblxyXG4gICAgICAgIGV4cGVjdCh0cmFuc2xhdGUpLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgZXhwZWN0KHRyYW5zbGF0ZS5jdXJyZW50TG9hZGVyKS50b0JlRGVmaW5lZCgpO1xyXG4gICAgICAgIGV4cGVjdCh0cmFuc2xhdGUuY3VycmVudExvYWRlciBpbnN0YW5jZW9mIEN1c3RvbUxvYWRlcikudG9CZVRydXRoeSgpO1xyXG5cclxuICAgICAgICAvLyB0aGUgbGFuZyB0byB1c2UsIGlmIHRoZSBsYW5nIGlzbid0IGF2YWlsYWJsZSwgaXQgd2lsbCB1c2UgdGhlIGN1cnJlbnQgbG9hZGVyIHRvIGdldCB0aGVtXHJcbiAgICAgICAgdHJhbnNsYXRlLnVzZSgnZW4nKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcyB3aWxsIHJlcXVlc3QgdGhlIHRyYW5zbGF0aW9uIGZyb20gdGhlIEN1c3RvbUxvYWRlclxyXG4gICAgICAgIHRyYW5zbGF0ZS5nZXQoJ1RFU1QnKS5zdWJzY3JpYmUoKHJlczogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGV4cGVjdChyZXMpLnRvRXF1YWwoJ1RoaXMgaXMgYSB0ZXN0Jyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG4iXX0=