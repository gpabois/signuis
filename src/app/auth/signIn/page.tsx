import { Input } from "@/components/common/forms/Input";
import { SignInForm } from "./form";

export default async function Page () {
    return <section className="
        bg-gray-200
    ">
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" className="flex items-center mb-6 text-4xl font-semibold text-gray-900">
            Signuis    
        </a>
        <div className="w-full 
                bg-gray-50
                dark:bg-slate-800
                border-primary-100 
                rounded-lg shadow-lg md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
                    Se connecter
                </h1>
                <SignInForm />
            </div>
        </div>
    </div>
  </section>
}