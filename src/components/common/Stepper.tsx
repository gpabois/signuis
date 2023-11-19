export type StepProps = {
    children: React.ReactNode,
    className?: string,
    id: number
    current: number
    last?: boolean
}
export function Step(props: StepProps) {

    return <li className={`
            flex items-center
             ${props.className}
             ${props.id == props.current && "text-blue-600 dark:text-blue-500"} 
             ${props.last ? `` : `
                md:w-full
                sm:after:content-[''] 
                after:w-full 
                after:h-1 
                after:border-b 
                after:border-gray-200 after:border-1 
                after:hidden 
                dark:after:border-gray-700
                sm:after:inline-block 
                after:mx-6 
                xl:after:mx-10`}
        `}>
        {props.last ? props.children: 
        <span className="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
            {props.children}
        </span>
        }
    </li>
}

export type StepperProps = {
    current: number,
    children: React.ReactNode
}
export function Stepper(props: StepperProps) {
    return <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
        {props.children}
    </ol>
}