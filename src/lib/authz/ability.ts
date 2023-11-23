import { defineAbility } from '@casl/ability';
import { User } from '@/lib/model';

export const bindAbility = (user?: User) => defineAbility((can) => {  
    // Anonymous user can only create report.
    if (!user) {
        can('create', 'report');
        return;
    }

    if(user.role == "admin") {
        can('access', "administration")

        // CRUD nuisance types
        can('create', 'nuisance-type')
        can('update', 'nuisance-type')
        can('edit', 'nuisance-type')
        can('delete', 'nuisance-type')

        // Access monitoring
        can('access', 'monitoring')
    }

    if(user.role == "monitor") {
        can('access', 'monitoring')
    }
});