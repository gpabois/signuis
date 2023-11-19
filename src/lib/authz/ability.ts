import { defineAbility } from '@casl/ability';
import { User } from '@/lib/model';

export const bindAbility = (user?: User) => defineAbility((can) => {
  
    if (!user) {
        can('create', 'report');
        return;
    }

    if(user.role == "admin") {
        can('access', "administration")
        can('create', 'nuisance-type')
        can('update', 'nuisance-type')
        can('edit', 'nuisance-type')
        can('delete', 'nuisance-type')
    }
  });