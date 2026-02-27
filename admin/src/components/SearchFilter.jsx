import { useRef } from "react";
import { SearchIcon, XIcon } from "lucide-react";

export default function SearchAndFilter({
    query,
    setQuery,
    filterGroups = [],
    activeFilters = {},
    setFilter,
    clearAll,
    activeCount = 0,
    placeholder = "Buscar...",
    resultCount,
    totalCount,
}) {
    return (
        <div className="flex flex-col gap-3">

            {/* Search bar */}
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-base-200 p-1.5 rounded-full">
                    <SearchIcon className="size-4 text-base-content/50" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="input input-bordered w-full pl-11 pr-8 text-sm rounded-2xl"
                />
                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                    >
                        <XIcon className="size-3.5" />
                    </button>
                )}
            </div>

            {/* Filter tag rows */}
            {filterGroups.map((group) => (
                <FilterRow
                    key={group.key}
                    options={group.options}
                    active={activeFilters[group.key] ?? "__all__"}
                    onSelect={(value) => setFilter(group.key, value)}
                />
            ))}

            {/* Result count */}
            {resultCount !== undefined && totalCount !== undefined && (
                <p className="text-xs text-base-content/50">
                    {resultCount === totalCount
                        ? `${totalCount} resultado(s)`
                        : `${resultCount} de ${totalCount} resultado(s)`}
                </p>
            )}
        </div>
    );
}

function FilterRow({ options, active, onSelect }) {
    const rowRef = useRef(null);

    return (
        <div
            ref={rowRef}
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
            {options.map((opt) => {
                const isActive =
                    active === opt.value ||
                    (opt.value === "__all__" && (!active || active === "__all__"));
                return (
                    <button
                        key={opt.value}
                        onClick={() => onSelect(opt.value)}
                        className={`
                            shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap
                            ${isActive
                                ? opt.activeClass
                                    ? opt.activeClass
                                    : "bg-primary text-white border-primary"
                                : "bg-base-100 border-base-300 text-base-content/60 hover:bg-base-200"
                            }
                        `}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
