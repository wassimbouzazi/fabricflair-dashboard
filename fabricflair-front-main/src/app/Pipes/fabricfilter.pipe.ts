import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fabricfilter',
    pure: false
})
export class FabricFilterPipe implements PipeTransform {
    transform(items: any[], filter: any): any {
        if (!items || !filter || filter.exclusive == 'All' && filter.title.length == 0) {
            return items;
        }

        if (filter.exclusive == "All") {
            return items.filter(item => item.title.toUpperCase().indexOf(filter.title.toUpperCase()) !== -1);
        }

        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        
        // return items.filter(item => item.title.toUpperCase().indexOf(filter.title.toUpperCase()) !== -1);
        let searchedItems =  items.filter(item => item.title.toUpperCase().indexOf(filter.title.toUpperCase()) !== -1);

        return searchedItems.filter(item => item.exclusive == filter.exclusive)
    }
}