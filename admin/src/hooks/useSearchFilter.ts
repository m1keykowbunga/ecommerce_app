import { useState, useMemo } from "react";

export interface FilterOption {
    label: string;
    value: string;
    activeClass?: string;
}

export interface FilterGroup {
    key: string;
    options: FilterOption[];
}

interface UseSearchFilterProps<T> {
    data: T[];
    searchFields: string[];
    filterGroups?: FilterGroup[];
}

interface UseSearchFilterReturn<T> {
    filtered: T[];
    query: string;
    setQuery: (query: string) => void;
    activeFilters: Record<string, string>;
    setFilter: (key: string, value: string) => void;
    clearAll: () => void;
    activeCount: number;
}

export function useSearchFilter<T extends Record<string, unknown>>({
    data = [],
    searchFields = [],
    filterGroups = [],
}: UseSearchFilterProps<T>): UseSearchFilterReturn<T> {
    const [query, setQuery] = useState<string>("");
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    const filtered = useMemo<T[]>(() => {
        let result = data;

        if (query.trim()) {
            const q = query.trim().toLowerCase();
            result = result.filter((item) =>
                searchFields.some((field) => {
                    const val = field
                        .split(".")
                        .reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], item);
                    return String(val ?? "").toLowerCase().includes(q);
                })
            );
        }

        Object.entries(activeFilters).forEach(([key, value]) => {
            if (!value || value === "__all__") return;
            result = result.filter((item) => {
                const val = key
                    .split(".")
                    .reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], item);
                return String(val ?? "").toLowerCase() === value.toLowerCase();
            });
        });

        return result;
    }, [data, query, activeFilters, searchFields]);

    const setFilter = (key: string, value: string): void =>
        setActiveFilters((prev) => ({ ...prev, [key]: value }));

    const clearAll = (): void => {
        setQuery("");
        setActiveFilters({});
    };

    const activeCount: number =
        Object.values(activeFilters).filter((v) => v && v !== "__all__").length +
        (query.trim() ? 1 : 0);

    return { filtered, query, setQuery, activeFilters, setFilter, clearAll, activeCount };
}