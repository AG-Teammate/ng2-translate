"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var translate_pipe_1 = require('../src/translate.pipe');
var ng2_translate_1 = require("./../ng2-translate");
var http_1 = require("@angular/http");
var core_1 = require("@angular/core");
var testing_1 = require("@angular/core/testing");
var testing_2 = require("@angular/http/testing");
var FakeChangeDetectorRef = (function (_super) {
    __extends(FakeChangeDetectorRef, _super);
    function FakeChangeDetectorRef() {
        _super.apply(this, arguments);
    }
    FakeChangeDetectorRef.prototype.markForCheck = function () { };
    FakeChangeDetectorRef.prototype.detach = function () { };
    FakeChangeDetectorRef.prototype.detectChanges = function () { };
    FakeChangeDetectorRef.prototype.checkNoChanges = function () { };
    FakeChangeDetectorRef.prototype.reattach = function () { };
    return FakeChangeDetectorRef;
}(core_1.ChangeDetectorRef));
var mockBackendResponse = function (connection, response) {
    connection.mockRespond(new http_1.Response(new http_1.ResponseOptions({ body: response })));
};
describe('TranslatePipe', function () {
    var injector;
    var backend;
    var translate;
    var connection; // this will be set when a new connection is emitted from the backend.
    var translatePipe;
    var ref;
    beforeEach(function () {
        testing_1.TestBed.configureTestingModule({
            imports: [http_1.HttpModule, ng2_translate_1.TranslateModule.forRoot()],
            providers: [
                { provide: http_1.XHRBackend, useClass: testing_2.MockBackend }
            ]
        });
        injector = testing_1.getTestBed();
        backend = injector.get(http_1.XHRBackend);
        translate = injector.get(ng2_translate_1.TranslateService);
        // sets the connection when someone tries to access the backend with an xhr request
        backend.connections.subscribe(function (c) { return connection = c; });
        ref = new FakeChangeDetectorRef();
        translatePipe = new translate_pipe_1.TranslatePipe(translate, ref);
    });
    afterEach(function () {
        injector = undefined;
        backend = undefined;
        translate = undefined;
        connection = undefined;
        translatePipe = undefined;
        ref = undefined;
    });
    it('is defined', function () {
        expect(translate_pipe_1.TranslatePipe).toBeDefined();
        expect(translatePipe).toBeDefined();
        expect(translatePipe instanceof translate_pipe_1.TranslatePipe).toBeTruthy();
    });
    it('should translate a string', function () {
        translate.setTranslation('en', { "TEST": "This is a test" });
        translate.use('en');
        expect(translatePipe.transform('TEST')).toEqual("This is a test");
    });
    it('should call markForChanges when it translates a string', function () {
        translate.setTranslation('en', { "TEST": "This is a test" });
        translate.use('en');
        spyOn(ref, 'markForCheck').and.callThrough();
        translatePipe.transform('TEST');
        expect(ref.markForCheck).toHaveBeenCalled();
    });
    it('should translate a string with object parameters', function () {
        translate.setTranslation('en', { "TEST": "This is a test {{param}}" });
        translate.use('en');
        expect(translatePipe.transform('TEST', { param: "with param" })).toEqual("This is a test with param");
    });
    it('should translate a string with object as string parameters', function () {
        translate.setTranslation('en', { "TEST": "This is a test {{param}}" });
        translate.use('en');
        expect(translatePipe.transform('TEST', '{param: "with param"}')).toEqual("This is a test with param");
        expect(translatePipe.transform('TEST', '{"param": "with param"}')).toEqual("This is a test with param");
    });
    it('should update the value when the parameters change', function () {
        translate.setTranslation('en', { "TEST": "This is a test {{param}}" });
        translate.use('en');
        spyOn(translatePipe, 'updateValue').and.callThrough();
        spyOn(ref, 'markForCheck').and.callThrough();
        expect(translatePipe.transform('TEST', { param: "with param" })).toEqual("This is a test with param");
        // same value, shouldn't call 'updateValue' again
        expect(translatePipe.transform('TEST', { param: "with param" })).toEqual("This is a test with param");
        // different param, should call 'updateValue'
        expect(translatePipe.transform('TEST', { param: "with param2" })).toEqual("This is a test with param2");
        expect(translatePipe.updateValue).toHaveBeenCalledTimes(2);
        expect(ref.markForCheck).toHaveBeenCalledTimes(2);
    });
    it("should throw if you don't give an object parameter", function () {
        translate.setTranslation('en', { "TEST": "This is a test {{param}}" });
        translate.use('en');
        var param = 'param: "with param"';
        expect(function () {
            translatePipe.transform('TEST', param);
        }).toThrowError("Wrong parameter in TranslatePipe. Expected a valid Object, received: " + param);
    });
    describe('should update translations on translation by key change', function () {
        it('with static loader', function (done) {
            translate.setTranslation('en', { "TEST": "This is a test" });
            translate.use('en');
            expect(translatePipe.transform('TEST')).toEqual("This is a test");
            // this will be resolved at the next key's translation change
            var subscription = translate.onTranslationChange.subscribe(function (res) {
                expect(res.translations['TEST']).toBeDefined();
                expect(res.translations['TEST']).toEqual("This is new test value");
                expect(translatePipe.transform('TEST')).toEqual("This is new test value");
                subscription.unsubscribe();
                done();
            });
            translate.set('TEST', 'This is new test value', 'en');
        });
    });
    describe('should update translations on lang change', function () {
        it('with static loader', function (done) {
            translate.setTranslation('en', { "TEST": "This is a test" });
            translate.setTranslation('fr', { "TEST": "C'est un test" });
            translate.use('en');
            expect(translatePipe.transform('TEST')).toEqual("This is a test");
            // this will be resolved at the next lang change
            var subscription = translate.onLangChange.subscribe(function (res) {
                expect(res.lang).toEqual('fr');
                expect(translatePipe.transform('TEST')).toEqual("C'est un test");
                subscription.unsubscribe();
                done();
            });
            translate.use('fr');
        });
        it('with file loader', function (done) {
            translate.use('en');
            mockBackendResponse(connection, '{"TEST": "This is a test"}');
            expect(translatePipe.transform('TEST')).toEqual("This is a test");
            // this will be resolved at the next lang change
            var subscription = translate.onLangChange.subscribe(function (res) {
                // let it update the translations
                setTimeout(function () {
                    expect(res.lang).toEqual('fr');
                    expect(translatePipe.transform('TEST')).toEqual("C'est un test");
                    subscription.unsubscribe();
                    done();
                });
            });
            translate.use('fr');
            mockBackendResponse(connection, "{\"TEST\": \"C'est un test\"}");
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRlLnBpcGUuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRyYW5zbGF0ZS5waXBlLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsK0JBQTRCLHVCQUF1QixDQUFDLENBQUE7QUFDcEQsOEJBQWdELG9CQUFvQixDQUFDLENBQUE7QUFDckUscUJBQWdFLGVBQWUsQ0FBQyxDQUFBO0FBQ2hGLHFCQUEwQyxlQUFlLENBQUMsQ0FBQTtBQUUxRCx3QkFBa0MsdUJBQXVCLENBQUMsQ0FBQTtBQUMxRCx3QkFBMEMsdUJBQXVCLENBQUMsQ0FBQTtBQUVsRTtJQUFvQyx5Q0FBaUI7SUFBckQ7UUFBb0MsOEJBQWlCO0lBVXJELENBQUM7SUFURyw0Q0FBWSxHQUFaLGNBQXNCLENBQUM7SUFFdkIsc0NBQU0sR0FBTixjQUFnQixDQUFDO0lBRWpCLDZDQUFhLEdBQWIsY0FBdUIsQ0FBQztJQUV4Qiw4Q0FBYyxHQUFkLGNBQXdCLENBQUM7SUFFekIsd0NBQVEsR0FBUixjQUFrQixDQUFDO0lBQ3ZCLDRCQUFDO0FBQUQsQ0FBQyxBQVZELENBQW9DLHdCQUFpQixHQVVwRDtBQUVELElBQU0sbUJBQW1CLEdBQUcsVUFBQyxVQUEwQixFQUFFLFFBQWdCO0lBQ3JFLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxlQUFRLENBQUMsSUFBSSxzQkFBZSxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hGLENBQUMsQ0FBQztBQUVGLFFBQVEsQ0FBQyxlQUFlLEVBQUU7SUFDdEIsSUFBSSxRQUFrQixDQUFDO0lBQ3ZCLElBQUksT0FBb0IsQ0FBQztJQUN6QixJQUFJLFNBQTJCLENBQUM7SUFDaEMsSUFBSSxVQUEwQixDQUFDLENBQUMsc0VBQXNFO0lBQ3RHLElBQUksYUFBNEIsQ0FBQztJQUNqQyxJQUFJLEdBQVEsQ0FBQztJQUViLFVBQVUsQ0FBQztRQUNQLGlCQUFPLENBQUMsc0JB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IGZyb20gJy4uL3NyYy90cmFuc2xhdGUucGlwZSc7XHJcbmltcG9ydCB7VHJhbnNsYXRlU2VydmljZSwgVHJhbnNsYXRlTW9kdWxlfSBmcm9tIFwiLi8uLi9uZzItdHJhbnNsYXRlXCI7XHJcbmltcG9ydCB7UmVzcG9uc2VPcHRpb25zLCBSZXNwb25zZSwgWEhSQmFja2VuZCwgSHR0cE1vZHVsZX0gZnJvbSBcIkBhbmd1bGFyL2h0dHBcIjtcclxuaW1wb3J0IHtJbmplY3RvciwgQ2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7TGFuZ0NoYW5nZUV2ZW50LCBUcmFuc2xhdGlvbkNoYW5nZUV2ZW50fSBmcm9tIFwiLi4vc3JjL3RyYW5zbGF0ZS5zZXJ2aWNlXCI7XHJcbmltcG9ydCB7Z2V0VGVzdEJlZCwgVGVzdEJlZH0gZnJvbSBcIkBhbmd1bGFyL2NvcmUvdGVzdGluZ1wiO1xyXG5pbXBvcnQge01vY2tDb25uZWN0aW9uLCBNb2NrQmFja2VuZH0gZnJvbSBcIkBhbmd1bGFyL2h0dHAvdGVzdGluZ1wiO1xyXG5cclxuY2xhc3MgRmFrZUNoYW5nZURldGVjdG9yUmVmIGV4dGVuZHMgQ2hhbmdlRGV0ZWN0b3JSZWYge1xyXG4gICAgbWFya0ZvckNoZWNrKCk6IHZvaWQge31cclxuXHJcbiAgICBkZXRhY2goKTogdm9pZCB7fVxyXG5cclxuICAgIGRldGVjdENoYW5nZXMoKTogdm9pZCB7fVxyXG5cclxuICAgIGNoZWNrTm9DaGFuZ2VzKCk6IHZvaWQge31cclxuXHJcbiAgICByZWF0dGFjaCgpOiB2b2lkIHt9XHJcbn1cclxuXHJcbmNvbnN0IG1vY2tCYWNrZW5kUmVzcG9uc2UgPSAoY29ubmVjdGlvbjogTW9ja0Nvbm5lY3Rpb24sIHJlc3BvbnNlOiBzdHJpbmcpID0+IHtcclxuICAgIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQobmV3IFJlc3BvbnNlKG5ldyBSZXNwb25zZU9wdGlvbnMoe2JvZHk6IHJlc3BvbnNlfSkpKTtcclxufTtcclxuXHJcbmRlc2NyaWJlKCdUcmFuc2xhdGVQaXBlJywgKCkgPT4ge1xyXG4gICAgbGV0IGluamVjdG9yOiBJbmplY3RvcjtcclxuICAgIGxldCBiYWNrZW5kOiBNb2NrQmFja2VuZDtcclxuICAgIGxldCB0cmFuc2xhdGU6IFRyYW5zbGF0ZVNlcnZpY2U7XHJcbiAgICBsZXQgY29ubmVjdGlvbjogTW9ja0Nvbm5lY3Rpb247IC8vIHRoaXMgd2lsbCBiZSBzZXQgd2hlbiBhIG5ldyBjb25uZWN0aW9uIGlzIGVtaXR0ZWQgZnJvbSB0aGUgYmFja2VuZC5cclxuICAgIGxldCB0cmFuc2xhdGVQaXBlOiBUcmFuc2xhdGVQaXBlO1xyXG4gICAgbGV0IHJlZjogYW55O1xyXG5cclxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xyXG4gICAgICAgIFRlc3RCZWQuY29uZmlndXJlVGVzdGluZ01vZHVsZSh7XHJcbiAgICAgICAgICAgIGltcG9ydHM6IFtIdHRwTW9kdWxlLCBUcmFuc2xhdGVNb2R1bGUuZm9yUm9vdCgpXSxcclxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbXHJcbiAgICAgICAgICAgICAgICB7cHJvdmlkZTogWEhSQmFja2VuZCwgdXNlQ2xhc3M6IE1vY2tCYWNrZW5kfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaW5qZWN0b3IgPSBnZXRUZXN0QmVkKCk7XHJcbiAgICAgICAgYmFja2VuZCA9IGluamVjdG9yLmdldChYSFJCYWNrZW5kKTtcclxuICAgICAgICB0cmFuc2xhdGUgPSBpbmplY3Rvci5nZXQoVHJhbnNsYXRlU2VydmljZSk7XHJcbiAgICAgICAgLy8gc2V0cyB0aGUgY29ubmVjdGlvbiB3aGVuIHNvbWVvbmUgdHJpZXMgdG8gYWNjZXNzIHRoZSBiYWNrZW5kIHdpdGggYW4geGhyIHJlcXVlc3RcclxuICAgICAgICBiYWNrZW5kLmNvbm5lY3Rpb25zLnN1YnNjcmliZSgoYzogTW9ja0Nvbm5lY3Rpb24pID0+IGNvbm5lY3Rpb24gPSBjKTtcclxuXHJcbiAgICAgICAgcmVmID0gbmV3IEZha2VDaGFuZ2VEZXRlY3RvclJlZigpO1xyXG4gICAgICAgIHRyYW5zbGF0ZVBpcGUgPSBuZXcgVHJhbnNsYXRlUGlwZSh0cmFuc2xhdGUsIHJlZik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBhZnRlckVhY2goKCkgPT4ge1xyXG4gICAgICAgIGluamVjdG9yID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGJhY2tlbmQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdHJhbnNsYXRlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGNvbm5lY3Rpb24gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdHJhbnNsYXRlUGlwZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICByZWYgPSB1bmRlZmluZWQ7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnaXMgZGVmaW5lZCcsICgpID0+IHtcclxuICAgICAgICBleHBlY3QoVHJhbnNsYXRlUGlwZSkudG9CZURlZmluZWQoKTtcclxuICAgICAgICBleHBlY3QodHJhbnNsYXRlUGlwZSkudG9CZURlZmluZWQoKTtcclxuICAgICAgICBleHBlY3QodHJhbnNsYXRlUGlwZSBpbnN0YW5jZW9mIFRyYW5zbGF0ZVBpcGUpLnRvQmVUcnV0aHkoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgdHJhbnNsYXRlIGEgc3RyaW5nJywgKCkgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbignZW4nLCB7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3RcIn0pO1xyXG4gICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcblxyXG4gICAgICAgIGV4cGVjdCh0cmFuc2xhdGVQaXBlLnRyYW5zZm9ybSgnVEVTVCcpKS50b0VxdWFsKFwiVGhpcyBpcyBhIHRlc3RcIik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIGNhbGwgbWFya0ZvckNoYW5nZXMgd2hlbiBpdCB0cmFuc2xhdGVzIGEgc3RyaW5nJywgKCkgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbignZW4nLCB7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3RcIn0pO1xyXG4gICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcbiAgICAgICAgc3B5T24ocmVmLCAnbWFya0ZvckNoZWNrJykuYW5kLmNhbGxUaHJvdWdoKCk7XHJcblxyXG4gICAgICAgIHRyYW5zbGF0ZVBpcGUudHJhbnNmb3JtKCdURVNUJyk7XHJcbiAgICAgICAgZXhwZWN0KHJlZi5tYXJrRm9yQ2hlY2spLnRvSGF2ZUJlZW5DYWxsZWQoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgdHJhbnNsYXRlIGEgc3RyaW5nIHdpdGggb2JqZWN0IHBhcmFtZXRlcnMnLCAoKSA9PiB7XHJcbiAgICAgICAgdHJhbnNsYXRlLnNldFRyYW5zbGF0aW9uKCdlbicsIHtcIlRFU1RcIjogXCJUaGlzIGlzIGEgdGVzdCB7e3BhcmFtfX1cIn0pO1xyXG4gICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcblxyXG4gICAgICAgIGV4cGVjdCh0cmFuc2xhdGVQaXBlLnRyYW5zZm9ybSgnVEVTVCcsIHtwYXJhbTogXCJ3aXRoIHBhcmFtXCJ9KSkudG9FcXVhbChcIlRoaXMgaXMgYSB0ZXN0IHdpdGggcGFyYW1cIik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHRyYW5zbGF0ZSBhIHN0cmluZyB3aXRoIG9iamVjdCBhcyBzdHJpbmcgcGFyYW1ldGVycycsICgpID0+IHtcclxuICAgICAgICB0cmFuc2xhdGUuc2V0VHJhbnNsYXRpb24oJ2VuJywge1wiVEVTVFwiOiBcIlRoaXMgaXMgYSB0ZXN0IHt7cGFyYW19fVwifSk7XHJcbiAgICAgICAgdHJhbnNsYXRlLnVzZSgnZW4nKTtcclxuXHJcbiAgICAgICAgZXhwZWN0KHRyYW5zbGF0ZVBpcGUudHJhbnNmb3JtKCdURVNUJywgJ3twYXJhbTogXCJ3aXRoIHBhcmFtXCJ9JykpLnRvRXF1YWwoXCJUaGlzIGlzIGEgdGVzdCB3aXRoIHBhcmFtXCIpO1xyXG4gICAgICAgIGV4cGVjdCh0cmFuc2xhdGVQaXBlLnRyYW5zZm9ybSgnVEVTVCcsICd7XCJwYXJhbVwiOiBcIndpdGggcGFyYW1cIn0nKSkudG9FcXVhbChcIlRoaXMgaXMgYSB0ZXN0IHdpdGggcGFyYW1cIik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHVwZGF0ZSB0aGUgdmFsdWUgd2hlbiB0aGUgcGFyYW1ldGVycyBjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgICAgdHJhbnNsYXRlLnNldFRyYW5zbGF0aW9uKCdlbicsIHtcIlRFU1RcIjogXCJUaGlzIGlzIGEgdGVzdCB7e3BhcmFtfX1cIn0pO1xyXG4gICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcblxyXG4gICAgICAgIHNweU9uKHRyYW5zbGF0ZVBpcGUsICd1cGRhdGVWYWx1ZScpLmFuZC5jYWxsVGhyb3VnaCgpO1xyXG4gICAgICAgIHNweU9uKHJlZiwgJ21hcmtGb3JDaGVjaycpLmFuZC5jYWxsVGhyb3VnaCgpO1xyXG5cclxuICAgICAgICBleHBlY3QodHJhbnNsYXRlUGlwZS50cmFuc2Zvcm0oJ1RFU1QnLCB7cGFyYW06IFwid2l0aCBwYXJhbVwifSkpLnRvRXF1YWwoXCJUaGlzIGlzIGEgdGVzdCB3aXRoIHBhcmFtXCIpO1xyXG4gICAgICAgIC8vIHNhbWUgdmFsdWUsIHNob3VsZG4ndCBjYWxsICd1cGRhdGVWYWx1ZScgYWdhaW5cclxuICAgICAgICBleHBlY3QodHJhbnNsYXRlUGlwZS50cmFuc2Zvcm0oJ1RFU1QnLCB7cGFyYW06IFwid2l0aCBwYXJhbVwifSkpLnRvRXF1YWwoXCJUaGlzIGlzIGEgdGVzdCB3aXRoIHBhcmFtXCIpO1xyXG4gICAgICAgIC8vIGRpZmZlcmVudCBwYXJhbSwgc2hvdWxkIGNhbGwgJ3VwZGF0ZVZhbHVlJ1xyXG4gICAgICAgIGV4cGVjdCh0cmFuc2xhdGVQaXBlLnRyYW5zZm9ybSgnVEVTVCcsIHtwYXJhbTogXCJ3aXRoIHBhcmFtMlwifSkpLnRvRXF1YWwoXCJUaGlzIGlzIGEgdGVzdCB3aXRoIHBhcmFtMlwiKTtcclxuICAgICAgICBleHBlY3QodHJhbnNsYXRlUGlwZS51cGRhdGVWYWx1ZSkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDIpO1xyXG4gICAgICAgIGV4cGVjdChyZWYubWFya0ZvckNoZWNrKS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdChcInNob3VsZCB0aHJvdyBpZiB5b3UgZG9uJ3QgZ2l2ZSBhbiBvYmplY3QgcGFyYW1ldGVyXCIsICgpID0+IHtcclxuICAgICAgICB0cmFuc2xhdGUuc2V0VHJhbnNsYXRpb24oJ2VuJywge1wiVEVTVFwiOiBcIlRoaXMgaXMgYSB0ZXN0IHt7cGFyYW19fVwifSk7XHJcbiAgICAgICAgdHJhbnNsYXRlLnVzZSgnZW4nKTtcclxuICAgICAgICBsZXQgcGFyYW0gPSAncGFyYW06IFwid2l0aCBwYXJhbVwiJztcclxuXHJcbiAgICAgICAgZXhwZWN0KCgpID0+IHtcclxuICAgICAgICAgICAgdHJhbnNsYXRlUGlwZS50cmFuc2Zvcm0oJ1RFU1QnLCBwYXJhbSk7XHJcbiAgICAgICAgfSkudG9UaHJvd0Vycm9yKGBXcm9uZyBwYXJhbWV0ZXIgaW4gVHJhbnNsYXRlUGlwZS4gRXhwZWN0ZWQgYSB2YWxpZCBPYmplY3QsIHJlY2VpdmVkOiAke3BhcmFtfWApXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnc2hvdWxkIHVwZGF0ZSB0cmFuc2xhdGlvbnMgb24gdHJhbnNsYXRpb24gYnkga2V5IGNoYW5nZScsICgpID0+IHtcclxuICAgICAgICBpdCgnd2l0aCBzdGF0aWMgbG9hZGVyJywgKGRvbmUpID0+IHtcclxuICAgICAgICAgICAgdHJhbnNsYXRlLnNldFRyYW5zbGF0aW9uKCdlbicsIHtcIlRFU1RcIjogXCJUaGlzIGlzIGEgdGVzdFwifSk7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3QodHJhbnNsYXRlUGlwZS50cmFuc2Zvcm0oJ1RFU1QnKSkudG9FcXVhbChcIlRoaXMgaXMgYSB0ZXN0XCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gdGhpcyB3aWxsIGJlIHJlc29sdmVkIGF0IHRoZSBuZXh0IGtleSdzIHRyYW5zbGF0aW9uIGNoYW5nZVxyXG4gICAgICAgICAgICBsZXQgc3Vic2NyaXB0aW9uID0gdHJhbnNsYXRlLm9uVHJhbnNsYXRpb25DaGFuZ2Uuc3Vic2NyaWJlKFxyXG4gICAgICAgICAgICAgICAgKHJlczogVHJhbnNsYXRpb25DaGFuZ2VFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdChyZXMudHJhbnNsYXRpb25zWydURVNUJ10pLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0KHJlcy50cmFuc2xhdGlvbnNbJ1RFU1QnXSkudG9FcXVhbChcIlRoaXMgaXMgbmV3IHRlc3QgdmFsdWVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0KHRyYW5zbGF0ZVBpcGUudHJhbnNmb3JtKCdURVNUJykpLnRvRXF1YWwoXCJUaGlzIGlzIG5ldyB0ZXN0IHZhbHVlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdHJhbnNsYXRlLnNldCgnVEVTVCcsICdUaGlzIGlzIG5ldyB0ZXN0IHZhbHVlJywgJ2VuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnc2hvdWxkIHVwZGF0ZSB0cmFuc2xhdGlvbnMgb24gbGFuZyBjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgICAgaXQoJ3dpdGggc3RhdGljIGxvYWRlcicsIChkb25lKSA9PiB7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZS5zZXRUcmFuc2xhdGlvbignZW4nLCB7XCJURVNUXCI6IFwiVGhpcyBpcyBhIHRlc3RcIn0pO1xyXG4gICAgICAgICAgICB0cmFuc2xhdGUuc2V0VHJhbnNsYXRpb24oJ2ZyJywge1wiVEVTVFwiOiBcIkMnZXN0IHVuIHRlc3RcIn0pO1xyXG4gICAgICAgICAgICB0cmFuc2xhdGUudXNlKCdlbicpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHRyYW5zbGF0ZVBpcGUudHJhbnNmb3JtKCdURVNUJykpLnRvRXF1YWwoXCJUaGlzIGlzIGEgdGVzdFwiKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHRoaXMgd2lsbCBiZSByZXNvbHZlZCBhdCB0aGUgbmV4dCBsYW5nIGNoYW5nZVxyXG4gICAgICAgICAgICBsZXQgc3Vic2NyaXB0aW9uID0gdHJhbnNsYXRlLm9uTGFuZ0NoYW5nZS5zdWJzY3JpYmUoKHJlczogTGFuZ0NoYW5nZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QocmVzLmxhbmcpLnRvRXF1YWwoJ2ZyJyk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QodHJhbnNsYXRlUGlwZS50cmFuc2Zvcm0oJ1RFU1QnKSkudG9FcXVhbChcIkMnZXN0IHVuIHRlc3RcIik7XHJcbiAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICAgICAgICAgIGRvbmUoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0cmFuc2xhdGUudXNlKCdmcicpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnd2l0aCBmaWxlIGxvYWRlcicsIChkb25lKSA9PiB7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0ZS51c2UoJ2VuJyk7XHJcbiAgICAgICAgICAgIG1vY2tCYWNrZW5kUmVzcG9uc2UoY29ubmVjdGlvbiwgJ3tcIlRFU1RcIjogXCJUaGlzIGlzIGEgdGVzdFwifScpO1xyXG4gICAgICAgICAgICBleHBlY3QodHJhbnNsYXRlUGlwZS50cmFuc2Zvcm0oJ1RFU1QnKSkudG9FcXVhbChcIlRoaXMgaXMgYSB0ZXN0XCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gdGhpcyB3aWxsIGJlIHJlc29sdmVkIGF0IHRoZSBuZXh0IGxhbmcgY2hhbmdlXHJcbiAgICAgICAgICAgIGxldCBzdWJzY3JpcHRpb24gPSB0cmFuc2xhdGUub25MYW5nQ2hhbmdlLnN1YnNjcmliZSgocmVzOiBMYW5nQ2hhbmdlRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIGxldCBpdCB1cGRhdGUgdGhlIHRyYW5zbGF0aW9uc1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0KHJlcy5sYW5nKS50b0VxdWFsKCdmcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdCh0cmFuc2xhdGVQaXBlLnRyYW5zZm9ybSgnVEVTVCcpKS50b0VxdWFsKFwiQydlc3QgdW4gdGVzdFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0cmFuc2xhdGUudXNlKCdmcicpO1xyXG4gICAgICAgICAgICBtb2NrQmFja2VuZFJlc3BvbnNlKGNvbm5lY3Rpb24sIGB7XCJURVNUXCI6IFwiQydlc3QgdW4gdGVzdFwifWApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iXX0=