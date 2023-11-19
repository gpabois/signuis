export type HeadingProps = {
    level: number,
    className?: string,
    children: React.ReactNode
}
export function Heading(props: HeadingProps) {
    const className = "dark:text-white text-gray-700 font-bold";

    return <>
        {props.level === 1 && <h1 className={`${props.className} ${className} text-4xl`}>{props.children}</h1>}
        {props.level === 2 && <h2 className={`${props.className} ${className} text-3xl`}>{props.children}</h2>}
        {props.level === 3 && <h3 className={`${props.className} ${className} text-2xl`}>{props.children}</h3>}
        {props.level === 4 && <h4 className={`${props.className} ${className} text-xl`}>{props.children}</h4>}
    </>
}