import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function AppSelect({
    value,
    onValueChange,
    placeholder = "Select an option",
    options = [],
    disabled = false,
    className = "",
    icon: Icon = null
}) {
    const selected = options.find((opt) => String(opt.value) === String(value));

    return (
        <Listbox value={value} onChange={onValueChange} disabled={disabled}>
            {({ open }) => (
                <div
                    className={cn(
                        "relative w-full",
                        open ? "z-[220]" : "z-10",
                        className
                    )}
                >
                    <div className="relative">
                        <Listbox.Button
                            className={cn(
                                "input-premium flex h-12 w-full items-center justify-between gap-3 pr-11 text-left",
                                disabled ? "cursor-not-allowed opacity-60" : ""
                            )}
                        >
                            <span className="flex min-w-0 items-center gap-3">
                                {Icon ? (
                                    <Icon size={16} className="shrink-0 text-muted-foreground" />
                                ) : null}

                                <span
                                    className={cn(
                                        "truncate text-sm",
                                        selected ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    {selected?.label || placeholder}
                                </span>
                            </span>

                            <ChevronDown
                                size={16}
                                className={cn(
                                    "shrink-0 text-muted-foreground transition-transform duration-200",
                                    open ? "rotate-180" : ""
                                )}
                            />
                        </Listbox.Button>

                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                            enter="transition ease-out duration-150"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                        >
                            <Listbox.Options
                                className={cn(
                                    "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[230]",
                                    "max-h-72 overflow-auto rounded-[1.25rem] border border-white/10",
                                    "bg-[#151821] shadow-[0_18px_50px_rgba(0,0,0,0.45)]",
                                    "p-1 outline-none premium-scrollbar"
                                )}
                            >
                                {options.length ? (
                                    options.map((option) => (
                                        <Listbox.Option
                                            key={String(option.value)}
                                            value={option.value}
                                            className={({ active, selected }) =>
                                                cn(
                                                    "relative cursor-pointer select-none rounded-[1rem] px-4 py-3 pr-10 text-sm transition",
                                                    active
                                                        ? "bg-white/[0.06] text-white"
                                                        : "text-white/85",
                                                    selected ? "bg-accent/20 text-white" : ""
                                                )
                                            }
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span className="block truncate font-medium">
                                                        {option.label}
                                                    </span>

                                                    {selected ? (
                                                        <span className="absolute inset-y-0 right-3 flex items-center text-accent">
                                                            <Check size={16} />
                                                        </span>
                                                    ) : null}
                                                </>
                                            )}
                                        </Listbox.Option>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-muted-foreground">
                                        No options available
                                    </div>
                                )}
                            </Listbox.Options>
                        </Transition>
                    </div>
                </div>
            )}
        </Listbox>
    );
}