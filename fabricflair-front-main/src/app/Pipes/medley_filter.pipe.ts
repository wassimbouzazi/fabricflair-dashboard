import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'medleyfilter',
    pure: false
})
export class MedleyFilterPipe implements PipeTransform {
    transform(items: any[], filter: any): any {
        if (!items || !filter || filter.title.length == 0) {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => item.title.toUpperCase().indexOf(filter.title.toUpperCase()) !== -1);
    }
}