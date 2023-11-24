import { FilterNuisanceType, InsertNuisanceType, CreateNuisanceType, NuisanceType, UpdateNuisanceType } from '@/lib/model';
import { Cursor } from '@/lib/utils/cursor';
import { Deletable, Insertable, Searchable, Updatable } from '../trait';

/**
 * Report repository
 */
export interface INuisanceTypeRepository 
        extends Insertable<string, InsertNuisanceType>,
                Updatable<string, UpdateNuisanceType>,
                Deletable<FilterNuisanceType>,
                Searchable<FilterNuisanceType, NuisanceType>

{
};