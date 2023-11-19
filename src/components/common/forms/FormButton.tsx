import { useFormStatus } from "react-dom";
import { Button, ButtonProps } from "../Button";

export interface FormButtonProps extends ButtonProps {}
export function FormButton(props: FormButtonProps) {
    const status = useFormStatus();
    return <Button loading={status.pending} {...props}>{props.children}</Button>
  }