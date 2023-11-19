"use client";

import { Heading } from "@/components/Heading";
import { CreateNuisanceTypeForm } from "@/components/admin/CreateNuisanceTypeForm";

export default function() {

    return <div>
        <Heading level={1} className="mb-4">Nouveau type de nuisance</Heading>
        <CreateNuisanceTypeForm/>
    </div>
}