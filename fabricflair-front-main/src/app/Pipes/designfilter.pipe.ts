import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'designfilter',
    pure: false
})
export class DesignFilterPipe implements PipeTransform {
    transform(items: any[], filter: any): any {
        if (!items || !filter || filter.pattern_name.length == 0) {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => item.pattern_name.toUpperCase().indexOf(filter.pattern_name.toUpperCase()) !== -1);
    }
}