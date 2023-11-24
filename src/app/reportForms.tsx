import { CreateReport, NuisanceType, NuisanceTypeFamilies, Report } from "@/lib/model";
import { useEffect, useMemo, useState } from "react";
import { Step, Stepper } from "../components/common/Stepper";
import { Select, SelectOption } from "@/components/common/forms/Select";
import { Button } from "../components/common/Button";
import { Range } from "@/components/common/forms/Range";
import { FeatureCollection, Point } from "geojson";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, CheckIcon, MegaphoneIcon, XCircleIcon } from "@heroicons/react/20/solid";
import useSWRMutation from "swr/mutation";
import createReport from "./actions";
import { isSuccessful } from "@/lib/result";

export async function getNearest(point: Point): Promise<string> {
    const url = `https://api-adresse.data.gouv.fr/reverse/?lat=${point.coordinates[1]}&lon=${point.coordinates[0]}`
    const resp = await fetch(url);
    const result = (await resp.json()) as FeatureCollection
    return result.features[0].properties?.label || ""
}

export type CreateReportFormProps = {
    report: Partial<CreateReport>,
    nuisanceTypes?: Array<NuisanceType>,
    onReportCreated?: (report: Report) => void
}

export function CreateReportForm(props: CreateReportFormProps) {
    const [isReporting, setIsReporting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const [nuisanceTypes, setNuisanceTypes] = useState(props.nuisanceTypes || []);
    const [report, setReport] = useState(props.report);
    const [nearest, setNearest] = useState("inconnu");
    
    props.report?.location && getNearest(props.report?.location).then(setNearest);

    useEffect(() => {
        props.report?.location && getNearest(props.report?.location).then(setNearest);
    }, [props.report?.location])

    useEffect(() => {
        setReport(r => ({...r, location: props.report.location}))
    }, [props.report?.location])

    const intensityLabel = useMemo(() => {
        const rnk = Math.round((report?.intensity || -1) / 2) - 1;
        const labels = ["Très faible", "Faible", "Modéré", "Fort", "Très fort"]
        return labels[rnk]
    }, [report?.intensity])

    const nuisanceTypeLabel = useMemo(() => {
        return nuisanceTypes.filter((n) => n.id == report?.nuisanceTypeId).at(0)?.label;
    }, [report?.nuisanceTypeId])

    async function sendReport() {
        if(!report) return;

        try {
            setIsReporting(true);
            const result = await createReport(report);

            if(isSuccessful(result)) {
                props.onReportCreated?.(result.data);
            } else {
                setFieldErrors(result.error.fieldErrors);
            }
        } finally {
            setIsReporting(false);
        }

    }

    return <div>
        <Stepper current={currentStep}>
            <Step id={1} current={currentStep}>
                <span className="me-2">1</span>
                Type
            </Step>
            <Step id={2} current={currentStep}>
                <span className="me-2">2</span>
                Intensité
            </Step>
            <Step id={3} current={currentStep} last={true}>
                <span className="me-2">3</span>
                Confirmation
            </Step>
        </Stepper>
        <div className="my-6">
            <div className={`${currentStep == 1 ? '' : 'hidden'} flex flex-row items-center w-full`}>
                <Select fieldErrors={fieldErrors} className="grow" name="nuisanceTypeId" onValueChanged={(family) => setNuisanceTypes(props.nuisanceTypes?.filter(n => n.family === family))}>
                    <SelectOption label="---"></SelectOption>
                {NuisanceTypeFamilies.map(({value, label}) => 
                    <SelectOption key={`nuisance-type-family-${value}`} value={value} label={label}/>
                )}
                </Select>    
                <ArrowRightIcon className="w-5 h-5 mx-2"/>            
                <Select fieldErrors={fieldErrors} className="grow" name="nuisanceTypeId" onValueChanged={(nuisanceTypeId) => setReport(r => ({...r, nuisanceTypeId}))}>
                    <SelectOption label="---"></SelectOption>
                {nuisanceTypes.map(n => 
                    <SelectOption key={`nuisance-type-${n.id}`} value={n.id} label={n.label}/>
                )}
                </Select>
                <Button disabled={report?.nuisanceTypeId === undefined} className="ml-2" onClick={() => setCurrentStep(i => i+1)}>Suivant</Button>
            </div>
            <div className={`${currentStep == 2 ? '' : 'hidden'} flex flex-row items-center w-full`}>
                <Range fieldErrors={fieldErrors} className="w-full" min={1} max={10} step={1} name="intensity" onValueChanged={(intensity) => setReport(r => ({...r, intensity}))}/>
                <Button className="ml-2" onClick={() => setCurrentStep(i => i-1)}>Précédent</Button>
                <Button className="ml-2" onClick={() => setCurrentStep(i => i+1)}>Suivant</Button>
            </div>
            <div className={`${currentStep == 3 ? '' : 'hidden'} flex flex-row w-full items-center`}>
                <div className="flex flex-col w-full h-full">
                    <div className="flex flex-row items-center w-full">
                        {report?.nuisanceTypeId ? <CheckCircleIcon className="text-blue-500 h-5 w-5"/> : <XCircleIcon className="text-red-600 h-5 w-5" />}
                        <span className="mx-2">Type:</span> 
                        <span>{nuisanceTypeLabel || <span className="text-red-500 font-bold">manquant</span>}</span> 
                    </div>
                    <div className="flex flex-row items-center w-full">
                        {report?.intensity ? <CheckCircleIcon className="text-blue-500 h-5 w-5"/> : <XCircleIcon className="text-red-600 h-5 w-5" />}
                        <span className="mx-2">Intensité:</span>
                        <span>{intensityLabel || <span className="text-red-500 font-bold">manquant</span>}</span> 
                    </div>
                    <div className="flex flex-row items-center w-full">
                        {report?.location ? <CheckCircleIcon className="text-blue-500 h-5 w-5"/> : <XCircleIcon className="text-red-600 h-5 w-5" />}
                        <span className="mx-2">Localisation:</span>
                        <span>Près de {nearest}</span>
                    </div>
                </div>
                <Button className="ml-2" onClick={() => setCurrentStep(i => i-1)}>Précédent</Button>
                <Button loading={isReporting} className="ml-2" onClick={sendReport}><MegaphoneIcon className="h-5 w-5"/></Button>
            </div>
        </div>

    </div>
}