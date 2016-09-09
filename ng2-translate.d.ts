import { ModuleWithProviders } from "@angular/core";
import { Http } from "@angular/http";
import { TranslatePipe } from "./src/translate.pipe";
import { TranslateService, TranslateStaticLoader } from "./src/translate.service";
export * from "./src/translate.pipe";
export * from "./src/translate.service";
export * from "./src/translate.parser";
declare var _default: {
    pipes: typeof TranslatePipe[];
    providers: typeof TranslateService[];
};
export default _default;
export declare function translateLoaderFactory(http: Http): TranslateStaticLoader;
export declare class TranslateModule {
    static forRoot(providedLoader?: any): ModuleWithProviders;
}
