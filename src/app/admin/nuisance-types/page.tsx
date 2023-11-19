import { Heading } from "@/components/Heading";
import { Cursor } from "@/lib/utils/cursor"
import { countNuisanceTypesBy, findNuisanceTypesBy } from "@/actions/nuisance-types/actions";
import { ButtonLink } from "@/components/common/ButtonLink";
import { PlusIcon } from "@heroicons/react/20/solid";
import { NuisanceTypePage } from "./list";

export default async function Page({searchParams}: {
    params: { slug: string }
    searchParams: { [key: string]: string | string[] | undefined }
  }) {
    let cursor: Cursor = {page: Number(searchParams.page) || 0, size: Number(searchParams.size) || 20};
    
    const page = await findNuisanceTypesBy({}, cursor)
    const count = await countNuisanceTypesBy({});

    return <>
        <div className="flex flex-row items-center mb-4">
            <Heading className="grow" level={1}>Types de nuisance</Heading>
            <ButtonLink href="/admin/nuisance-types/create" className="flex items-center">
                <PlusIcon className="h-5 w-5 mr-2"/> 
                <span>Créer</span>
            </ButtonLink>
        </div>
        <NuisanceTypePage page={page} cursor={cursor} count={count}/>
    </>
}