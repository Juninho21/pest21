import { NgModule } from '@angular/core';
import { SanitizeHtmlPipe } from './sanitize-html/sanitize-html';
import { SanitizeUrlPipe } from './sanitize-url/sanitize-url';
@NgModule({
	declarations: [SanitizeUrlPipe, SanitizeHtmlPipe],
	imports: [],
	exports: [SanitizeUrlPipe, SanitizeHtmlPipe]
})
export class PipesModule { }
