import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the SanitizeUrlPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'sanitizeUrl',
})
export class SanitizeUrlPipe implements PipeTransform {
  /**
   * Takes a url and sanitize it
   */
  private win: any = window;

  constructor(private sanitizer: DomSanitizer) { }

  transform(url: string, ...args) {
    if (url) {
      if (url.indexOf('assets/imgs') != -1) {
        return url;
      } else {
        if (url.indexOf('file://') == -1 && url.indexOf('http') == -1) {
          url = 'file://' + url;
          return this.win.Ionic.WebView.convertFileSrc(url).replace('_//', "_/");
        } else if (url.indexOf('cdvfile') != -1) {
          return this.win.Ionic.WebView.convertFileSrc(url.replace('cdvfile://localhost/persistent/', 'file://')).replace('_//', "_/");
        } else {
          return this.sanitizer.bypassSecurityTrustResourceUrl(this.win.Ionic.WebView.convertFileSrc(url).replace('_//', "_/"));
        }
      }
    } else {
      return '';
    }

  }
}
