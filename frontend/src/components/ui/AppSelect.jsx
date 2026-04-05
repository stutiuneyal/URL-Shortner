import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";
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
    buttonClassName = "",
    optionsClassName = "",
    optionClassName = "",
    icon: Icon
}) {
    const normalizedValue = value == null ? "" : String(value);
    const selected = options.find(
        (opt) => String(opt.value) === normalizedValue
    );

    return (
        <div className={cn("relative w-full", className)}>
            <Listbox
                value={normalizedValue}
                onChange={onValueChange}
                disabled={disabled}
            >
                <div className="relative">
                    <Listbox.Button
                        className={cn(
                            "w-full h-11 rounded-2xl border border-white/12 bg-white/[0.04] px-4 pr-10 text-left text-sm font-medium text-white backdrop-blur-xl transition",
                            "hover:border-white/20 hover:bg-white/[0.06]",
                            "focus:outline-none focus:ring-2 focus:ring-violet-500/30",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            buttonClassName
                        )}
                    >
                        <div className="flex min-w-0 items-center gap-2">
                            {Icon ? <Icon size={16} className="shrink-0 text-white/50" /> : null}
                            <span className={cn("block truncate", !selected && "text-white/45")}>
                                {selected ? selected.label : placeholder}
                            </span>
                        </div>

                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <ChevronDown size={16} className="text-white/50" />
                        </span>
                    </Listbox.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="opacity-0 scale-95 translate-y-1"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-75"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 scale-95 translate-y-1"
                    >
                        <Listbox.Options
                            className={cn(
                                "absolute z-[120] mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-white/10 bg-[#14151c]/95 py-2 shadow-2xl backdrop-blur-xl",
                                "focus:outline-none",
                                optionsClassName
                            )}
                        >
                            {options.length === 0 ? (
                                <div className="px-4 py-2 text-sm text-white/50">No options</div>
                            ) : (
                                options.map((option) => {
                                    const optionValue =
                                        option.value == null ? "" : String(option.value);

                                    return (
                                        <Listbox.Option
                                            key={`${optionValue}-${option.label}`}
                                            value={optionValue}
                                            className={({ active }) =>
                                                cn(
                                                    "relative mx-1 cursor-pointer select-none rounded-xl px-4 py-2 text-sm transition",
                                                    active
                                                        ? "bg-violet-500/20 text-white"
                                                        : "text-white/90",
                                                    optionClassName
                                                )
                                            }
                                        >
                                            {({ selected: isSelected }) => (
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="truncate">{option.label}</span>
                                                    {isSelected ? (
                                                        <Check size={14} className="shrink-0 text-violet-400" />
                                                    ) : null}
                                                </div>
                                            )}
                                        </Listbox.Option>
                                    );
                                })
                            )}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}