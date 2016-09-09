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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var translate_pipe_1 = require("./src/translate.pipe");
var translate_service_1 = require("./src/translate.service");
__export(require("./src/translate.pipe"));
__export(require("./src/translate.service"));
__export(require("./src/translate.parser"));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    pipes: [translate_pipe_1.TranslatePipe],
    providers: [translate_service_1.TranslateService]
};
function translateLoaderFactory(http) {
    return new translate_service_1.TranslateStaticLoader(http);
}
exports.translateLoaderFactory = translateLoaderFactory;
var TranslateModule = (function () {
    function TranslateModule() {
    }
    TranslateModule.forRoot = function (providedLoader) {
        if (providedLoader === void 0) { providedLoader = {
            provide: translate_service_1.TranslateLoader,
            useFactory: translateLoaderFactory,
            deps: [http_1.Http]
        }; }
        return {
            ngModule: TranslateModule,
            providers: [providedLoader, translate_service_1.TranslateService]
        };
    };
    TranslateModule = __decorate([
        core_1.NgModule({
            imports: [http_1.HttpModule],
            declarations: [
                translate_pipe_1.TranslatePipe
            ],
            exports: [
                http_1.HttpModule,
                translate_pipe_1.TranslatePipe
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], TranslateModule);
    return TranslateModule;
}());
exports.TranslateModule = TranslateModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXRyYW5zbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm5nMi10cmFuc2xhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLHFCQUE0QyxlQUFlLENBQUMsQ0FBQTtBQUM1RCxxQkFBK0IsZUFBZSxDQUFDLENBQUE7QUFDL0MsK0JBQTRCLHNCQUFzQixDQUFDLENBQUE7QUFDbkQsa0NBQXVFLHlCQUF5QixDQUFDLENBQUE7QUFFakcsaUJBQWMsc0JBQXNCLENBQUMsRUFBQTtBQUNyQyxpQkFBYyx5QkFBeUIsQ0FBQyxFQUFBO0FBQ3hDLGlCQUFjLHdCQUF3QixDQUFDLEVBQUE7QUFHdkM7a0JBQWU7SUFDWCxLQUFLLEVBQUUsQ0FBQyw4QkFBYSxDQUFDO0lBQ3RCLFNBQVMsRUFBRSxDQUFDLG9DQUFnQixDQUFDO0NBQ2hDLENBQUM7QUFFRixnQ0FBdUMsSUFBVTtJQUM3QyxNQUFNLENBQUMsSUFBSSx5Q0FBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRmUsOEJBQXNCLHlCQUVyQyxDQUFBO0FBWUQ7SUFBQTtJQVdBLENBQUM7SUFWVSx1QkFBTyxHQUFkLFVBQWUsY0FJZDtRQUpjLDhCQUlkLEdBSmM7WUFDWCxPQUFPLEVBQUUsbUNBQWU7WUFDeEIsVUFBVSxFQUFFLHNCQUFzQjtZQUNsQyxJQUFJLEVBQUUsQ0FBQyxXQUFJLENBQUM7U0FDZjtRQUNHLE1BQU0sQ0FBQztZQUNILFFBQVEsRUFBRSxlQUFlO1lBQ3pCLFNBQVMsRUFBRSxDQUFDLGNBQWMsRUFBRSxvQ0FBZ0IsQ0FBQztTQUNoRCxDQUFDO0lBQ04sQ0FBQztJQXBCTDtRQUFDLGVBQVEsQ0FBQztZQUNOLE9BQU8sRUFBRSxDQUFDLGlCQUFVLENBQUM7WUFDckIsWUFBWSxFQUFFO2dCQUNWLDhCQUFhO2FBQ2hCO1lBQ0QsT0FBTyxFQUFFO2dCQUNMLGlCQUFVO2dCQUNWLDhCQUFhO2FBQ2hCO1NBQ0osQ0FBQzs7dUJBQUE7SUFZRixzQkFBQztBQUFELENBQUMsQUFYRCxJQVdDO0FBWFksdUJBQWUsa0JBVzNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nTW9kdWxlLCBNb2R1bGVXaXRoUHJvdmlkZXJzfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQge0h0dHAsIEh0dHBNb2R1bGV9IGZyb20gXCJAYW5ndWxhci9odHRwXCI7XHJcbmltcG9ydCB7VHJhbnNsYXRlUGlwZX0gZnJvbSBcIi4vc3JjL3RyYW5zbGF0ZS5waXBlXCI7XHJcbmltcG9ydCB7VHJhbnNsYXRlU2VydmljZSwgVHJhbnNsYXRlTG9hZGVyLCBUcmFuc2xhdGVTdGF0aWNMb2FkZXJ9IGZyb20gXCIuL3NyYy90cmFuc2xhdGUuc2VydmljZVwiO1xyXG5cclxuZXhwb3J0ICogZnJvbSBcIi4vc3JjL3RyYW5zbGF0ZS5waXBlXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3NyYy90cmFuc2xhdGUuc2VydmljZVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9zcmMvdHJhbnNsYXRlLnBhcnNlclwiO1xyXG5cclxuLy8gZm9yIGFuZ3VsYXItY2xpXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICAgIHBpcGVzOiBbVHJhbnNsYXRlUGlwZV0sXHJcbiAgICBwcm92aWRlcnM6IFtUcmFuc2xhdGVTZXJ2aWNlXVxyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZUxvYWRlckZhY3RvcnkoaHR0cDogSHR0cCkge1xyXG4gICAgcmV0dXJuIG5ldyBUcmFuc2xhdGVTdGF0aWNMb2FkZXIoaHR0cCk7XHJcbn1cclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBpbXBvcnRzOiBbSHR0cE1vZHVsZV0sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtcclxuICAgICAgICBUcmFuc2xhdGVQaXBlXHJcbiAgICBdLFxyXG4gICAgZXhwb3J0czogW1xyXG4gICAgICAgIEh0dHBNb2R1bGUsIC8vIHRvZG8gcmVtb3ZlIHRoaXMgd2hlbiByZW1vdmluZyB0aGUgbG9hZGVyIGZyb20gY29yZVxyXG4gICAgICAgIFRyYW5zbGF0ZVBpcGVcclxuICAgIF1cclxufSlcclxuZXhwb3J0IGNsYXNzIFRyYW5zbGF0ZU1vZHVsZSB7XHJcbiAgICBzdGF0aWMgZm9yUm9vdChwcm92aWRlZExvYWRlcjogYW55ID0ge1xyXG4gICAgICAgIHByb3ZpZGU6IFRyYW5zbGF0ZUxvYWRlcixcclxuICAgICAgICB1c2VGYWN0b3J5OiB0cmFuc2xhdGVMb2FkZXJGYWN0b3J5LFxyXG4gICAgICAgIGRlcHM6IFtIdHRwXVxyXG4gICAgfSk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5nTW9kdWxlOiBUcmFuc2xhdGVNb2R1bGUsXHJcbiAgICAgICAgICAgIHByb3ZpZGVyczogW3Byb3ZpZGVkTG9hZGVyLCBUcmFuc2xhdGVTZXJ2aWNlXVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuIl19